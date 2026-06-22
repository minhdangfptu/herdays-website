import Box from '../models/boxModel.js';
import HttpError from '../utils/httpError.js';

const mapBox = (b) => ({
  id: b._id,
  boxName: b.boxName,
  thumbnail: b.thumbnail,
  price: b.price,
  quantity: b.quantity,
  description: b.description,
  category: b.category,
  type: 'box'
});

export const listBox = async () => {
  const boxes = await Box.find().sort({ createdAt: -1 });
  return boxes.map(mapBox);
};

export const getBoxDetail = async (id) => {
  const box = await Box.findById(id);
  if (!box) throw new HttpError(404, 'Box not found');
  return mapBox(box);
};

export const createBox = async (data) => {
  const box = new Box(data);
  await box.save();
  return mapBox(box);
};

export const updateBox = async (id, data) => {
  const box = await Box.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!box) throw new HttpError(404, 'Box not found');
  return mapBox(box);
};

export const deleteBox = async (id) => {
  const box = await Box.findByIdAndDelete(id);
  if (!box) throw new HttpError(404, 'Box not found');
  return mapBox(box);
};
