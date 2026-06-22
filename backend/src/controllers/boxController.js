import * as boxService from '../services/boxService.js';
import { sendSuccess } from '../utils/response.js';

export const listBox = async (req, res, next) => {
  try {
    void req;
    const boxes = await boxService.listBox();
    sendSuccess(res, {
      message: 'Lấy danh sách box thành công',
      data: boxes
    });
  } catch (error) {
    next(error);
  }
};

export const getBoxDetail = async (req, res, next) => {
  try {
    const box = await boxService.getBoxDetail(req.params.id);
    sendSuccess(res, {
      message: 'Lấy chi tiết box thành công',
      data: box
    });
  } catch (error) {
    next(error);
  }
};
