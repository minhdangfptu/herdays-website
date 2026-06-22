import Order from '../models/orderModel.js';
import HttpError from '../utils/httpError.js';

const mapOrder = (order) => ({
  id: order._id,
  userId: order.userId,
  items: order.items,
  totalAmount: order.totalAmount,
  paymentMethod: order.paymentMethod,
  orderStatus: order.orderStatus,
  lovelyMessage: order.lovelyMessage,
  startDate: order.startDate,
  endDate: order.endDate,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

export const getOrders = async ({ page, limit, search, status }) => {
  const filter = {};

  if (status) filter.orderStatus = status;

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
      .populate('userId', 'fullName email phone'),
    Order.countDocuments(filter)
  ]);

  return {
    orders: orders.map(mapOrder),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id).populate('userId', 'fullName email phone');
  if (!order) throw new HttpError(404, 'Order not found');
  return mapOrder(order);
};

export const updateOrderStatus = async (id, status) => {
  const order = await Order.findByIdAndUpdate(
    id,
    { orderStatus: status },
    { new: true, runValidators: true }
  ).populate('userId', 'fullName email phone');

  if (!order) throw new HttpError(404, 'Order not found');
  return mapOrder(order);
};

export const getOrderStats = async () => {
  const [total, pending, confirmed, preparing, delivering, delivered, cancelled] =
    await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'confirmed' }),
      Order.countDocuments({ orderStatus: 'preparing' }),
      Order.countDocuments({ orderStatus: 'delivering' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'Cancel' })
    ]);

  return { total, pending, confirmed, preparing, delivering, delivered, cancelled };
};
