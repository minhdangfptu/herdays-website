import jwt from 'jsonwebtoken';

import env from '../config/environment.js';

const buildError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const extractToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token;
};

const getUserIdFromPayload = (payload) => payload?.id || payload?.userId || payload?._id || payload?.sub;

const attachOptionalChatUser = (req, res, next) => {
  void res;

  try {
    const token = extractToken(req.headers.authorization);
    if (!token) return next();

    const payload = jwt.verify(token, env.jwtSecret);
    if (!payload || typeof payload !== 'object') {
      throw buildError(401, 'Token không hợp lệ');
    }

    const userId = getUserIdFromPayload(payload);

    if (!userId) {
      throw buildError(401, 'Token không hợp lệ');
    }

    req.user = {
      ...payload,
      id: userId
    };

    return next();
  } catch (error) {
    if (error.statusCode) return next(error);
    return next(buildError(401, 'Token không hợp lệ hoặc đã hết hạn'));
  }
};

export default attachOptionalChatUser;
