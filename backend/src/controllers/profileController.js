import * as profileService from '../services/profileService.js';
import { sendSuccess } from '../utils/response.js';
import { validateUpdateProfile } from '../validations/profileValidation.js';

export const getProfile = async (req, res, next) => {
  try {
    const result = await profileService.getProfile(req.user.id);
    sendSuccess(res, {
      message: 'Lấy thông tin hồ sơ thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = validateUpdateProfile(req.body);
    const result = await profileService.updateProfile(req.user.id, updates);
    sendSuccess(res, {
      message: 'Cập nhật hồ sơ thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
