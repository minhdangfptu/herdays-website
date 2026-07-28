import Product from '../models/productModel.js';
import Box from '../models/boxModel.js';
import HttpError from '../utils/httpError.js';
import { PRODUCT_CATEGORIES } from '../constants/productCategories.js';

const mapProduct = (p) => ({
  id: p._id,
  productName: p.productName,
  thumbnail: p.thumbnail,
  price: p.price,
  quantity: p.quantity,
  description: p.description,
  category: p.category,
  type: 'product',
  createdAt: p.createdAt,
  updatedAt: p.updatedAt
});

const mapBoxProduct = (item) => {
  const product = item.productId;
  const productId = product?._id || product;

  return {
    productId,
    quantity: item.quantity,
    isCustomizable: item.isCustomizable === true,
    productName: product?.productName,
    category: product?.category,
    thumbnail: product?.thumbnail,
    price: product?.price
  };
};

const mapBox = (b) => ({
  id: b._id,
  productName: b.boxName,
  boxName: b.boxName,
  thumbnail: b.thumbnail,
  price: b.price,
  quantity: b.quantity,
  description: b.description,
  category: b.category,
  productCategories: b.productCategories || [],
  products: (b.products || []).map(mapBoxProduct),
  type: 'box',
  createdAt: b.createdAt,
  updatedAt: b.updatedAt
});

const buildBoxPayload = async (data) => {
  if (!data.products) return data;

  if (!data.category) {
    throw new HttpError(400, 'Box category is required');
  }

  const productIds = [...new Set(data.products.map((item) => item.productId.toString()))];
  const products = await Product.find({ _id: { $in: productIds } }).select('category');
  if (products.length !== productIds.length) {
    throw new HttpError(404, 'Some products were not found');
  }

  const productCategories = [
    ...new Set(products.map((product) => product.category).filter(Boolean))
  ];

  return {
    ...data,
    productCategories,
    category: data.category
  };
};

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

export const listProductCategories = async () => {
  return PRODUCT_CATEGORIES;
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
    Box.find(filter).sort(sort).skip(skip).limit(limit).populate('products.productId'),
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
  const box = new Box(await buildBoxPayload(data));
  await box.save();
  await box.populate('products.productId');
  return mapBox(box);
};

export const getBoxById = async (id) => {
  const box = await Box.findById(id).populate('products.productId');
  if (!box) throw new HttpError(404, 'Box not found');
  return mapBox(box);
};

export const updateBox = async (id, data) => {
  const box = await Box.findByIdAndUpdate(id, await buildBoxPayload(data), { new: true, runValidators: true })
    .populate('products.productId');
  if (!box) throw new HttpError(404, 'Box not found');
  return mapBox(box);
};

export const deleteBox = async (id) => {
  const box = await Box.findByIdAndDelete(id);
  if (!box) throw new HttpError(404, 'Box not found');
  return mapBox(box);
};
