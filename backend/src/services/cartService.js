import mongoose from 'mongoose';
import Cart from '../models/cartModel.js';
import Box from '../models/boxModel.js';
import HttpError from '../utils/httpError.js';

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate('items.boxId');
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
};

export const addToCart = async (userId, boxId, quantity = 1) => {
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
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ boxId, quantity });
  }

  await cart.save();
  await cart.populate('items.boxId');

  return cart;
};

export const updateCartItem = async (userId, boxId, quantity) => {
  if (!mongoose.Types.ObjectId.isValid(boxId)) {
    throw new HttpError(400, 'Invalid boxId');
  }
  if (quantity < 1) throw new HttpError(400, 'Quantity must be at least 1');

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new HttpError(404, 'Cart not found');

  const item = cart.items.find(item => item.boxId.toString() === boxId);
  if (!item) throw new HttpError(404, 'Item not found in cart');

  item.quantity = quantity;
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
