import HttpError from '../utils/httpError.js';

const normalizeVietnamPhoneNumber = (phone) => {
  if (typeof phone !== 'string') throw new HttpError(400, 'Invalid Vietnamese phone format');

  const normalizedPhone = phone.trim().replace(/[\s().-]/g, '');
  if (!normalizedPhone) return null;

  if (/^0\d{9}$/.test(normalizedPhone)) return `+84${normalizedPhone.slice(1)}`;
  if (/^\+84\d{9}$/.test(normalizedPhone)) return normalizedPhone;
  if (/^84\d{9}$/.test(normalizedPhone)) return `+${normalizedPhone}`;

  throw new HttpError(400, 'Invalid Vietnamese phone format');
};

export const validateUpdateProfile = (body) => {
  const updates = {};

  if (body.fullName !== undefined) {
    if (typeof body.fullName !== 'string' || body.fullName.trim().length === 0) {
      throw new HttpError(400, 'fullName cannot be empty');
    }
    updates.fullName = body.fullName.trim();
  }

  if (body.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof body.email !== 'string' || !emailRegex.test(body.email.trim().toLowerCase())) {
      throw new HttpError(400, 'Invalid email format');
    }
    updates.email = body.email.trim().toLowerCase();
  }

  if (body.phone !== undefined) {
    updates.phone = normalizeVietnamPhoneNumber(body.phone);
  }

  if (body.address !== undefined) {
    if (typeof body.address !== 'string') {
      throw new HttpError(400, 'address must be a string');
    }
    updates.address = body.address.trim();
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update');
  }

  return updates;
};
