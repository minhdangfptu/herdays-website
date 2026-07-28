import Order from '../models/orderModel.js';
import Box from '../models/boxModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  canTransitionOrderStatus,
  getNextOrderStatus,
  normalizeOrderStatus
} from '../constants/orderStatus.js';
import HttpError from '../utils/httpError.js';

const DELETED_ORDER_TTL_MS = 10 * 60 * 1000;

const getStatusFilter = (status) => {
  if (status === ORDER_STATUS.CONFIRMED) {
    return { $in: [ORDER_STATUS.CONFIRMED, 'preparing'] };
  }

  if (status === ORDER_STATUS.CANCELLED) {
    return { $in: [ORDER_STATUS.CANCELLED, 'Cancel', 'cancel'] };
  }

  if (status === ORDER_STATUS.DELETED) {
    return ORDER_STATUS.DELETED;
  }

  return status;
};

const mapUser = (user) => {
  if (!user || !user._id) return null;
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address
  };
};

const mapOrderItem = (item, itemMap = new Map()) => {
  const detail = itemMap.get(item.itemId.toString());
  return {
    itemId: item.itemId,
    isBox: item.isBox,
    quantity: item.quantity,
    customizedProducts: item.customizedProducts || [],
    price: item.price,
    itemName: detail?.itemName || null,
    thumbnail: detail?.thumbnail || null,
    category: detail?.category || null
  };
};

const getOrderItemMap = async (orders) => {
  const boxIds = new Set();
  const productIds = new Set();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.isBox) boxIds.add(item.itemId.toString());
      else productIds.add(item.itemId.toString());
    });
  });

  const [boxes, products] = await Promise.all([
    boxIds.size ? Box.find({ _id: { $in: [...boxIds] } }).select('boxName thumbnail category') : [],
    productIds.size ? Product.find({ _id: { $in: [...productIds] } }).select('productName thumbnail category') : []
  ]);

  return new Map([
    ...boxes.map((box) => [box._id.toString(), {
      itemName: box.boxName,
      thumbnail: box.thumbnail,
      category: box.category
    }]),
    ...products.map((product) => [product._id.toString(), {
      itemName: product.productName,
      thumbnail: product.thumbnail,
      category: product.category
    }])
  ]);
};

