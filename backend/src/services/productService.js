import Product from '../models/productModel.js';
import Box from '../models/boxModel.js';
import HttpError from '../utils/httpError.js';

const mapProduct = (p) => ({
  id: p._id,
  productName: p.productName,
  thumbnail: p.thumbnail,
  price: p.price,
  quantity: p.quantity,
  description: p.description,
  category: p.category,
  type: 'product'
});

const mapBox = (b) => ({
  id: b._id,
  productName: b.boxName,
  thumbnail: b.thumbnail,
  price: b.price,
  quantity: b.quantity,
  description: b.description,
  category: b.category,
  type: 'box'
});

// ─── READ ─────────────────────────────────────────────────────────────────────

export const listAll = async ({ search, category, sort = '-createdAt', page = 1, limit = 10 } = {}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { productName: { $regex: search, $options: 'i' } },
      { boxName: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    filter.category = category;
  }

  const skip = (page - 1) * limit;

  const [products, boxes, totalProducts, totalBoxes] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Box.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
    Box.countDocuments(filter)
  ]);

  const combined = [
    ...products.map(mapProduct),
    ...boxes.map(mapBox)
  ];

  if (sort.startsWith('-')) {
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  const totalItems = totalProducts + totalBoxes;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items: combined,
    pagination: { page, limit, totalItems, totalPages }
  };
};

export const listProducts = async ({ search, category, sort = '-createdAt', page = 1, limit = 10 } = {}) => {
  const filter = {};
  if (search) filter.$or = [{ productName: { $regex: search, $options: 'i' } }];
  if (category) filter.category = category;

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter)
  ]);

  return {
    items: products.map(mapProduct),
    pagination: { page, limit, totalItems: total, totalPages: Math.ceil(total / limit) }
  };
};

export const listBoxes = async ({ search, category, sort = '-createdAt', page = 1, limit = 10 } = {}) => {
  const filter = {};
  if (search) filter.$or = [{ boxName: { $regex: search, $options: 'i' } }];
  if (category) filter.category = category;

  const skip = (page - 1) * limit;
  const [boxes, total] = await Promise.all([
    Box.find(filter).sort(sort).skip(skip).limit(limit),
    Box.countDocuments(filter)
  ]);

  return {
    items: boxes.map(mapBox),
    pagination: { page, limit, totalItems: total, totalPages: Math.ceil(total / limit) }
  };
};

// ─── PRODUCT CRUD ──────────────────────────────────────────────────────────────

export const createProduct = async (data) => {
  const product = new Product(data);
  await product.save();
  return mapProduct(product);
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, 'Product not found');
  return mapProduct(product);
};

export const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!product) throw new HttpError(404, 'Product not found');
  return mapProduct(product);
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new HttpError(404, 'Product not found');
  return mapProduct(product);
};

// ─── BOX CRUD ────────────────────────────────────────────────────────────────

export const createBox = async (data) => {
  const box = new Box(data);
  await box.save();
  return mapBox(box);
};

export const getBoxById = async (id) => {
  const box = await Box.findById(id);
  if (!box) throw new HttpError(404, 'Box not found');
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
