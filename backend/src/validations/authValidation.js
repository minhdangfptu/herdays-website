import HttpError from '../utils/httpError.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[1-9]\d{7,14}$/;

export const normalizeEmail = (email) => email?.trim().toLowerCase();

export const normalizePhoneNumber = (phoneNumber) => phoneNumber?.trim();

export const isEmail = (value) => emailRegex.test(String(value || '').trim().toLowerCase());

export const isPhoneNumber = (value) => phoneRegex.test(String(value || '').trim());

export const normalizeIdentifier = (identifier) => {
  if (isEmail(identifier)) return normalizeEmail(identifier);
  if (isPhoneNumber(identifier)) return normalizePhoneNumber(identifier);
  return String(identifier || '').trim().toLowerCase();
};

const validatePassword = (password, fieldName = 'password') => {
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new HttpError(400, `${fieldName} must be at least 8 characters`);
  }
};

export const validateRegister = (body) => {
  const email = normalizeEmail(body.email);
  const phoneNumber = normalizePhoneNumber(body.phoneNumber);
  const otpChannel = body.otpChannel?.trim();

  if (!email && !phoneNumber) {
    throw new HttpError(400, 'Email or phoneNumber is required');
  }

  if (email && !isEmail(email)) throw new HttpError(400, 'Invalid email');
  if (phoneNumber && !isPhoneNumber(phoneNumber)) throw new HttpError(400, 'Invalid phoneNumber');
  if (otpChannel && !['email', 'phone'].includes(otpChannel)) {
    throw new HttpError(400, 'otpChannel must be email or phone');
  }
  if (otpChannel === 'email' && !email) throw new HttpError(400, 'email is required when otpChannel is email');
  if (otpChannel === 'phone' && !phoneNumber) {
    throw new HttpError(400, 'phoneNumber is required when otpChannel is phone');
  }

  validatePassword(body.password);

  return {
    email,
    phoneNumber,
    otpChannel: otpChannel || (email ? 'email' : 'phone'),
    password: body.password,
    fullName: body.fullName?.trim()
  };
};

export const validateLogin = (body) => {
  if (!body.identifier) throw new HttpError(400, 'identifier is required');
  if (!body.password) throw new HttpError(400, 'password is required');

  return {
    identifier: normalizeIdentifier(body.identifier),
    password: body.password
  };
};

export const validateConfirmOtp = (body) => {
  if (!body.identifier) throw new HttpError(400, 'identifier is required');
  if (!body.otp || !/^\d{6}$/.test(String(body.otp))) throw new HttpError(400, 'otp must be 6 digits');
  if (!['register', 'reset-password'].includes(body.purpose)) throw new HttpError(400, 'Invalid OTP purpose');

  return {
    identifier: normalizeIdentifier(body.identifier),
    otp: String(body.otp),
    purpose: body.purpose
  };
};

export const validateForgotPassword = (body) => {
  if (!body.identifier) throw new HttpError(400, 'identifier is required');

  return {
    identifier: normalizeIdentifier(body.identifier)
  };
};

export const validateForgotPasswordEmail = (body) => {
  const email = normalizeEmail(body.email);
  if (!email || !isEmail(email)) throw new HttpError(400, 'Invalid email');

  return { email };
};

export const validateForgotPasswordPhoneNumber = (body) => {
  const phoneNumber = normalizePhoneNumber(body.phoneNumber);
  if (!phoneNumber || !isPhoneNumber(phoneNumber)) throw new HttpError(400, 'Invalid phoneNumber');

  return { phoneNumber };
};

export const validateResetPassword = (body) => {
  if (!body.resetToken) throw new HttpError(400, 'resetToken is required');
  validatePassword(body.newPassword, 'newPassword');

  return {
    resetToken: body.resetToken,
    newPassword: body.newPassword
  };
};

export const validateChangePassword = (body) => {
  if (!body.currentPassword) throw new HttpError(400, 'currentPassword is required');
  validatePassword(body.newPassword, 'newPassword');

  return {
    currentPassword: body.currentPassword,
    newPassword: body.newPassword
  };
};

export const validateRefreshToken = (body) => {
  if (!body.refreshToken) throw new HttpError(400, 'refreshToken is required');
  return { refreshToken: body.refreshToken };
};

export const validateSocialLogin = (body) => {
  if (body.provider !== 'google') throw new HttpError(400, 'Only google social login is supported');
  if (!body.idToken) throw new HttpError(400, 'idToken is required');

  return {
    provider: body.provider,
    idToken: body.idToken
  };
};