const mapOrder = (order, itemMap) => ({
  id: order._id,
  userId: order.userId?._id || order.userId,
  user: mapUser(order.userId),
  items: order.items.map((item) => mapOrderItem(item, itemMap)),
  totalAmount: order.totalAmount,
  paymentMethod: order.paymentMethod,
  orderStatus: normalizeOrderStatus(order.orderStatus),
  lovelyMessage: order.lovelyMessage,
  startDate: order.startDate,
  endDate: order.endDate,
  deleteAt: order.deleteAt,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

export const getOrders = async ({ page, limit, search, status }) => {
  const filter = {};

  if (status) filter.orderStatus = getStatusFilter(status);

  if (search) {
    filter.$or = [
      { 'items.itemId': { $regex: search, $options: 'i' } },
      { 'items.isBox': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email phone address'),
    Order.countDocuments(filter)
  ]);

  const itemMap = await getOrderItemMap(orders);

  return {
    orders: orders.map((order) => mapOrder(order, itemMap)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getOrdersByUser = async (userId) => {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  const itemMap = await getOrderItemMap(orders);
  return orders.map((order) => mapOrder(order, itemMap));
};

export const createOrderFromCart = async (userId, { paymentMethod = 'bank_transfer', lovelyMessage = '', boxIds } = {}) => {
  const session = await Order.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart || cart.items.length === 0) {
        throw new HttpError(400, 'Cart is empty');
      }

      const selectedBoxIdSet = Array.isArray(boxIds) && boxIds.length > 0
        ? new Set(boxIds.map((boxId) => boxId.toString()))
        : null;
      const selectedCartItems = selectedBoxIdSet
        ? cart.items.filter((item) => selectedBoxIdSet.has(item.boxId.toString()))
        : cart.items;

      if (selectedCartItems.length === 0) {
        throw new HttpError(400, 'Selected cart items are empty');
      }

      const cartBoxIds = selectedCartItems.map((item) => item.boxId);
      const boxes = await Box.find({ _id: { $in: cartBoxIds } }).session(session);
      const boxById = new Map(boxes.map((box) => [box._id.toString(), box]));

      const items = selectedCartItems.map((cartItem) => {
        const box = boxById.get(cartItem.boxId.toString());
        if (!box) throw new HttpError(404, 'Box not found');
        if (box.quantity < cartItem.quantity) {
          throw new HttpError(400, `${box.boxName} does not have enough stock`);
        }

        return {
          itemId: box._id,
          isBox: true,
          quantity: cartItem.quantity,
          customizedProducts: cartItem.customizedProducts || [],
          price: box.price
        };
      });

      const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

      [createdOrder] = await Order.create([{
        userId,
        items,
        totalAmount,
        paymentMethod,
        lovelyMessage
      }], { session });

      const stockUpdates = await Promise.all(items.map((item) => (
        Box.updateOne(
          { _id: item.itemId, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { session }
        )
      )));

      if (stockUpdates.some((result) => result.modifiedCount !== 1)) {
        throw new HttpError(400, 'Some items do not have enough stock');
      }

      if (selectedBoxIdSet) {
        cart.items = cart.items.filter((item) => !selectedBoxIdSet.has(item.boxId.toString()));
      } else {
        cart.items = [];
      }
      await cart.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const itemMap = await getOrderItemMap([createdOrder]);
  return mapOrder(createdOrder, itemMap);
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id).populate('userId', 'fullName email phone address');
  if (!order) throw new HttpError(404, 'Order not found');
  const itemMap = await getOrderItemMap([order]);
  return mapOrder(order, itemMap);
};

export const getOrderByIdForUser = async (id, userId) => {
  const order = await Order.findOne({ _id: id, userId });
  if (!order) throw new HttpError(404, 'Order not found');
  const itemMap = await getOrderItemMap([order]);
  return mapOrder(order, itemMap);
};

export const cancelOrderForUser = async (id, userId) => {
  const session = await Order.startSession();
  let cancelledOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: id, userId }).session(session);
      if (!order) throw new HttpError(404, 'Order not found');

      const currentStatus = normalizeOrderStatus(order.orderStatus);
      if (currentStatus !== ORDER_STATUS.PENDING) {
        throw new HttpError(400, 'Only pending orders can be cancelled');
      }

      const boxItems = order.items.filter((item) => item.isBox);
      await Promise.all(boxItems.map((item) => (
        Box.updateOne(
          { _id: item.itemId },
          { $inc: { quantity: item.quantity } },
          { session }
        )
      )));

      order.orderStatus = ORDER_STATUS.CANCELLED;
      order.deleteAt = null;
      cancelledOrder = await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const itemMap = await getOrderItemMap([cancelledOrder]);
  return mapOrder(cancelledOrder, itemMap);
};

export const updateOrderStatus = async (id, status) => {
  const session = await Order.startSession();
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(id)
        .populate('userId', 'fullName email phone address')
        .session(session);
      if (!order) throw new HttpError(404, 'Order not found');

      const currentStatus = normalizeOrderStatus(order.orderStatus);

      if (currentStatus === status) {
        updatedOrder = order;
        return;
      }

      if (!canTransitionOrderStatus(currentStatus, status)) {
        const nextStatus = getNextOrderStatus(currentStatus);
        const currentLabel = ORDER_STATUS_LABELS[currentStatus] || currentStatus;
        const nextLabel = nextStatus ? ORDER_STATUS_LABELS[nextStatus] : null;

        throw new HttpError(
          400,
          nextLabel
            ? `Order status can only move from ${currentLabel} to ${nextLabel}`
            : `Order status ${currentLabel} cannot be changed`
        );
      }

      if (status === ORDER_STATUS.CANCELLED) {
        const boxItems = order.items.filter((item) => item.isBox);
        await Promise.all(boxItems.map((item) => (
          Box.updateOne(
            { _id: item.itemId },
            { $inc: { quantity: item.quantity } },
            { session }
          )
        )));
      }

      order.orderStatus = status;
      order.deleteAt = status === ORDER_STATUS.DELETED ? new Date(Date.now() + DELETED_ORDER_TTL_MS) : null;
      updatedOrder = await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const itemMap = await getOrderItemMap([updatedOrder]);
  return mapOrder(updatedOrder, itemMap);
};

export const getOrderStats = async () => {
  const [total, pending, confirmed, delivering, delivered, deleted, cancelled] =
    await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),
      Order.countDocuments({ orderStatus: { $in: [ORDER_STATUS.CONFIRMED, 'preparing'] } }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.DELIVERING }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.DELIVERED }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.DELETED }),
      Order.countDocuments({ orderStatus: { $in: [ORDER_STATUS.CANCELLED, 'Cancel', 'cancel'] } })
    ]);

  return { total, pending, confirmed, delivering, delivered, deleted, cancelled };
};
