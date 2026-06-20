import HttpError from '../utils/httpError.js';

const adminMiddleware = (req, res, next) => {
  void res;

  if (req.user?.role !== 'admin') {
    next(new HttpError(403, 'Admin access is required'));
    return;
  }

  next();
};

export default adminMiddleware;
