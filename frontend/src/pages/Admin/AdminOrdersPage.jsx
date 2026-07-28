import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  SlidersHorizontal
} from 'lucide-react';

import { adminApi } from '../../services/apiService.js';
import { TableSkeleton } from '../../components/Skeleton.jsx';

const PAGE_SIZE = 10;
const ADMIN_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

const ORDER_STATUSES = [
  { value: 'pending', label: 'Chờ', className: 'bg-orange-50 text-orange-600' },
  { value: 'confirmed', label: 'Đã duyệt', className: 'bg-blue-50 text-blue-600' },
  { value: 'delivering', label: 'Bắt đầu giao hàng', className: 'bg-violet-50 text-violet-600' },
  { value: 'delivered', label: 'Giao hàng thành công', className: 'bg-emerald-50 text-emerald-600' },
  { value: 'deleted', label: 'Đã xóa', className: 'bg-slate-100 text-slate-500' },
  { value: 'cancelled', label: 'Đã hủy', className: 'bg-red-50 text-red-600' }
];
const ORDER_STATUS_FLOW = ['pending', 'confirmed', 'delivering', 'delivered', 'deleted'];

const STATUS_META = ORDER_STATUSES.reduce((map, status) => ({
  ...map,
  [status.value]: status
}), {});

const formatCurrency = (value) => (
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)
);

const formatTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(value));
};

const getPagination = (pagination, page) => ({
  page,
  totalPages: pagination?.totalPages || 1,
  totalItems: pagination?.total || pagination?.totalItems || 0
});

const getNextStatus = (status) => {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);
  return currentIndex >= 0 ? ORDER_STATUS_FLOW[currentIndex + 1] || null : null;
};

const getSelectableStatuses = (status) => {
  const nextStatus = getNextStatus(status);
  const allowedStatuses = status === 'confirmed'
    ? [status, nextStatus, 'cancelled']
    : [status, nextStatus];
  return ORDER_STATUSES.filter((item) => allowedStatuses.includes(item.value));
};

