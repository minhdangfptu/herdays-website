import * as orderService from '../services/orderService.js';
import { validateOrderQuery, validateOrderId, validateOrderStatus } from '../validations/orderValidation.js';
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
