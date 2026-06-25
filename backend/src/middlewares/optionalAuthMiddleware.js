import jwt from 'jsonwebtoken';

import env from '../config/environment.js';
import User from '../models/userModel.js';
import HttpError from '../utils/httpError.js';

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next();
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Unauthorized');
    }

    const token = authHeader.slice(7).trim();
    if (!token) throw new HttpError(401, 'Invalid or expired token');

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.id);

    if (!user || !user.isVerified) {
      throw new HttpError(401, 'Unauthorized');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new HttpError(401, 'Invalid or expired token'));
      return;
    }

    next(error);
  }
};

export default optionalAuthMiddleware;
