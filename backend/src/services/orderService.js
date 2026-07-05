import Order from '../models/orderModel.js';
import Box from '../models/boxModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import HttpError from '../utils/httpError.js';

const SUCCESS_DELETE_DELAY_MS = 10 * 60 * 1000;

const mapUser = (user) => {
  if (!user || !user._id) return null;
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone
  };
};

const mapOrderItem = (item, itemMap = new Map()) => {
  const detail = itemMap.get(item.itemId.toString());
  return {
    itemId: item.itemId,
    isBox: item.isBox,
    quantity: item.quantity,
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
  orderStatus: order.orderStatus,
  lovelyMessage: order.lovelyMessage,
  startDate: order.startDate,
  endDate: order.endDate,
  deleteAt: order.deleteAt,
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

export const createOrderFromCart = async (userId, { paymentMethod = 'bank_transfer', lovelyMessage = '' } = {}) => {
  const session = await Order.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart || cart.items.length === 0) {
        throw new HttpError(400, 'Cart is empty');
      }

      const boxIds = cart.items.map((item) => item.boxId);
      const boxes = await Box.find({ _id: { $in: boxIds } }).session(session);
      const boxById = new Map(boxes.map((box) => [box._id.toString(), box]));

      const items = cart.items.map((cartItem) => {
        const box = boxById.get(cartItem.boxId.toString());
        if (!box) throw new HttpError(404, 'Box not found');
        if (box.quantity < cartItem.quantity) {
          throw new HttpError(400, `${box.boxName} does not have enough stock`);
        }

        return {
          itemId: box._id,
          isBox: true,
          quantity: cartItem.quantity,
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

      cart.items = [];
      await cart.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const itemMap = await getOrderItemMap([createdOrder]);
  return mapOrder(createdOrder, itemMap);
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id).populate('userId', 'fullName email phone');
  if (!order) throw new HttpError(404, 'Order not found');
  const itemMap = await getOrderItemMap([order]);
  return mapOrder(order, itemMap);
};

export const updateOrderStatus = async (id, status) => {
  const update = {
    orderStatus: status,
    deleteAt: status === 'delivered' ? new Date(Date.now() + SUCCESS_DELETE_DELAY_MS) : null
  };

  const order = await Order.findByIdAndUpdate(
    id,
    update,
    { new: true, runValidators: true }
  ).populate('userId', 'fullName email phone');

  if (!order) throw new HttpError(404, 'Order not found');
  const itemMap = await getOrderItemMap([order]);
  return mapOrder(order, itemMap);
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
