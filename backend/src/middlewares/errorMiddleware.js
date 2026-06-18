const errorMiddleware = (err, req, res, next) => {
  void next;

  const statusCode = err.statusCode || 500;
  const payload = {
    message: err.message || 'Internal server error'
  };

  if (err.errors) payload.errors = err.errors;

  res.status(statusCode).json(payload);
};

export default errorMiddleware;
