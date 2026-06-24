import mongoose from 'mongoose';
import HttpError from '../utils/httpError.js';

const validateObjectId = (value, fieldName) => {
  if (!mongoose.isValidObjectId(value)) throw new HttpError(400, `${fieldName} is invalid`);
  return value;
};

const validateCloudinaryUrl = (value, fieldName) => {
  if (!value) return '';
  try {
    const url = new URL(value);
    const isCloudinaryHost = url.hostname === 'cloudinary.com' || url.hostname.endsWith('.cloudinary.com');
    if (url.protocol !== 'https:' || !isCloudinaryHost) throw new Error('Invalid Cloudinary URL');
    return url.toString();
  } catch {
    throw new HttpError(400, `${fieldName} must be a valid HTTPS Cloudinary URL`);
  }
};

const validateProductName = (name) => {
  const trimmed = name?.trim();
  if (!trimmed) throw new HttpError(400, 'productName is required');
  if (trimmed.length > 200) throw new HttpError(400, 'productName must not exceed 200 characters');
  return trimmed;
};

const validatePrice = (price) => {
  const num = Number(price);
  if (Number.isNaN(num)) throw new HttpError(400, 'price must be a number');
  if (num < 0) throw new HttpError(400, 'price must be >= 0');
  return num;
};

const validateQuantity = (quantity) => {
  const num = Number(quantity);
  if (!Number.isInteger(num)) throw new HttpError(400, 'quantity must be an integer');
  if (num < 0) throw new HttpError(400, 'quantity must be >= 0');
  return num;
};

const validateCategory = (category) => {
  if (category === undefined || category === null || category === '') return null;
  const trimmed = String(category).trim();
  if (trimmed.length > 100) throw new HttpError(400, 'category must not exceed 100 characters');
  return trimmed;
};

const MAX_PAGE_SIZE = 50;

export const validateProductQuery = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(query.limit, 10) || 12));

  const result = { page, limit };

  if (query.search) result.search = String(query.search).trim();
  if (query.category) result.category = String(query.category).trim();
  if (query.sort) result.sort = String(query.sort);

  return result;
};

export const validateProductId = (id) => validateObjectId(id, 'productId');

export const validateCreateProduct = (body) => ({
  productName: validateProductName(body.productName),
  thumbnail: validateCloudinaryUrl(body.thumbnail, 'thumbnail'),
  price: validatePrice(body.price),
  quantity: validateQuantity(body.quantity),
  description: body.description !== undefined ? String(body.description).trim() : null,
  category: validateCategory(body.category)
});

export const validateUpdateProduct = (body) => {
  const allowedFields = ['productName', 'thumbnail', 'price', 'quantity', 'description', 'category'];
  const hasUpdate = allowedFields.some((field) => body[field] !== undefined);
  if (!hasUpdate) throw new HttpError(400, 'At least one product field is required');

  const update = {};
  if (body.productName !== undefined) update.productName = validateProductName(body.productName);
  if (body.thumbnail !== undefined) update.thumbnail = validateCloudinaryUrl(body.thumbnail, 'thumbnail');
  if (body.price !== undefined) update.price = validatePrice(body.price);
  if (body.quantity !== undefined) update.quantity = validateQuantity(body.quantity);
  if (body.description !== undefined) update.description = String(body.description).trim();
  if (body.category !== undefined) update.category = validateCategory(body.category);
  return update;
};
