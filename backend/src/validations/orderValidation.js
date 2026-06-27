import mongoose from 'mongoose';
import HttpError from '../utils/httpError.js';

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'Cancel'];

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
    if (!VALID_STATUSES.includes(status)) {
      throw new HttpError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    result.status = status;
  }

  return result;
};

export const validateOrderStatus = (status) => {
  if (!status) throw new HttpError(400, 'status is required');
  const trimmed = String(status).trim();
  if (!VALID_STATUSES.includes(trimmed)) {
    throw new HttpError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  return trimmed;
};
