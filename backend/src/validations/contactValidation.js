import HttpError from '../utils/httpError.js';
import { CONTACT_TOPICS } from '../models/contactRequestModel.js';
import mongoose from 'mongoose';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s.\-+()]{7,16}$/;
const MAX_PAGE_SIZE = 50;

const fieldLabels = {
  senderName: 'Tên',
  phone: 'Số điện thoại',
  email: 'Email',
  address: 'Địa chỉ',
  province: 'Tỉnh/Thành phố',
  topic: 'Chủ đề',
  message: 'Nội dung'
};

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
    errors.push({ field, message: `Vui lòng nhập ${fieldLabels[field]}.` });
    return null;
  }

  const value = body[field].trim();
  if (value.length > fieldLimits[field]) {
    errors.push({ field, message: `${fieldLabels[field]} không được vượt quá ${fieldLimits[field]} ký tự.` });
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
      errors.push({ field: 'address', message: 'Địa chỉ phải là chuỗi ký tự.' });
    } else if (payload.address.trim().length > fieldLimits.address) {
      errors.push({ field: 'address', message: `Địa chỉ không được vượt quá ${fieldLimits.address} ký tự.` });
    } else {
      address = payload.address.trim() || null;
    }
  }

  if (email && !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Email không đúng định dạng. Vui lòng kiểm tra lại.' });
  }

  if (phone && !phoneRegex.test(phone)) {
    errors.push({ field: 'phone', message: 'Số điện thoại không hợp lệ. Vui lòng nhập 7-16 chữ số.' });
  }

  if (topic && !CONTACT_TOPICS.includes(topic)) {
    errors.push({ field: 'topic', message: `Chủ đề phải là một trong: ${CONTACT_TOPICS.join(', ')}.` });
  }

  if (errors.length > 0) {
    throw new HttpError(400, 'Dữ liệu đầu vào không hợp lệ', errors);
  }

  return { senderName, phone, email, address, province, topic, message };
};

export const validateContactPagination = (query = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  const result = { page, limit };

  if (query.search) {
    const search = String(query.search).trim();
    if (search) result.search = search;
  }

  if (query.isRessponsed !== undefined && query.isRessponsed !== '') {
    if (!['true', 'false'].includes(String(query.isRessponsed))) {
      throw new HttpError(400, 'isRessponsed must be true or false');
    }

    result.isRessponsed = String(query.isRessponsed) === 'true';
  }

  return result;
};

export const validateContactId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'contactId is invalid');
  return id;
};

export const validateContactResponseStatus = (body) => {
  const payload = body && typeof body === 'object' && !Array.isArray(body) ? body : {};

  if (typeof payload.isRessponsed !== 'boolean') {
    throw new HttpError(400, 'isRessponsed must be a boolean');
  }

  return payload.isRessponsed;
};
