import * as cartService from '../services/cartService.js';
import { sendSuccess } from '../utils/response.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    sendSuccess(res, {
      message: 'Lấy giỏ hàng thành công',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { boxId, quantity = 1 } = req.body;
    const cart = await cartService.addToCart(req.user.id, boxId, quantity);
    sendSuccess(res, {
      message: 'Thêm vào giỏ hàng thành công',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { boxId, quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user.id, boxId, quantity);
    sendSuccess(res, {
      message: 'Cập nhật giỏ hàng thành công',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { boxId } = req.params;
    const cart = await cartService.removeFromCart(req.user.id, boxId);
    sendSuccess(res, {
      message: 'Xóa khỏi giỏ hàng thành công',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    sendSuccess(res, {
      message: 'Xóa giỏ hàng thành công',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};
