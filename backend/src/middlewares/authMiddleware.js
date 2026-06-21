import jwt from 'jsonwebtoken';

import env from '../config/environment.js';
import User from '../models/userModel.js';
import HttpError from '../utils/httpError.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.id);

    if (!user || !user.isVerified) {
      throw new HttpError(401, 'Unauthorized');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone
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

export default authMiddleware;
