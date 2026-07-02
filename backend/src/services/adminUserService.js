import RefreshToken from '../models/refreshTokenModel.js';
import User from '../models/userModel.js';
import HttpError from '../utils/httpError.js';

const LIST_FIELDS = {
  email: 1, phone: 1, fullName: 1, role: 1,
  targetStatus: 1, isVerified: 1, isDisabled: 1, dateOfBirth: 1,
  address: 1, createdAt: 1, updatedAt: 1
};

export const listUsers = async ({ page, limit, search, role, isVerified, sortBy, sortOrder }) => {
  const filter = {};

  if (role) filter.role = role;
  if (isVerified !== undefined) filter.isVerified = isVerified === true || isVerified === 'true';
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    User.find(filter, LIST_FIELDS).sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId, LIST_FIELDS).lean();
  if (!user) throw new HttpError(404, 'User not found');
  return user;
};

export const disableUser = async (adminUserId, targetUserId) => {
  if (adminUserId === targetUserId) throw new HttpError(400, 'Cannot disable own account');

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { $set: { isDisabled: true } },
    { new: true, runValidators: true, projection: LIST_FIELDS }
  ).lean();

  if (!user) throw new HttpError(404, 'User not found');

  await RefreshToken.updateMany(
    { userId: targetUserId, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  return user;
};
