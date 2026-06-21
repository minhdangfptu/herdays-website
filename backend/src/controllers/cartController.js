import * as cartService from '../services/cartService.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { boxId, quantity = 1 } = req.body;
    const cart = await cartService.addToCart(req.user.id, boxId, quantity);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { boxId, quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user.id, boxId, quantity);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { boxId } = req.params;
    const cart = await cartService.removeFromCart(req.user.id, boxId);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};
