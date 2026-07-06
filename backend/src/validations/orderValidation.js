import mongoose from 'mongoose';
import { ORDER_STATUSES } from '../constants/orderStatus.js';
import HttpError from '../utils/httpError.js';

const VALID_PAYMENT_METHODS = ['bank_transfer', 'qr_transfer', 'cod'];

export const validateOrderId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'orderId is invalid');
  return id;
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

  if (payload.boxIds !== undefined && payload.boxIds !== null) {
    if (!Array.isArray(payload.boxIds)) throw new HttpError(400, 'boxIds must be an array');

    result.boxIds = [...new Set(payload.boxIds.map((boxId) => String(boxId).trim()).filter(Boolean))];

    if (result.boxIds.some((boxId) => !mongoose.isValidObjectId(boxId))) {
      throw new HttpError(400, 'boxIds contains an invalid boxId');
    }

    if (result.boxIds.length === 0) throw new HttpError(400, 'boxIds must include at least one boxId');
  }

  return result;
};
