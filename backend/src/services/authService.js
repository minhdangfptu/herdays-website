import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import env from '../config/environment.js';
import Otp from '../models/otpModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import User from '../models/userModel.js';
import { sendOtpEmail } from '../providers/emailProvider.js';
import { verifyGoogleIdToken } from '../providers/googleProvider.js';
import { sendOtpSms } from '../providers/smsProvider.js';
import HttpError from '../utils/httpError.js';
import {
  isEmail,
  isPhoneNumber,
  normalizeEmail,
  normalizeIdentifier,
  normalizePhoneNumber
} from '../validations/authValidation.js';

const resetTokenStore = new Map();

const sanitizeUser = (user) => user.toJSON();

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const createOtp = async (identifier, purpose) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, env.bcryptSaltRounds);
  const expiresAt = new Date(Date.now() + env.otpExpiresInMinutes * 60 * 1000);

  await Otp.updateMany(
    { identifier: normalizedIdentifier, purpose, consumedAt: { $exists: false } },
    { consumedAt: new Date() }
  );

  await Otp.create({
    identifier: normalizedIdentifier,
    purpose,
    otpHash,
    expiresAt
  });

  return otp;
};

const sendOtp = async (identifier, purpose) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const otp = await createOtp(normalizedIdentifier, purpose);

  if (isEmail(normalizedIdentifier)) {
    await sendOtpEmail(normalizedIdentifier, otp, purpose);
    return;
  }

  if (isPhoneNumber(normalizedIdentifier)) {
    await sendOtpSms(normalizedIdentifier, otp);
    return;
  }

  throw new HttpError(400, 'Invalid identifier');
};

const findUserByIdentifier = async (identifier, includePassword = false) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const query = isEmail(normalizedIdentifier)
    ? { email: normalizedIdentifier }
    : { phoneNumber: normalizedIdentifier };

  const userQuery = User.findOne(query);
  if (includePassword) userQuery.select('+passwordHash');

  return userQuery;
};

const signAccessToken = (user) => jwt.sign(
  {
    id: user._id.toString(),
    email: user.email,
    phoneNumber: user.phoneNumber
  },
  env.jwtSecret,
  { expiresIn: env.accessTokenExpiresIn }
);

const signRefreshToken = (user) => jwt.sign(
  {
    id: user._id.toString(),
    tokenId: crypto.randomUUID()
  },
  env.refreshTokenSecret,
  { expiresIn: env.refreshTokenExpiresIn }
);

const persistRefreshToken = async (user, refreshToken) => {
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashValue(refreshToken),
    expiresAt: new Date(Date.now() + env.refreshTokenExpiresInMs)
  });
};

const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await persistRefreshToken(user, refreshToken);

  return {
    accessToken,
    refreshToken
  };
};

const createResetToken = (userId) => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  resetTokenStore.set(hashValue(resetToken), {
    userId: userId.toString(),
    expiresAt: Date.now() + env.resetTokenExpiresInMs
  });

  return resetToken;
};

const consumeResetToken = (resetToken) => {
  const resetTokenHash = hashValue(resetToken);
  const tokenRecord = resetTokenStore.get(resetTokenHash);

  if (!tokenRecord || tokenRecord.expiresAt < Date.now()) {
    resetTokenStore.delete(resetTokenHash);
    throw new HttpError(400, 'Invalid or expired reset token');
  }

  resetTokenStore.delete(resetTokenHash);
  return tokenRecord.userId;
};

export const register = async ({ email, phoneNumber, otpChannel, password, fullName }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  const duplicateConditions = [];

  if (normalizedEmail) duplicateConditions.push({ email: normalizedEmail });
  if (normalizedPhoneNumber) duplicateConditions.push({ phoneNumber: normalizedPhoneNumber });

  const existingUser = await User.findOne({ $or: duplicateConditions });
  if (existingUser) throw new HttpError(409, 'Email or phoneNumber already exists');

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await User.create({
    email: normalizedEmail,
    phoneNumber: normalizedPhoneNumber,
    passwordHash,
    fullName,
    provider: 'local',
    status: 'pending'
  });

  const otpIdentifier = otpChannel === 'phone' ? normalizedPhoneNumber : normalizedEmail;
  await sendOtp(otpIdentifier, 'register');

  return {
    message: 'Register successfully. Please confirm OTP.',
    otpChannel,
    otpIdentifier,
    user: sanitizeUser(user)
  };
};

