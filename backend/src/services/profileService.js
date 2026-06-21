import User from '../models/userModel.js';
import HttpError from '../utils/httpError.js';

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, 'User not found');

  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
    targetStatus: user.targetStatus,
    accountClass: user.role
  };
};

export const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, 'User not found');

  Object.assign(user, updates);
  await user.save();

  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
    targetStatus: user.targetStatus,
    accountClass: user.role
  };
};
