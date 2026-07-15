export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  DELETED: 'deleted',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.DELIVERING,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.DELETED
];

export const ORDER_STATUSES = [...ORDER_STATUS_FLOW, ORDER_STATUS.CANCELLED];

export const LEGACY_ORDER_STATUS_MAP = {
  preparing: ORDER_STATUS.CONFIRMED,
  Cancel: ORDER_STATUS.CANCELLED,
  cancel: ORDER_STATUS.CANCELLED
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ',
  [ORDER_STATUS.CONFIRMED]: 'Đã duyệt',
  [ORDER_STATUS.DELIVERING]: 'Bắt đầu giao hàng',
  [ORDER_STATUS.DELIVERED]: 'Giao hàng thành công',
  [ORDER_STATUS.DELETED]: 'Đã xóa',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy'
};

export const normalizeOrderStatus = (status) => LEGACY_ORDER_STATUS_MAP[status] || status;

export const getNextOrderStatus = (status) => {
  const normalizedStatus = normalizeOrderStatus(status);
  const currentIndex = ORDER_STATUS_FLOW.indexOf(normalizedStatus);
  return currentIndex >= 0 ? ORDER_STATUS_FLOW[currentIndex + 1] || null : null;
};

export const canTransitionOrderStatus = (currentStatus, nextStatus) => (
  (
    normalizeOrderStatus(currentStatus) === ORDER_STATUS.CONFIRMED
    && normalizeOrderStatus(nextStatus) === ORDER_STATUS.CANCELLED
  )
  || getNextOrderStatus(currentStatus) === normalizeOrderStatus(nextStatus)
);
