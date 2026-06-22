import env from '../config/environment.js';

const getMongooseValidationErrors = (error) => Object.entries(error.errors).map(([field, detail]) => ({
  field,
  message: detail.message
}));

const normalizeError = (error) => {
  if (error.name === 'ValidationError') {
    return {
      statusCode: 400,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: getMongooseValidationErrors(error)
    };
  }

  if (error.name === 'CastError') {
    return {
      statusCode: 400,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: [{ field: error.path || null, message: error.message }]
    };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || null;
    return {
      statusCode: 409,
      message: 'Dữ liệu đã tồn tại trong hệ thống',
      errors: [{ field, message: field ? `${field} đã tồn tại` : 'Dữ liệu đã tồn tại' }]
    };
  }

  const statusCode = error.statusCode || error.status || 500;
  const errors = error.errors || (
    statusCode === 400
      ? [{ field: null, message: error.message || 'Dữ liệu đầu vào không hợp lệ' }]
      : null
  );

  return {
    statusCode,
    message: error.message || 'Yêu cầu không thể xử lý',
    errors
  };
};

const errorMiddleware = (error, req, res, next) => {
  void req;
  void next;

  const normalized = normalizeError(error);
  const isServerError = normalized.statusCode >= 500;

  if (isServerError) {
    process.stderr.write(`${error.stack || error.message || 'Unknown server error'}\n`);
  }

  res.status(normalized.statusCode).json({
    success: false,
    statusCode: normalized.statusCode,
    message: isServerError
      ? 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau!'
      : normalized.message,
    data: null,
    meta: null,
    errors: isServerError && env.nodeEnv === 'production'
      ? null
      : normalized.errors || (isServerError ? error.message : null)
  });
};

export default errorMiddleware;
