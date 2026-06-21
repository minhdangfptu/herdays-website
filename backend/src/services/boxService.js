import Box from '../models/boxModel.js';
import HttpError from '../utils/httpError.js';

export const listBox = async () => {
  const boxes = await Box.find().sort({ createdAt: -1 });

  return boxes.map(box => ({
    id: box._id,
    boxName: box.boxName,
    thumbnail: box.thumbnail,
    price: box.price
  }));
};

export const getBoxDetail = async (id) => {
  const box = await Box.findById(id);
  if (!box) throw new HttpError(404, 'Box not found');

  return {
    id: box._id,
    boxName: box.boxName,
    thumbnail: box.thumbnail,
    price: box.price,
    quantity: box.quantity,
    description: box.description
  };
};
