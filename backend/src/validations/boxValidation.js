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

const validateBoxName = (name) => {
  const trimmed = name?.trim();
  if (!trimmed) throw new HttpError(400, 'boxName is required');
  if (trimmed.length > 200) throw new HttpError(400, 'boxName must not exceed 200 characters');
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

export const validateBoxId = (id) => validateObjectId(id, 'boxId');

export const validateCreateBox = (body) => ({
  boxName: validateBoxName(body.boxName),
  thumbnail: validateCloudinaryUrl(body.thumbnail, 'thumbnail'),
  price: validatePrice(body.price),
  quantity: validateQuantity(body.quantity),
  description: body.description !== undefined ? String(body.description).trim() : null,
  category: validateCategory(body.category)
});

export const validateUpdateBox = (body) => {
  const allowedFields = ['boxName', 'thumbnail', 'price', 'quantity', 'description', 'category'];
  const hasUpdate = allowedFields.some((field) => body[field] !== undefined);
  if (!hasUpdate) throw new HttpError(400, 'At least one box field is required');

  const update = {};
  if (body.boxName !== undefined) update.boxName = validateBoxName(body.boxName);
  if (body.thumbnail !== undefined) update.thumbnail = validateCloudinaryUrl(body.thumbnail, 'thumbnail');
  if (body.price !== undefined) update.price = validatePrice(body.price);
  if (body.quantity !== undefined) update.quantity = validateQuantity(body.quantity);
  if (body.description !== undefined) update.description = String(body.description).trim();
  if (body.category !== undefined) update.category = validateCategory(body.category);
  return update;
};
