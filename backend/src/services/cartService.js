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

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate('items.boxId');
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
};

export const addToCart = async (userId, boxId, quantity = 1) => {
  const requestedQuantity = normalizeCartQuantity(quantity);

  if (!mongoose.Types.ObjectId.isValid(boxId)) {
    throw new HttpError(400, 'Invalid boxId');
  }

  const box = await Box.findById(boxId);
  if (!box) throw new HttpError(404, 'Box not found');

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingItem = cart.items.find(item => item.boxId.toString() === boxId);
  const nextQuantity = (existingItem?.quantity || 0) + requestedQuantity;
  assertStockAvailable(box, nextQuantity);

  if (existingItem) {
    existingItem.quantity = nextQuantity;
  } else {
    cart.items.push({ boxId, quantity: requestedQuantity });
  }

  await cart.save();
  await cart.populate('items.boxId');

  return cart;
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
  await cart.populate('items.boxId');

  return cart;
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
  await cart.populate('items.boxId');

  return cart;
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new HttpError(404, 'Cart not found');

  cart.items = [];
  await cart.save();

  return cart;
};
