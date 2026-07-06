import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  SlidersHorizontal
} from 'lucide-react';

import { adminApi } from '../../services/apiService.js';

const PAGE_SIZE = 10;
const ADMIN_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

const ORDER_STATUSES = [
  { value: 'pending', label: 'Chờ', className: 'bg-orange-50 text-orange-600' },
  { value: 'confirmed', label: 'Đã duyệt', className: 'bg-blue-50 text-blue-600' },
  { value: 'delivered', label: 'Giao hàng thành công', className: 'bg-emerald-50 text-emerald-600' },
  { value: 'deleted', label: 'Đã xóa', className: 'bg-slate-100 text-slate-500' },
  { value: 'cancelled', label: 'Đã hủy', className: 'bg-red-50 text-red-600' }
];
const ORDER_STATUS_FLOW = ['pending', 'confirmed', 'delivered', 'deleted'];

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
  return ORDER_STATUSES.filter((item) => item.value === status || item.value === nextStatus);
};

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

  const handleStatusChange = async (order, nextStatus) => {
    if (!nextStatus || nextStatus === order.orderStatus) return;
    if (nextStatus !== getNextStatus(order.orderStatus)) {
      toast.error('Trạng thái đơn hàng chỉ được chuyển sang bước kế tiếp.');
      return;
    }

    if (
      nextStatus === 'deleted'
      && !window.confirm('Đơn hàng đã xóa sẽ tự bị xóa khỏi hệ thống sau 10 phút. Tiếp tục?')
    ) {
      return;
    }

    setUpdatingOrderId(order.id);

    try {
      const updatedOrder = await adminApi.updateOrderStatus(order.id, nextStatus);
      setOrders((current) => current.map((item) => (
        item.id === order.id ? updatedOrder : item
      )));
      toast.success(nextStatus === 'deleted'
        ? 'Đã chuyển sang trạng thái đã xóa. Đơn sẽ tự xóa khỏi hệ thống sau 10 phút.'
        : 'Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingOrderId(null);
    }
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
              Admin chỉ có thể chuyển đơn hàng theo đúng thứ tự: Chờ, Đã duyệt, Giao hàng thành công, Đã xóa.
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
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead className="bg-white text-xs font-bold uppercase tracking-wide text-slate-400">
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4">Mã đơn hàng</th>
                <th className="px-5 py-4">Mã người dùng</th>
                <th className="px-5 py-4">Tên người dùng</th>
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
                  <td className="px-5 py-10 text-center font-semibold text-slate-400" colSpan={8}>Đang tải đơn hàng...</td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td className="px-5 py-10 text-center font-semibold text-red-500" colSpan={8}>{errorMessage}</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center font-semibold text-slate-400" colSpan={8}>Không có đơn hàng phù hợp.</td>
                </tr>
              ) : orders.map((order, index) => {
                const statusMeta = STATUS_META[order.orderStatus] || STATUS_META.pending;
                const products = (order.items || []).map((item) => item.itemName || item.itemId).join(', ');
                const totalQuantity = (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
                const isUpdating = updatingOrderId === order.id;
                const nextStatus = getNextStatus(order.orderStatus);
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
                    <td className="max-w-[260px] px-5 py-4 text-sm font-semibold text-slate-600">
                      <span className="line-clamp-2">{products || '--'}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{totalQuantity}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-800">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <select
                        value={order.orderStatus}
                        disabled={isUpdating || !nextStatus}
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
    </main>
  );
}

export default AdminOrdersPage;
