import mongoose from 'mongoose';
import Cart from '../models/cartModel.js';
import Box from '../models/boxModel.js';
import HttpError from '../utils/httpError.js';

const normalizeCartQuantity = (quantity) => {
  const value = Number(quantity);
  if (!Number.isInteger(value)) throw new HttpError(400, 'Quantity must be an integer');
  if (value < 1) throw new HttpError(400, 'Quantity must be at least 1');
  return value;
};

const assertStockAvailable = (box, quantity) => {
  if (box.quantity <= 0) throw new HttpError(400, 'Box is out of stock');
  if (quantity > box.quantity) {
    throw new HttpError(400, 'Requested quantity exceeds available stock');
  }
};

const getProductId = (item) => item.productId._id?.toString() || item.productId.toString();

const getConfigurationKey = (customizedProducts = []) => (
  customizedProducts
    .map((item) => ({
      productId: item.productId?._id?.toString() || item.productId?.toString(),
      quantity: Number(item.quantity) || 0
    }))
    .filter(({ productId, quantity }) => productId && quantity > 0)
    .sort((first, second) => first.productId.localeCompare(second.productId))
    .map(({ productId, quantity }) => `${productId}:${quantity}`)
    .join('|') || 'default'
);

const ensureCartItemMetadata = (cart) => {
  let hasChanges = false;

  cart.items.forEach((item) => {
    if (!item._id) {
      item._id = new mongoose.Types.ObjectId();
      hasChanges = true;
    }

    const configurationKey = item.configurationKey || getConfigurationKey(item.customizedProducts);
    if (item.configurationKey !== configurationKey) {
      item.configurationKey = configurationKey;
      hasChanges = true;
    }
  });

  return hasChanges;
};

const getBoxQuantityInCart = (cart, boxId, excludedItemId = null) => (
  cart.items
    .filter((item) => (
      item.boxId.toString() === boxId.toString()
      && (!excludedItemId || item._id?.toString() !== excludedItemId.toString())
    ))
    .reduce((total, item) => total + (Number(item.quantity) || 0), 0)
);

const findCartItem = (cart, cartItemId) => {
  const itemById = cart.items.find((item) => item._id?.toString() === cartItemId.toString());
  if (itemById) return itemById;

  const matchingItems = cart.items.filter((item) => item.boxId.toString() === cartItemId.toString());
  if (matchingItems.length > 1) {
    throw new HttpError(400, 'Cart item id is required when a box has multiple configurations');
  }

  return matchingItems[0] || null;
};

const getDefaultSelectedItems = (box) => {
  const selectedItems = [];
  const selectedGroups = new Set();

  box.products.forEach((item) => {
    if (item.isCustomizable === true) {
      return;
    }

    if (
      item.selectionGroup &&
      !selectedGroups.has(item.selectionGroup) &&
      Number(item.productId.quantity) > 0
    ) {
      selectedGroups.add(item.selectionGroup);
      selectedItems.push({ productId: item.productId._id || item.productId, quantity: item.quantity });
    }
  });

  return selectedItems;
};

const normalizeCustomizedProducts = (box, customizedProducts) => {
  const customizableItems = box.products.filter((item) => item.isCustomizable === true);
  const selectableFixedItems = box.products.filter(
    (item) => item.isCustomizable !== true && item.selectionGroup
  );
  const selectableItems = [...customizableItems, ...selectableFixedItems];
  const selectedItems = customizedProducts === undefined
    ? getDefaultSelectedItems(box)
    : customizedProducts;

  if (!Array.isArray(selectedItems)) {
    throw new HttpError(400, 'customizedProducts must be an array');
  }

  const allowed = new Map(selectableItems.map((item) => [
    getProductId(item),
    item
  ]));
  const selectedById = new Map();

  selectedItems.forEach((item) => {
    const productId = item?.productId || item?.id;
    const key = productId?.toString();
    const boxItem = allowed.get(key);
    const quantity = Number(item?.quantity);

    if (!boxItem) throw new HttpError(400, 'A selected product is not customizable in this box');
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new HttpError(400, 'Customized product quantity must be an integer >= 1');
    }
    if (Number.isFinite(Number(boxItem.productId.quantity)) && quantity > Number(boxItem.productId.quantity)) {
      throw new HttpError(400, 'Customized product quantity exceeds available stock');
    }

    selectedById.set(key, (selectedById.get(key) || 0) + quantity);
  });

  const selectedGroupCounts = new Map();
  selectedById.forEach((quantity, productId) => {
    const boxItem = allowed.get(productId);
    if (boxItem?.selectionGroup) {
      selectedGroupCounts.set(
        boxItem.selectionGroup,
        (selectedGroupCounts.get(boxItem.selectionGroup) || 0) + 1
      );
    }
  });

  const selectionGroups = new Set(selectableFixedItems.map((item) => item.selectionGroup));
  selectionGroups.forEach((selectionGroup) => {
    if (selectedGroupCounts.get(selectionGroup) !== 1) {
      throw new HttpError(400, `Please select exactly one product from ${selectionGroup}`);
    }
  });

  return [...selectedById.entries()].map(([productId, quantity]) => ({ productId, quantity }));
};