export const confirmOtp = async ({ identifier, otp, purpose }) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const otpRecord = await Otp.findOne({
    identifier: normalizedIdentifier,
    purpose,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  }).select('+otpHash').sort({ createdAt: -1 });

  if (!otpRecord) throw new HttpError(400, 'Invalid or expired OTP');

  if (otpRecord.attemptCount >= 5) {
    throw new HttpError(400, 'OTP attempt limit exceeded');
  }

  const isMatched = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isMatched) {
    otpRecord.attemptCount += 1;
    await otpRecord.save();
    throw new HttpError(400, 'Invalid or expired OTP');
  }

  otpRecord.consumedAt = new Date();
  await otpRecord.save();

  const user = await findUserByIdentifier(normalizedIdentifier);
  if (!user) throw new HttpError(404, 'User not found');

  if (purpose === 'register') {
    if (isEmail(normalizedIdentifier)) user.isEmailVerified = true;
    if (isPhoneNumber(normalizedIdentifier)) user.isPhoneVerified = true;
    user.status = 'active';
    await user.save();

    return {
      message: 'OTP confirmed successfully',
      user: sanitizeUser(user)
    };
  }

  return {
    message: 'OTP confirmed successfully',
    resetToken: createResetToken(user._id)
  };
};

export const login = async ({ identifier, password }) => {
  const user = await findUserByIdentifier(identifier, true);
  if (!user || !user.passwordHash) throw new HttpError(401, 'Invalid credentials');

  const isMatched = await bcrypt.compare(password, user.passwordHash);
  if (!isMatched) throw new HttpError(401, 'Invalid credentials');

  if (user.status !== 'active') throw new HttpError(403, 'Please confirm OTP before login');

  const tokens = await issueTokens(user);

  return {
    user: sanitizeUser(user),
    ...tokens
  };
};

export const forgotPassword = async ({ identifier }) => {
  const user = await findUserByIdentifier(identifier);
  if (!user) throw new HttpError(404, 'User not found');

  await sendOtp(identifier, 'reset-password');

  return { message: 'Reset password OTP sent successfully' };
};

export const forgotPasswordByEmail = async ({ email }) => forgotPassword({ identifier: email });

export const forgotPasswordByPhoneNumber = async ({ phoneNumber }) => forgotPassword({ identifier: phoneNumber });

export const resetPassword = async ({ resetToken, newPassword }) => {
  const userId = consumeResetToken(resetToken);
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new HttpError(404, 'User not found');

  user.passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
  user.status = 'active';
  await user.save();

  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  return { message: 'Password reset successfully' };
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !user.passwordHash) throw new HttpError(404, 'User not found');

  const isMatched = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatched) throw new HttpError(400, 'Current password is incorrect');

  user.passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
  await user.save();

  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  return { message: 'Password changed successfully' };
};

export const logout = async ({ refreshToken }) => {
  await RefreshToken.findOneAndUpdate(
    { tokenHash: hashValue(refreshToken), revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  return { message: 'Logout successfully' };
};

export const refreshToken = async ({ refreshToken: token }) => {
  let payload;

  try {
    payload = jwt.verify(token, env.refreshTokenSecret);
  } catch {
    throw new HttpError(401, 'Invalid or expired refresh token');
  }

  const tokenRecord = await RefreshToken.findOne({
    tokenHash: hashValue(token),
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  }).select('+tokenHash');

  if (!tokenRecord) throw new HttpError(401, 'Invalid or expired refresh token');

  const user = await User.findById(payload.id);
  if (!user || user.status !== 'active') throw new HttpError(401, 'Invalid or expired refresh token');

  tokenRecord.revokedAt = new Date();
  await tokenRecord.save();

  return issueTokens(user);
};

export const socialLogin = async ({ idToken }) => {
  const googleProfile = await verifyGoogleIdToken(idToken);
  const email = normalizeEmail(googleProfile.email);

  if (!email) throw new HttpError(400, 'Google account does not include an email');

  let user = await User.findOne({
    $or: [
      { provider: 'google', providerId: googleProfile.sub },
      { email }
    ]
  });

  if (!user) {
    user = await User.create({
      email,
      fullName: googleProfile.name,
      avatarUrl: googleProfile.picture,
      provider: 'google',
      providerId: googleProfile.sub,
      isEmailVerified: Boolean(googleProfile.email_verified),
      status: 'active'
    });
  } else {
    user.provider = user.provider || 'google';
    user.providerId = user.providerId || googleProfile.sub;
    user.isEmailVerified = user.isEmailVerified || Boolean(googleProfile.email_verified);
    user.status = 'active';
    await user.save();
  }

  const tokens = await issueTokens(user);

  return {
    user: sanitizeUser(user),
    ...tokens
  };
};
