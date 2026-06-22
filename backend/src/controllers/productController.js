import * as productService from '../services/productService.js';
import { sendSuccess } from '../utils/response.js';
import {
  validateProductQuery,
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct
} from '../validations/productValidation.js';
import {
  validateBoxId,
  validateCreateBox,
  validateUpdateBox
} from '../validations/boxValidation.js';

// ─── READ ─────────────────────────────────────────────────────────────────────

export const getAllProducts = async (req, res, next) => {
  try {
    const params = validateProductQuery(req.query);
    const result = await productService.listAll(params);
    sendSuccess(res, {
      message: 'Lấy danh sách sản phẩm và combo thành công',
      data: result.items,
      meta: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const params = validateProductQuery(req.query);
    const result = await productService.listProducts(params);
    sendSuccess(res, {
      message: 'Lấy danh sách sản phẩm lẻ thành công',
      data: result.items,
      meta: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getBoxes = async (req, res, next) => {
  try {
    const params = validateProductQuery(req.query);
    const result = await productService.listBoxes(params);
    sendSuccess(res, {
      message: 'Lấy danh sách combo box thành công',
      data: result.items,
      meta: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// ─── PRODUCT CRUD ──────────────────────────────────────────────────────────────

export const createProduct = async (req, res, next) => {
  try {
    const data = validateCreateProduct(req.body);
    const product = await productService.createProduct(data);
    sendSuccess(res, {
      message: 'Tạo sản phẩm thành công',
      data: product
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const id = validateProductId(req.params.id);
    const product = await productService.getProductById(id);
    sendSuccess(res, {
      message: 'Lấy chi tiết sản phẩm thành công',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const id = validateProductId(req.params.id);
    const data = validateUpdateProduct(req.body);
    const product = await productService.updateProduct(id, data);
    sendSuccess(res, {
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const id = validateProductId(req.params.id);
    const product = await productService.deleteProduct(id);
    sendSuccess(res, {
      message: 'Xóa sản phẩm thành công',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// ─── BOX CRUD ────────────────────────────────────────────────────────────────

export const createBox = async (req, res, next) => {
  try {
    const data = validateCreateBox(req.body);
    const box = await productService.createBox(data);
    sendSuccess(res, {
      message: 'Tạo combo box thành công',
      data: box
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const getBox = async (req, res, next) => {
  try {
    const id = validateBoxId(req.params.id);
    const box = await productService.getBoxById(id);
    sendSuccess(res, {
      message: 'Lấy chi tiết combo box thành công',
      data: box
    });
  } catch (error) {
    next(error);
  }
};

export const updateBox = async (req, res, next) => {
  try {
    const id = validateBoxId(req.params.id);
    const data = validateUpdateBox(req.body);
    const box = await productService.updateBox(id, data);
    sendSuccess(res, {
      message: 'Cập nhật combo box thành công',
      data: box
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBox = async (req, res, next) => {
  try {
    const id = validateBoxId(req.params.id);
    const box = await productService.deleteBox(id);
    sendSuccess(res, {
      message: 'Xóa combo box thành công',
      data: box
    });
  } catch (error) {
    next(error);
  }
};
