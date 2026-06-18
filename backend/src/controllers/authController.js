import * as authService from '../services/authService.js';
import {
  validateChangePassword,
  validateConfirmOtp,
  validateForgotPassword,
  validateForgotPasswordEmail,
  validateForgotPasswordPhoneNumber,
  validateLogin,
  validateRefreshToken,
  validateRegister,
  validateResetPassword,
  validateSocialLogin
} from '../validations/authValidation.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(validateRegister(req.body));
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const confirmOtp = async (req, res, next) => {
  try {
    const result = await authService.confirmOtp(validateConfirmOtp(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(validateLogin(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(validateForgotPassword(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordByEmail = async (req, res, next) => {
  try {
    const result = await authService.forgotPasswordByEmail(validateForgotPasswordEmail(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordByPhoneNumber = async (req, res, next) => {
  try {
    const result = await authService.forgotPasswordByPhoneNumber(validateForgotPasswordPhoneNumber(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(validateResetPassword(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, validateChangePassword(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const result = await authService.logout(validateRefreshToken(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(validateRefreshToken(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const socialLogin = async (req, res, next) => {
  try {
    const result = await authService.socialLogin(validateSocialLogin(req.body));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
