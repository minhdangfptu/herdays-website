import HttpError from '../utils/httpError.js';
import { CONTACT_TOPICS } from '../models/contactRequestModel.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[1-9]\d{7,14}$/;
const MAX_PAGE_SIZE = 50;

const fieldLimits = {
  senderName: 100,
  phone: 16,
  email: 254,
  address: 255,
  province: 100,
  message: 5000
};

const validateRequiredString = (body, field, errors) => {
  if (typeof body[field] !== 'string' || body[field].trim().length === 0) {
    errors.push({ field, message: `${field} is required` });
    return null;
  }

  const value = body[field].trim();
  if (value.length > fieldLimits[field]) {
    errors.push({ field, message: `${field} must not exceed ${fieldLimits[field]} characters` });
    return null;
  }

  return value;
};

export const validateCreateContact = (body) => {
  const payload = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const errors = [];
  const senderName = validateRequiredString(payload, 'senderName', errors);
  const phone = validateRequiredString(payload, 'phone', errors);
  const email = validateRequiredString(payload, 'email', errors)?.toLowerCase();
  const province = validateRequiredString(payload, 'province', errors);
  const topic = validateRequiredString(payload, 'topic', errors);
  const message = validateRequiredString(payload, 'message', errors);

  let address = null;
  if (payload.address !== undefined && payload.address !== null) {
    if (typeof payload.address !== 'string') {
      errors.push({ field: 'address', message: 'address must be a string' });
    } else if (payload.address.trim().length > fieldLimits.address) {
      errors.push({ field: 'address', message: `address must not exceed ${fieldLimits.address} characters` });
    } else {
      address = payload.address.trim() || null;
    }
  }

  if (email && !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (phone && !phoneRegex.test(phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone format' });
  }

  if (topic && !CONTACT_TOPICS.includes(topic)) {
    errors.push({ field: 'topic', message: `topic must be one of: ${CONTACT_TOPICS.join(', ')}` });
  }

  if (errors.length > 0) {
    throw new HttpError(400, 'Dữ liệu đầu vào không hợp lệ', errors);
  }

  return { senderName, phone, email, address, province, topic, message };
};

export const validateContactPagination = (query = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  return { page, limit };
};
