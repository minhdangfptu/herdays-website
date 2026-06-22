import HttpError from '../utils/httpError.js';

const notFoundMiddleware = (req, res, next) => {
  void res;
  next(new HttpError(404, `Không tìm thấy API ${req.method} ${req.originalUrl}`));
};

export default notFoundMiddleware;
