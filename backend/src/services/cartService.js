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
  await cart.populate('items.boxId');
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

  const existingItem = cart.items.find(item => item.boxId.toString() === boxId);
  const nextQuantity = (existingItem?.quantity || 0) + requestedQuantity;
  assertStockAvailable(box, nextQuantity);

  if (existingItem) {
    existingItem.quantity = nextQuantity;
    existingItem.customizedProducts = normalizedCustomizedProducts;
  } else {
    cart.items.push({
      boxId,
      quantity: requestedQuantity,
      customizedProducts: normalizedCustomizedProducts
    });
  }

  await cart.save();
  return populateCart(cart);
};

export const updateCartItem = async (userId, boxId, quantity) => {
  const nextQuantity = normalizeCartQuantity(quantity);

  if (!mongoose.Types.ObjectId.isValid(boxId)) {
    throw new HttpError(400, 'Invalid boxId');
  }

  const [cart, box] = await Promise.all([
    Cart.findOne({ userId }),
    Box.findById(boxId)
  ]);

  if (!cart) throw new HttpError(404, 'Cart not found');

  const item = cart.items.find(item => item.boxId.toString() === boxId);
  if (!item) throw new HttpError(404, 'Item not found in cart');

  if (!box) throw new HttpError(404, 'Box not found');
  assertStockAvailable(box, nextQuantity);

  item.quantity = nextQuantity;
  await cart.save();
  return populateCart(cart);
};

export const removeFromCart = async (userId, boxId) => {
  if (!mongoose.Types.ObjectId.isValid(boxId)) {
    throw new HttpError(400, 'Invalid boxId');
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new HttpError(404, 'Cart not found');

  const itemIndex = cart.items.findIndex(item => item.boxId.toString() === boxId);
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
