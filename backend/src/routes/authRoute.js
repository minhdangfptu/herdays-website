import express from 'express';

import * as authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/confirm-otp', authController.confirmOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/forgot-password/email', authController.forgotPasswordByEmail);
router.post('/forgot-password/phone-number', authController.forgotPasswordByPhoneNumber);
router.post('/reset-password', authController.resetPassword);
router.put('/change-password', authMiddleware, authController.changePassword);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/social-login', authController.socialLogin);

export default router;
