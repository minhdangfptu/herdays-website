import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(__dirname, '../../.env') });

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const env = {
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: process.env.PORT || 8080,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI,
  mongodbDbName: process.env.MONGODB_DB_NAME || 'HerDay',
  jwtSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  refreshTokenExpiresInMs: parseNumber(process.env.REFRESH_TOKEN_EXPIRES_IN_MS, 7 * 24 * 60 * 60 * 1000),
  resetTokenExpiresIn: process.env.RESET_TOKEN_EXPIRES_IN || '10m',
  resetTokenExpiresInMs: parseNumber(process.env.RESET_TOKEN_EXPIRES_IN_MS, 10 * 60 * 1000),
  bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
  otpExpiresInMinutes: parseNumber(process.env.OTP_EXPIRES_IN_MINUTES, 5),
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    fromName: process.env.EMAIL_FROM_NAME || 'HerDays',
    logoUrl: process.env.EMAIL_LOGO_URL
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER?.trim() || 'herdays/blog'
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  }
};

const requiredEnv = [
  ['MONGODB_URI', env.mongodbUri],
  ['MONGODB_DB_NAME', env.mongodbDbName],
  ['JWT_SECRET', env.jwtSecret],
  ['REFRESH_TOKEN_SECRET', env.refreshTokenSecret]
];

const missingEnv = requiredEnv
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

export default env;
