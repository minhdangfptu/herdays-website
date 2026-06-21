import * as profileService from '../services/profileService.js';
import { validateUpdateProfile } from '../validations/profileValidation.js';

export const getProfile = async (req, res, next) => {
  try {
    const result = await profileService.getProfile(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = validateUpdateProfile(req.body);
    const result = await profileService.updateProfile(req.user.id, updates);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
