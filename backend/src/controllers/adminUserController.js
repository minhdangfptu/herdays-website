import * as adminUserService from '../services/adminUserService.js';
import { sendSuccess } from '../utils/response.js';

const VALID_ROLES = ['user_free', 'user_premium', 'admin', 'others'];
const VALID_SORT_BY = ['createdAt', 'updatedAt', 'email', 'fullName', 'role'];
const VALID_SORT_ORDER = ['asc', 'desc'];

export const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const search = req.query.search?.trim() || null;
    const role = VALID_ROLES.includes(req.query.role) ? req.query.role : null;
    const isVerified = req.query.isVerified;
    const sortBy = VALID_SORT_BY.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = VALID_SORT_ORDER.includes(req.query.sortOrder) ? req.query.sortOrder : 'desc';

    const result = await adminUserService.listUsers({
      page, limit, search, role, isVerified, sortBy, sortOrder
    });

    sendSuccess(res, {
      message: 'Lấy danh sách người dùng thành công',
      data: result.items,
      meta: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await adminUserService.getUserById(req.params.id);
    sendSuccess(res, {
      message: 'Lấy chi tiết người dùng thành công',
      data: user
    });
  } catch (error) {
    next(error);
  }
};
