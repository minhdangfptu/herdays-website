import mongoose from 'mongoose';
import { ORDER_STATUSES } from '../constants/orderStatus.js';
import HttpError from '../utils/httpError.js';

const VALID_PAYMENT_METHODS = ['bank_transfer', 'qr_transfer', 'cod'];

const validateIdArray = (value, fieldName, idName) => {
  if (!Array.isArray(value)) throw new HttpError(400, `${fieldName} must be an array`);

  const ids = [...new Set(value.map((id) => String(id).trim()).filter(Boolean))];
  if (ids.some((id) => !mongoose.isValidObjectId(id))) {
    throw new HttpError(400, `${fieldName} contains an invalid ${idName}`);
  }
  if (ids.length === 0) throw new HttpError(400, `${fieldName} must include at least one ${idName}`);

  return ids;
};

export const validateOrderId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'orderId is invalid');
  return id;
};

export const validateOrderCreatedAt = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, 'createdAt is required');
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, 'createdAt must be a valid date');
  }

  return date;
};

export const validateOrderQuery = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 12));

  const result = { page, limit };

  if (query.search) {
    const trimmed = String(query.search).trim();
    if (trimmed) result.search = trimmed;
  }

  if (query.status) {
    const status = String(query.status).trim();
    if (!ORDER_STATUSES.includes(status)) {
      throw new HttpError(400, `status must be one of: ${ORDER_STATUSES.join(', ')}`);
    }
    result.status = status;
  }

  return result;
};

export const validateOrderStatus = (status) => {
  if (!status) throw new HttpError(400, 'status is required');
  const trimmed = String(status).trim();
  if (!ORDER_STATUSES.includes(trimmed)) {
    throw new HttpError(400, `status must be one of: ${ORDER_STATUSES.join(', ')}`);
  }
  return trimmed;
};

export const validateCreateOrder = (body) => {
  const payload = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const result = {};

  const recipientName = String(payload.recipientName ?? '').trim().replace(/\s+/g, ' ');
  if (!recipientName) {
    throw new HttpError(400, 'recipientName is required');
  }
  if (recipientName.length > 100) {
    throw new HttpError(400, 'recipientName must not exceed 100 characters');
  }
  result.recipientName = recipientName;

  const recipientPhone = String(payload.recipientPhone ?? '').trim().replace(/[\s().-]/g, '');
  if (!recipientPhone) {
    throw new HttpError(400, 'recipientPhone is required');
  }

  if (/^0\d{9}$/.test(recipientPhone)) {
    result.recipientPhone = recipientPhone;
  } else if (/^\+84\d{9}$/.test(recipientPhone)) {
    result.recipientPhone = `0${recipientPhone.slice(3)}`;
  } else if (/^84\d{9}$/.test(recipientPhone)) {
    result.recipientPhone = `0${recipientPhone.slice(2)}`;
  } else {
    throw new HttpError(400, 'Invalid Vietnamese phone format');
  }

  const shippingAddress = typeof payload.shippingAddress === 'string'
    ? payload.shippingAddress.trim()
    : '';
  if (!shippingAddress) {
    throw new HttpError(400, 'shippingAddress is required');
  }
  if (shippingAddress.length > 255) {
    throw new HttpError(400, 'shippingAddress must not exceed 255 characters');
  }
  result.shippingAddress = shippingAddress;

  if (payload.paymentMethod !== undefined && payload.paymentMethod !== null && payload.paymentMethod !== '') {
    const paymentMethod = String(payload.paymentMethod).trim();
    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      throw new HttpError(400, `paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`);
    }
    result.paymentMethod = paymentMethod;
  }

  if (payload.lovelyMessage !== undefined && payload.lovelyMessage !== null) {
    result.lovelyMessage = String(payload.lovelyMessage).trim().slice(0, 500);
  }

  if (payload.subscriptionMonths !== undefined && payload.subscriptionMonths !== null) {
    const subscriptionMonths = Number(payload.subscriptionMonths);
    if (![1, 3, 6, 12].includes(subscriptionMonths)) {
      throw new HttpError(400, 'subscriptionMonths must be one of: 1, 3, 6, 12');
    }
    result.subscriptionMonths = subscriptionMonths;
  }

  if (payload.boxIds !== undefined && payload.boxIds !== null) {
    result.boxIds = validateIdArray(payload.boxIds, 'boxIds', 'boxId');
  }

  if (payload.cartItemIds !== undefined && payload.cartItemIds !== null) {
    result.cartItemIds = validateIdArray(payload.cartItemIds, 'cartItemIds', 'cartItemId');
  }

  return result;
};
