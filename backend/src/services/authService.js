import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import env from '../config/environment.js';
import Otp from '../models/otpModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import User from '../models/userModel.js';
import { sendOtpEmail } from '../providers/emailProvider.js';
import { verifyFacebookAccessToken } from '../providers/facebookProvider.js';
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
    : { phone: normalizedIdentifier };

  const userQuery = User.findOne(query);
  if (includePassword) userQuery.select('+password');

  return userQuery;
};

const signAccessToken = (user) => jwt.sign(
  {
    id: user._id.toString(),
    email: user.email,
    phone: user.phone
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

export const register = async ({ email, phone, otpChannel, password, fullName, targetStatus }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhoneNumber(phone);

  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { phone: normalizedPhone }
    ]
  });
  if (existingUser) throw new HttpError(409, 'Email or phone already exists');

  const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await User.create({
    email: normalizedEmail,
    phone: normalizedPhone,
    password: hashedPassword,
    fullName,
    role: 'user_free',
    authProvider: 'local',
    targetStatus,
    isVerified: false
  });

  const otpIdentifier = otpChannel === 'phone' ? normalizedPhone : normalizedEmail;
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
    user.isVerified = true;
    await user.save();
    const tokens = await issueTokens(user);

    return {
      message: 'OTP confirmed successfully',
      user: sanitizeUser(user),
      ...tokens
    };
  }

  return {
    message: 'OTP confirmed successfully',
    resetToken: createResetToken(user._id)
  };
};

export const login = async ({ identifier, password }) => {
  const user = await findUserByIdentifier(identifier, true);
  if (!user || !user.password) throw new HttpError(401, 'Invalid credentials');

  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) throw new HttpError(401, 'Invalid credentials');

  if (user.isDisabled) throw new HttpError(403, 'User account is disabled');
  if (!user.isVerified) throw new HttpError(403, 'Please confirm OTP before login');

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

export const forgotPasswordByPhoneNumber = async ({ phone }) => forgotPassword({ identifier: phone });

export const resetPassword = async ({ resetToken, newPassword }) => {
  const userId = consumeResetToken(resetToken);
  const user = await User.findById(userId).select('+password');
  if (!user) throw new HttpError(404, 'User not found');

  user.password = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
  user.isVerified = true;
  await user.save();

  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  return { message: 'Password reset successfully' };
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !user.password) throw new HttpError(404, 'User not found');

  const isMatched = await bcrypt.compare(currentPassword, user.password);
  if (!isMatched) throw new HttpError(400, 'Current password is incorrect');

  user.password = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
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
  if (!user || !user.isVerified || user.isDisabled) throw new HttpError(401, 'Invalid or expired refresh token');

  tokenRecord.revokedAt = new Date();
  await tokenRecord.save();

  return issueTokens(user);
};

const getSocialProfile = async ({ provider, idToken, accessToken }) => {
  if (provider === 'facebook') {
    const facebookProfile = await verifyFacebookAccessToken(accessToken);
    return {
      provider,
      providerIdField: 'facebookId',
      id: facebookProfile.id,
      email: facebookProfile.email,
      name: facebookProfile.name,
      missingEmailMessage: 'Facebook account does not include an email'
    };
  }

  const googleProfile = await verifyGoogleIdToken(idToken);
  return {
    provider,
    providerIdField: 'googleId',
    id: googleProfile.sub,
    email: googleProfile.email,
    name: googleProfile.name,
    emailVerified: googleProfile.email_verified,
    missingEmailMessage: 'Google account does not include an email'
  };
};

export const socialLogin = async ({ provider, idToken, accessToken }) => {
  const socialProfile = await getSocialProfile({ provider, idToken, accessToken });
  const email = normalizeEmail(socialProfile.email);

  if (!email) throw new HttpError(400, socialProfile.missingEmailMessage);
  if (socialProfile.emailVerified === false) throw new HttpError(400, 'Google account email is not verified');

  const providerIdQuery = socialProfile.id
    ? { [socialProfile.providerIdField]: socialProfile.id }
    : null;
  const userQuery = providerIdQuery
    ? { $or: [{ email }, providerIdQuery] }
    : { email };
  let user = await User.findOne(userQuery);
  let isNewUser = false;

  if (!user) {
    user = await User.create({
      email,
      fullName: socialProfile.name,
      role: 'user_free',
      authProvider: provider,
      [socialProfile.providerIdField]: socialProfile.id,
      isVerified: true
    });
    isNewUser = true;
  } else {
    if (user.isDisabled) throw new HttpError(403, 'User account is disabled');
    if (!user.isVerified) throw new HttpError(403, 'Please confirm OTP before login');
    if (
      user[socialProfile.providerIdField] &&
      socialProfile.id &&
      user[socialProfile.providerIdField] !== socialProfile.id
    ) {
      throw new HttpError(409, 'Social account is linked to another user');
    }

    let shouldSave = false;
    if (!user[socialProfile.providerIdField] && socialProfile.id) {
      user[socialProfile.providerIdField] = socialProfile.id;
      shouldSave = true;
    }
    if (user.authProvider !== provider) {
      user.authProvider = provider;
      shouldSave = true;
    }
    if (shouldSave) await user.save();
  }

  const tokens = await issueTokens(user);

  return {
    user: sanitizeUser(user),
    isNewUser,
    ...tokens
  };
};
