import { createImageUploadSignature } from '../providers/cloudinaryProvider.js';
import HttpError from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

const VALID_TYPES = ['blog', 'product', 'box'];

export const createUploadSignature = (req, res, next) => {
  try {
    const type = req.query.type?.trim().toLowerCase() || 'blog';
    if (!VALID_TYPES.includes(type)) {
      throw new HttpError(400, `type must be one of: ${VALID_TYPES.join(', ')}`);
    }
    sendSuccess(res, {
      message: 'Tạo chữ ký tải ảnh thành công',
      data: createImageUploadSignature(type)
    });
  } catch (error) {
    next(error);
  }
};
