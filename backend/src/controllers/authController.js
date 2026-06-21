import * as authService from '../services/authService.js';
import { sendServiceResult } from '../utils/response.js';
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
    sendServiceResult(res, { result, statusCode: 201, message: 'Đăng ký thành công' });
  } catch (error) {
    next(error);
  }
};

export const confirmOtp = async (req, res, next) => {
  try {
    const result = await authService.confirmOtp(validateConfirmOtp(req.body));
    sendServiceResult(res, { result, message: 'Xác nhận OTP thành công' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(validateLogin(req.body));
    sendServiceResult(res, { result, message: 'Đăng nhập thành công' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(validateForgotPassword(req.body));
    sendServiceResult(res, { result, message: 'Đã gửi OTP đặt lại mật khẩu' });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordByEmail = async (req, res, next) => {
  try {
    const result = await authService.forgotPasswordByEmail(validateForgotPasswordEmail(req.body));
    sendServiceResult(res, { result, message: 'Đã gửi OTP qua email' });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordByPhoneNumber = async (req, res, next) => {
  try {
    const result = await authService.forgotPasswordByPhoneNumber(validateForgotPasswordPhoneNumber(req.body));
    sendServiceResult(res, { result, message: 'Đã gửi OTP qua số điện thoại' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(validateResetPassword(req.body));
    sendServiceResult(res, { result, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, validateChangePassword(req.body));
    sendServiceResult(res, { result, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const result = await authService.logout(validateRefreshToken(req.body));
    sendServiceResult(res, { result, message: 'Đăng xuất thành công' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(validateRefreshToken(req.body));
    sendServiceResult(res, { result, message: 'Làm mới token thành công' });
  } catch (error) {
    next(error);
  }
};

export const socialLogin = async (req, res, next) => {
  try {
    const result = await authService.socialLogin(validateSocialLogin(req.body));
    sendServiceResult(res, { result, message: 'Đăng nhập mạng xã hội thành công' });
  } catch (error) {
    next(error);
  }
};