function OrderStatusConfirmModal({ change, isSubmitting, onCancel, onConfirm }) {
  useEffect(() => {
    if (!change) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) onCancel();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [change, isSubmitting, onCancel]);

  if (!change) return null;

  const isCancelling = change.nextStatus === 'cancelled';
  const title = isCancelling ? 'Xác nhận hủy đơn hàng' : 'Xác nhận xóa đơn hàng';
  const description = isCancelling
    ? 'Đơn hàng sẽ chuyển sang trạng thái Đã hủy và số lượng sản phẩm sẽ được hoàn lại kho.'
    : 'Đơn hàng sẽ chuyển sang trạng thái Đã xóa và tự động bị xóa khỏi hệ thống sau 10 phút.';
  const confirmLabel = isCancelling ? 'Xác nhận hủy' : 'Xác nhận xóa';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6"
      onClick={isSubmitting ? undefined : onCancel}
    >
      <section
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-status-confirm-title"
        aria-describedby="order-status-confirm-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle size={24} aria-hidden="true" />
          </span>
          <div>
            <h2 id="order-status-confirm-title" className="text-lg font-bold text-slate-900">{title}</h2>
            <p id="order-status-confirm-description" className="mt-2 text-sm font-medium leading-6 text-slate-500">
              {description}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Mã đơn: {String(change.order.id).slice(-8)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Quay lại
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="h-10 min-w-32 rounded-lg bg-red-500 px-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isActive = true;

    const fetchOrders = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await adminApi.getOrders({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch,
          status
        });

        if (!isActive) return;
        setOrders(result.orders || []);
        setPagination(getPagination(result.pagination, page));
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchOrders();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, page, status]);

  const applyStatusChange = async (order, nextStatus) => {
    setUpdatingOrderId(order.id);

    try {
      const updatedOrder = await adminApi.updateOrderStatus(order.id, nextStatus);
      setOrders((current) => current.map((item) => (
        item.id === order.id ? updatedOrder : item
      )));
      toast.success(
        nextStatus === 'deleted'
          ? 'Đã chuyển sang trạng thái đã xóa. Đơn sẽ tự xóa khỏi hệ thống sau 10 phút.'
          : nextStatus === 'cancelled'
            ? 'Đã hủy đơn hàng và hoàn lại số lượng vào kho.'
            : 'Đã cập nhật trạng thái đơn hàng'
      );
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStatusChange = async (order, nextStatus) => {
    if (!nextStatus || nextStatus === order.orderStatus) return;
    const allowedNextStatuses = order.orderStatus === 'confirmed'
      ? [getNextStatus(order.orderStatus), 'cancelled']
      : [getNextStatus(order.orderStatus)];
    if (!allowedNextStatuses.includes(nextStatus)) {
      toast.error('Trạng thái đơn hàng chỉ được chuyển sang bước kế tiếp.');
      return;
    }

    if (nextStatus === 'cancelled' || nextStatus === 'deleted') {
      setPendingStatusChange({ order, nextStatus });
      return;
    }

    await applyStatusChange(order, nextStatus);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const isUpdated = await applyStatusChange(
      pendingStatusChange.order,
      pendingStatusChange.nextStatus
    );
    if (isUpdated) setPendingStatusChange(null);
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-white px-5 py-6 sm:px-8" style={{ fontFamily: ADMIN_FONT_FAMILY }}>
      <section className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Quản lý đơn hàng</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Luồng xử lý: Chờ → Đã duyệt → Bắt đầu giao hàng → Giao hàng thành công → Đã xóa. Đơn đã duyệt cũng có thể chuyển sang Đã hủy.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={16} />
            Export
          </button>
        </div>

        <div className="mb-3 flex flex-col gap-3 rounded-lg bg-slate-50 p-3 lg:flex-row lg:items-center">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm đơn hàng..."
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
          >
            <option value="">Trạng thái</option>
            {ORDER_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            Gỡ bộ lọc
            <SlidersHorizontal size={15} />
          </button>

          <span className="ml-auto text-sm font-semibold text-slate-500">
            Tổng: <strong className="text-slate-800">{pagination.totalItems}</strong>
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-100 bg-white">
          <table className="w-full min-w-[1240px] border-collapse text-left">
            <thead className="bg-white text-xs font-bold uppercase tracking-wide text-slate-400">
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4">Mã đơn hàng</th>
                <th className="px-5 py-4">Mã người dùng</th>
                <th className="px-5 py-4">Tên người dùng</th>
                <th className="px-5 py-4">Địa chỉ</th>
                <th className="px-5 py-4">Sản phẩm</th>
                <th className="px-5 py-4">Số lượng</th>
                <th className="px-5 py-4">Tổng tiền</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Tự xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className="px-5 py-6" colSpan={9}>
                    <TableSkeleton columns={9} rows={6} />
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td className="px-5 py-10 text-center font-semibold text-red-500" colSpan={9}>{errorMessage}</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center font-semibold text-slate-400" colSpan={9}>Không có đơn hàng phù hợp.</td>
                </tr>
              ) : orders.map((order, index) => {
                const statusMeta = STATUS_META[order.orderStatus] || STATUS_META.pending;
                const products = (order.items || []).map((item) => item.itemName || item.itemId).join(', ');
                const totalQuantity = (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
                const isUpdating = updatingOrderId === order.id;
                const selectableStatuses = getSelectableStatuses(order.orderStatus);
                const statusOptions = selectableStatuses.length > 0
                  ? selectableStatuses
                  : [{ value: order.orderStatus, label: order.orderStatus }];

                return (
                  <tr key={order.id} className="transition hover:bg-pink-50/30">
                    <td className="px-5 py-4 text-sm font-bold text-slate-800">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-500">{String(order.userId || '').slice(-6) || '--'}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-800">{order.user?.fullName || order.user?.email || 'Người dùng'}</p>
                      {order.user?.phone && <p className="mt-1 text-xs font-medium text-slate-400">{order.user.phone}</p>}
                    </td>
                    <td className="max-w-[220px] px-5 py-4 text-sm font-semibold text-slate-600">
                      <span className="line-clamp-2">{order.user?.address || 'Chưa cập nhật'}</span>
                    </td>
                    <td className="max-w-[260px] px-5 py-4 text-sm font-semibold text-slate-600">
                      <span className="line-clamp-2">{products || '--'}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{totalQuantity}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-800">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <select
                        value={order.orderStatus}
                        disabled={isUpdating || selectableStatuses.length <= 1}
                        onChange={(event) => handleStatusChange(order, event.target.value)}
                        className={`h-9 rounded-md border border-transparent px-2 text-xs font-bold outline-none transition focus:border-pink-200 focus:ring-4 focus:ring-pink-50 disabled:cursor-not-allowed disabled:opacity-70 ${statusMeta.className}`}
                      >
                        {statusOptions.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {order.deleteAt ? `Sau ${formatTime(order.deleteAt)}` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">
            {page} / {pagination.totalPages || 1}
          </span>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={isLoading || page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={isLoading || page >= (pagination.totalPages || 1)}
            onClick={() => setPage((value) => Math.min(pagination.totalPages || 1, value + 1))}
            aria-label="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      <OrderStatusConfirmModal
        change={pendingStatusChange}
        isSubmitting={updatingOrderId === pendingStatusChange?.order.id}
        onCancel={() => setPendingStatusChange(null)}
        onConfirm={handleConfirmStatusChange}
      />
    </main>
  );
}

export default AdminOrdersPage;
