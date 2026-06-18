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

const getEmailTitle = (purpose) => (
  purpose === 'register'
    ? 'Verify your HerDays account'
    : 'Reset your HerDays password'
);

const getEmailDescription = (purpose) => (
  purpose === 'register'
    ? 'Use this code to verify your account and finish joining HerDays.'
    : 'Use this code to reset your HerDays password.'
);

const buildOtpEmailHtml = (otp, purpose) => {
  const title = getEmailTitle(purpose);
  const description = getEmailDescription(purpose);
  const logoHtml = env.smtp.logoUrl
    ? `<img src="${env.smtp.logoUrl}" alt="HerDays" width="92" style="display:block;margin:0 auto 16px;border:0;outline:none;text-decoration:none;">`
    : '<div style="font-size:28px;line-height:34px;font-weight:700;letter-spacing:2px;color:#ffffff;margin-bottom:16px;">HERDAYS</div>';

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fff5fa;font-family:Arial,Helvetica,sans-serif;color:#3b2430;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff5fa;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #ffd1e6;">
            <tr>
              <td style="background:linear-gradient(135deg,#ff4fab,#e31582);padding:34px 28px;text-align:center;">
                ${logoHtml}
                <div style="font-size:22px;line-height:30px;font-weight:700;color:#ffffff;">${title}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;text-align:center;">
                <p style="margin:0 0 22px;font-size:15px;line-height:24px;color:#6f4a5d;">${description}</p>
                <div style="display:inline-block;background:#fff0f7;border:1px solid #ffbddc;border-radius:14px;padding:16px 26px;font-size:34px;line-height:40px;font-weight:700;letter-spacing:8px;color:#d41473;">
                  ${otp}
                </div>
                <p style="margin:22px 0 0;font-size:13px;line-height:20px;color:#8a6b7b;">This code expires in ${env.otpExpiresInMinutes} minutes. If you did not request it, you can ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;text-align:center;background:#fff8fb;color:#a27b90;font-size:12px;line-height:18px;">
                HerDays - Caring for your journey
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const sendOtpEmail = async (email, otp, purpose) => {
  const transporter = createTransporter();
  const subject = getEmailTitle(purpose);

  await transporter.sendMail({
    from: `"${env.smtp.fromName}" <${env.smtp.from}>`,
    to: email,
    subject,
    text: `Your HerDays OTP is ${otp}. It expires in ${env.otpExpiresInMinutes} minutes.`,
    html: buildOtpEmailHtml(otp, purpose)
  });
};
