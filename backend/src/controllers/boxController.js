import * as boxService from '../services/boxService.js';

export const listBox = async (req, res, next) => {
  try {
    const boxes = await boxService.listBox();
    res.status(200).json(boxes);
  } catch (error) {
    next(error);
  }
};

export const getBoxDetail = async (req, res, next) => {
  try {
    const box = await boxService.getBoxDetail(req.params.id);
    res.status(200).json(box);
  } catch (error) {
    next(error);
  }
};
