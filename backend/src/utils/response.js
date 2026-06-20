export const sendSuccess = (res, {
  statusCode = 200,
  message = 'Thao tác thành công',
  data = null,
  meta = null
} = {}) => res.status(statusCode).json({
  success: true,
  statusCode,
  message,
  data,
  meta,
  errors: null
});

export const sendServiceResult = (res, {
  result,
  statusCode = 200,
  message = 'Thao tác thành công'
}) => {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return sendSuccess(res, { statusCode, message, data: result ?? null });
  }

  const { message: serviceMessage, ...data } = result;
  return sendSuccess(res, {
    statusCode,
    message: serviceMessage || message,
    data: Object.keys(data).length > 0 ? data : null
  });
};
