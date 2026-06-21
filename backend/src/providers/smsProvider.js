import twilio from 'twilio';

import env from '../config/environment.js';
import HttpError from '../utils/httpError.js';

const createClient = () => {
  if (!env.twilio.accountSid || !env.twilio.authToken || !env.twilio.phoneNumber) {
    throw new HttpError(500, 'SMS provider is not configured');
  }

  return twilio(env.twilio.accountSid, env.twilio.authToken);
};

export const sendOtpSms = async (phoneNumber, otp) => {
  const client = createClient();

  await client.messages.create({
    body: `Your HerDays OTP is ${otp}. It expires in ${env.otpExpiresInMinutes} minutes.`,
    from: env.twilio.phoneNumber,
    to: phoneNumber
  });
};
