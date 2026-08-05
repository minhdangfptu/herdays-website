import * as orderService from '../services/orderService.js';
import {
  validateCreateOrder,
  validateOrderQuery,
  validateOrderId,
  validateOrderStatus,
  validateOrderCreatedAt
} from '../validations/orderValidation.js';
import { sendSuccess } from '../utils/response.js';

export const getOrders = async (req, res, next) => {
  try {
    const { page, limit, search, status } = validateOrderQuery(req.query);
    const result = await orderService.getOrders({ page, limit, search, status });
    sendSuccess(res, {
      message: 'Lấy danh sách đơn hàng thành công',
      data: result.orders,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportOrders = async (req, res, next) => {
  try {
    const { search, status } = validateOrderQuery(req.query);
    const { buffer, fileName } = await orderService.exportOrders({ search, status });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length
    });
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.id);
    sendSuccess(res, {
      message: 'Lấy danh sách đơn hàng của bạn thành công',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrder = async (req, res, next) => {
  try {
    const id = validateOrderId(req.params.id);
    const order = await orderService.getOrderByIdForUser(id, req.user.id);
    sendSuccess(res, {
      message: 'Lấy chi tiết đơn hàng của bạn thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const createOrderFromCart = async (req, res, next) => {
  try {
    const order = await orderService.createOrderFromCart(
      req.user.id,
      validateCreateOrder(req.body)
    );

    sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const id = validateOrderId(req.params.id);
    const order = await orderService.cancelOrderForUser(id, req.user.id);
    sendSuccess(res, {
      message: 'Hủy đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const id = validateOrderId(req.params.id);
    const order = await orderService.getOrderById(id);
    sendSuccess(res, {
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const id = validateOrderId(req.params.id);
    const status = validateOrderStatus(req.body.orderStatus);
    const order = await orderService.updateOrderStatus(id, status);
    sendSuccess(res, {
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const updateCreatedAt = async (req, res, next) => {
  try {
    const id = validateOrderId(req.params.id);
    const createdAt = validateOrderCreatedAt(req.body?.createdAt);
    const order = await orderService.updateOrderCreatedAt(id, createdAt);
    sendSuccess(res, {
      message: 'Cập nhật thời gian tạo đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    void req;
    const stats = await orderService.getOrderStats();
    sendSuccess(res, {
      message: 'Lấy thống kê đơn hàng thành công',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