const populateCart = async (cart) => {
  if (ensureCartItemMetadata(cart)) await cart.save();
  await cart.populate({
    path: 'items.boxId',
    populate: {
      path: 'products.productId',
      select: 'productName unit thumbnail price category quantity'
    }
  });
  await cart.populate({
    path: 'items.customizedProducts.productId',
    select: 'productName price thumbnail'
  });
  return cart;
};

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return populateCart(cart);
};

export const addToCart = async (userId, boxId, quantity = 1, customizedProducts) => {
  const requestedQuantity = normalizeCartQuantity(quantity);

  if (!mongoose.Types.ObjectId.isValid(boxId)) {
    throw new HttpError(400, 'Invalid boxId');
  }

  const box = await Box.findById(boxId).populate('products.productId', 'category price quantity');
  if (!box) throw new HttpError(404, 'Box not found');
  const normalizedCustomizedProducts = normalizeCustomizedProducts(box, customizedProducts);

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  ensureCartItemMetadata(cart);

  const configurationKey = getConfigurationKey(normalizedCustomizedProducts);
  const existingItem = cart.items.find((item) => (
    item.boxId.toString() === boxId
    && (item.configurationKey || getConfigurationKey(item.customizedProducts)) === configurationKey
  ));
  const nextBoxQuantity = getBoxQuantityInCart(cart, boxId) + requestedQuantity;
  assertStockAvailable(box, nextBoxQuantity);

  let targetItem;

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 0) + requestedQuantity;
    existingItem.customizedProducts = normalizedCustomizedProducts;
    existingItem.configurationKey = configurationKey;
    targetItem = existingItem;
  } else {
    targetItem = cart.items.create({
      boxId,
      quantity: requestedQuantity,
      customizedProducts: normalizedCustomizedProducts,
      configurationKey
    });
    cart.items.push(targetItem);
  }

  await cart.save();
  return {
    cart: await populateCart(cart),
    cartItemId: targetItem._id.toString()
  };
};

export const updateCartItem = async (userId, cartItemId, quantity) => {
  const nextQuantity = normalizeCartQuantity(quantity);

  if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
    throw new HttpError(400, 'Invalid cartItemId');
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) throw new HttpError(404, 'Cart not found');

  ensureCartItemMetadata(cart);
  const item = findCartItem(cart, cartItemId);
  if (!item) throw new HttpError(404, 'Item not found in cart');

  const box = await Box.findById(item.boxId);
  if (!box) throw new HttpError(404, 'Box not found');
  assertStockAvailable(
    box,
    getBoxQuantityInCart(cart, item.boxId, item._id) + nextQuantity
  );

  item.quantity = nextQuantity;
  await cart.save();
  return populateCart(cart);
};

export const removeFromCart = async (userId, cartItemId) => {
  if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
    throw new HttpError(400, 'Invalid cartItemId');
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new HttpError(404, 'Cart not found');

  ensureCartItemMetadata(cart);
  const item = findCartItem(cart, cartItemId);
  const itemIndex = item ? cart.items.indexOf(item) : -1;
  if (itemIndex === -1) throw new HttpError(404, 'Item not found in cart');

  cart.items.splice(itemIndex, 1);
  await cart.save();
  return populateCart(cart);
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new HttpError(404, 'Cart not found');

  cart.items = [];
  await cart.save();

  return populateCart(cart);
};
