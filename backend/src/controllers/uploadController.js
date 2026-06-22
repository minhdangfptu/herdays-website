import { createImageUploadSignature } from '../providers/cloudinaryProvider.js';
import { sendSuccess } from '../utils/response.js';

export const createUploadSignature = (req, res, next) => {
  try {
    void req;
    sendSuccess(res, {
      message: 'Tạo chữ ký tải ảnh thành công',
      data: createImageUploadSignature()
    });
  } catch (error) {
    next(error);
  }
};
