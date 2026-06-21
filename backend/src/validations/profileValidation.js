import HttpError from '../utils/httpError.js';

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
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (typeof body.phone !== 'string' || !phoneRegex.test(body.phone.trim())) {
      throw new HttpError(400, 'Invalid phone format');
    }
    updates.phone = body.phone.trim();
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
