import nodemailer from 'nodemailer';

import env from '../config/environment.js';
import HttpError from '../utils/httpError.js';

const createTransporter = () => {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password || !env.smtp.from) {
    throw new HttpError(500, 'Email provider is not configured');
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.password
    }
  });
};

export const sendOtpEmail = async (email, otp, purpose) => {
  const transporter = createTransporter();
  const subject = purpose === 'register' ? 'Verify your HerDays account' : 'Reset your HerDays password';

  await transporter.sendMail({
    from: env.smtp.from,
    to: email,
    subject,
    text: `Your HerDays OTP is ${otp}. It expires in ${env.otpExpiresInMinutes} minutes.`
  });
};
