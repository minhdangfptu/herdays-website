import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { adminApi } from "../../services/apiService.js";
import { TableSkeleton } from "../../components/Skeleton.jsx";
import OrderCustomizationDetails from "../../components/OrderCustomizationDetails.jsx";

const PAGE_SIZE = 10;
const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const VIETNAM_OFFSET_MINUTES = 7 * 60;
const ADMIN_FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

const ORDER_STATUSES = [
  { value: "pending", label: "Chờ", className: "bg-orange-50 text-orange-600" },
  {
    value: "confirmed",
    label: "Đã duyệt",
    className: "bg-blue-50 text-blue-600",
  },
  {
    value: "delivering",
    label: "Bắt đầu giao hàng",
    className: "bg-violet-50 text-violet-600",
  },
  {
    value: "delivered",
    label: "Giao hàng thành công",
    className: "bg-emerald-50 text-emerald-600",
  },
  {
    value: "deleted",
    label: "Đã xóa",
    className: "bg-slate-100 text-slate-500",
  },
  { value: "cancelled", label: "Đã hủy", className: "bg-red-50 text-red-600" },
];
const ORDER_STATUS_FLOW = [
  "pending",
  "confirmed",
  "delivering",
  "delivered",
  "deleted",
];

const STATUS_META = ORDER_STATUSES.reduce(
  (map, status) => ({
    ...map,
    [status.value]: status,
  }),
  {},
);

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatTime = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    timeZone: VIETNAM_TIME_ZONE,
  }).format(new Date(value));
};

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value: partValue }) => [type, partValue]),
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
};

const toVietnamIsoString = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return "";

  const [, year, month, day, hour, minute] = match.map(Number);
  const vietnamLocalDate = new Date(
    Date.UTC(year, month - 1, day, hour, minute),
  );
  if (
    vietnamLocalDate.getUTCFullYear() !== year ||
    vietnamLocalDate.getUTCMonth() !== month - 1 ||
    vietnamLocalDate.getUTCDate() !== day ||
    vietnamLocalDate.getUTCHours() !== hour ||
    vietnamLocalDate.getUTCMinutes() !== minute
  )
    return "";

  return new Date(
    vietnamLocalDate.getTime() - VIETNAM_OFFSET_MINUTES * 60000,
  ).toISOString();
};

const getShortOrderId = (id) =>
  String(id || "")
    .slice(-5)
    .toUpperCase() || "--";

const getVietnamDownloadFileName = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return `du-lieu-don-hang-her-days-to_${values.day}-${values.month}-${values.year}.xlsx`;
};

const getPagination = (pagination, page) => ({
  page,
  totalPages: pagination?.totalPages || 1,
  totalItems: pagination?.total || pagination?.totalItems || 0,
});

const getNextStatus = (status) => {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);
  return currentIndex >= 0 ? ORDER_STATUS_FLOW[currentIndex + 1] || null : null;
};

const getSelectableStatuses = (status) => {
  const nextStatus = getNextStatus(status);
  const allowedStatuses =
    status === "confirmed"
      ? [status, nextStatus, "cancelled"]
      : [status, nextStatus];
  return ORDER_STATUSES.filter((item) => allowedStatuses.includes(item.value));
};

function OrderStatusConfirmModal({
  change,
  isSubmitting,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!change) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [change, isSubmitting, onCancel]);

  if (!change) return null;

  const isCancelling = change.nextStatus === "cancelled";
  const title = isCancelling
    ? "Xác nhận hủy đơn hàng"
    : "Xác nhận xóa đơn hàng";
  const description = isCancelling
    ? "Đơn hàng sẽ chuyển sang trạng thái Đã hủy và số lượng sản phẩm sẽ được hoàn lại kho."
    : "Đơn hàng sẽ chuyển sang trạng thái Đã xóa và tự động bị xóa khỏi hệ thống sau 10 phút.";
  const confirmLabel = isCancelling ? "Xác nhận hủy" : "Xác nhận xóa";

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
            <h2
              id="order-status-confirm-title"
              className="text-lg font-bold text-slate-900"
            >
              {title}
            </h2>
            <p
              id="order-status-confirm-description"
              className="mt-2 text-sm font-medium leading-6 text-slate-500"
            >
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
            {isSubmitting ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function AdminOrderDetailModal({ order, isLoading, onClose, onOrderUpdated }) {
  const [createdAtInput, setCreatedAtInput] = useState("");
  const [isUpdatingCreatedAt, setIsUpdatingCreatedAt] = useState(false);

  useEffect(() => {
    if (!order && !isLoading) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isLoading) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, onClose, order]);

  useEffect(() => {
    setCreatedAtInput(toDateTimeLocalValue(order?.createdAt));
  }, [order]);

  const isCreatedAtDirty = Boolean(
    order &&
    createdAtInput &&
    createdAtInput !== toDateTimeLocalValue(order.createdAt),
  );
  const subscriptionMonths = Number(order?.subscriptionMonths) || 1;
  const subtotalAmount = Number(order?.subtotalAmount ?? order?.totalAmount) || 0;
  const discountPercent = Number(order?.discountPercent) || 0;
  const discountAmount = Number(order?.discountAmount) || 0;

  const handleCreatedAtUpdate = async () => {
    if (!order || !createdAtInput) {
      toast.error("Vui lòng nhập thời gian đặt hàng.");
      return;
    }

    const nextDateIso = toVietnamIsoString(createdAtInput);
    if (!nextDateIso) {
      toast.error("Thời gian đặt hàng không hợp lệ.");
      return;
    }

    setIsUpdatingCreatedAt(true);
    try {
      const updatedOrder = await adminApi.updateOrderCreatedAt(
        order.id,
        nextDateIso,
      );
      onOrderUpdated(updatedOrder);
      toast.success("Đã cập nhật thời gian tạo đơn hàng.");
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật thời gian đơn hàng.");
    } finally {
      setIsUpdatingCreatedAt(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6"
      onClick={isLoading ? undefined : onClose}
    >
      <section
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-pink-500">
              Chi tiết đơn hàng
            </p>
            <h2
              id="admin-order-detail-title"
              className="mt-1 text-xl font-extrabold text-slate-900"
            >
              {order
                ? `HD${String(order.id).slice(-6).toUpperCase()}`
                : "Đang tải..."}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Đóng chi tiết đơn hàng"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div
            className="space-y-4 p-6"
            role="status"
            aria-label="Đang tải thông tin đơn hàng"
          >
            <TableSkeleton columns={2} rows={3} />
            <TableSkeleton columns={1} rows={3} />
          </div>
        ) : order ? (
          <div className="space-y-6 p-6">
            <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Tên người nhận
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {order.recipientName ||
                    order.user?.fullName ||
                    order.user?.email ||
                    "Người dùng"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Số điện thoại
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {order.recipientPhone || order.user?.phone || "--"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-slate-400">
                  Ngày đặt hàng
                </p>
                <label
                  htmlFor="admin-order-created-at"
                  className="mt-1 block text-xs font-semibold text-slate-500"
                >
                  Chọn ngày và giờ mới
                </label>
                <div className="mt-1 flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  <input
                    id="admin-order-created-at"
                    type="datetime-local"
                    value={createdAtInput}
                    disabled={isUpdatingCreatedAt}
                    onChange={(event) => setCreatedAtInput(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold text-slate-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-50 disabled:cursor-not-allowed disabled:bg-slate-100 sm:w-64 sm:flex-none"
                  />
                  {isCreatedAtDirty && (
                    <button
                      type="button"
                      onClick={handleCreatedAtUpdate}
                      disabled={isUpdatingCreatedAt}
                      className="rounded-lg bg-pink-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingCreatedAt ? "Đang lưu..." : "Lưu thời gian"}
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Hiển thị: {formatTime(order.createdAt) || "--"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Địa chỉ</p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {order.user?.address || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Tổng thanh toán
                </p>
                <p className="mt-1 text-base font-extrabold text-pink-500">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border border-pink-100 bg-pink-50/50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-400">Gói đăng ký</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{subscriptionMonths} tháng</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Tạm tính</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{formatCurrency(subtotalAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Giảm giá{discountPercent ? ` (${discountPercent}%)` : ""}</p>
                <p className="mt-1 text-sm font-bold text-emerald-600">-{formatCurrency(discountAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Sau giảm giá</p>
                <p className="mt-1 text-sm font-extrabold text-pink-500">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-extrabold text-slate-800">
                Sản phẩm trong đơn
              </h3>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {(order.items || []).map((item) => (
                  <div key={String(item.itemId)} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">
                          {item.itemName ||
                            (item.isBox ? "Box trong đơn hàng" : "Sản phẩm")}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Số lượng box: {item.quantity} · Đơn giá/tháng: {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-slate-700">
                        {formatCurrency(
                          Number(item.price) * Number(item.quantity) * subscriptionMonths,
                        )}
                      </p>
                    </div>
                    {item.isBox && (
                      <div className="mt-4">
                        <OrderCustomizationDetails
                          item={item}
                          compact
                          showProductStatus={false}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="px-6 py-12 text-center text-sm font-semibold text-red-500">
            Không thể tải thông tin đơn hàng.
          </p>
        )}
      </section>
    </div>
  );
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailLoading, setIsOrderDetailLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
      setErrorMessage("");

      try {
        const result = await adminApi.getOrders({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch,
          status,
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
      const updatedOrder = await adminApi.updateOrderStatus(
        order.id,
        nextStatus,
      );
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? updatedOrder : item)),
      );
      toast.success(
        nextStatus === "deleted"
          ? "Đã chuyển sang trạng thái đã xóa. Đơn sẽ tự xóa khỏi hệ thống sau 10 phút."
          : nextStatus === "cancelled"
            ? "Đã hủy đơn hàng và hoàn lại số lượng vào kho."
            : "Đã cập nhật trạng thái đơn hàng",
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
    const allowedNextStatuses =
      order.orderStatus === "confirmed"
        ? [getNextStatus(order.orderStatus), "cancelled"]
        : [getNextStatus(order.orderStatus)];
    if (!allowedNextStatuses.includes(nextStatus)) {
      toast.error("Trạng thái đơn hàng chỉ được chuyển sang bước kế tiếp.");
      return;
    }

    if (nextStatus === "cancelled" || nextStatus === "deleted") {
      setPendingStatusChange({ order, nextStatus });
      return;
    }

    await applyStatusChange(order, nextStatus);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const isUpdated = await applyStatusChange(
      pendingStatusChange.order,
      pendingStatusChange.nextStatus,
    );
    if (isUpdated) setPendingStatusChange(null);
  };

  const handleViewOrder = async (orderId) => {
    setIsOrderDetailLoading(true);
    setSelectedOrder(null);

    try {
      const order = await adminApi.getOrder(orderId);
      setSelectedOrder(order);
    } catch (error) {
      toast.error(error.message || "Không thể tải chi tiết đơn hàng.");
    } finally {
      setIsOrderDetailLoading(false);
    }
  };

  const handleExportOrders = async () => {
    setIsExporting(true);

    try {
      const { blob } = await adminApi.exportOrders({
        search: debouncedSearch,
        status,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getVietnamDownloadFileName();
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất dữ liệu đơn hàng.");
    } catch (error) {
      toast.error(error.message || "Không thể xuất dữ liệu đơn hàng.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrder(null);
    setIsOrderDetailLoading(false);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setPage(1);
  };

  return (
    <main
      className="min-h-screen bg-white px-5 py-6 sm:px-8"
      style={{ fontFamily: ADMIN_FONT_FAMILY }}
    >
      <section className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Quản lý đơn hàng
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Luồng xử lý: Chờ → Đã duyệt → Bắt đầu giao hàng → Giao hàng thành
              công → Đã xóa. Đơn đã duyệt cũng có thể chuyển sang Đã hủy.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportOrders}
            disabled={isExporting}
            className="inline-flex h-11 min-w-[220px] items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-pink-500 bg-pink-500 px-5 text-sm font-extrabold text-white shadow-md shadow-pink-200 transition hover:border-pink-600 hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-100 disabled:cursor-not-allowed disabled:border-pink-300 disabled:bg-pink-300 disabled:shadow-none disabled:opacity-70"
          >
            <Download size={16} />
            {isExporting ? "Đang xuất dữ liệu..." : "Xuất dữ liệu đơn hàng"}
          </button>
        </div>

        <div className="mb-3 flex flex-col gap-3 rounded-lg bg-slate-50 p-3 lg:flex-row lg:items-center">
          <div className="relative w-full max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
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
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
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
            Tổng:{" "}
            <strong className="text-slate-800">{pagination.totalItems}</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100 bg-white">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead className="bg-white text-xs font-bold uppercase tracking-wide text-slate-400">
              <tr className="border-b border-slate-100">
                <th className="w-[92px] min-w-[92px] px-3 py-4">Mã đơn hàng</th>
                <th className="px-5 py-4">Tên người dùng</th>
                <th className="px-5 py-4">Số điện thoại</th>
                <th className="px-5 py-4">Địa chỉ</th>
                <th className="px-5 py-4">Sản phẩm</th>
                <th className="px-5 py-4">Số lượng</th>
                <th className="px-5 py-4">Tổng tiền</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="sticky right-0 bg-white px-5 py-4 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.3)]">
                  Thao tác
                </th>
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
                  <td
                    className="px-5 py-10 text-center font-semibold text-red-500"
                    colSpan={9}
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center font-semibold text-slate-400"
                    colSpan={9}
                  >
                    Không có đơn hàng phù hợp.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusMeta =
                    STATUS_META[order.orderStatus] || STATUS_META.pending;
                  const products = (order.items || [])
                    .map((item) => item.itemName || item.itemId)
                    .join(", ");
                  const totalQuantity = (order.items || []).reduce(
                    (total, item) => total + Number(item.quantity || 0),
                    0,
                  );
                  const isUpdating = updatingOrderId === order.id;
                  const selectableStatuses = getSelectableStatuses(
                    order.orderStatus,
                  );
                  const statusOptions =
                    selectableStatuses.length > 0
                      ? selectableStatuses
                      : [
                          {
                            value: order.orderStatus,
                            label: order.orderStatus,
                          },
                        ];

                  return (
                    <tr
                      key={order.id}
                      className="transition hover:bg-pink-50/30"
                    >
                      <td className="w-[92px] min-w-[92px] px-3 py-4 text-sm font-bold text-slate-800">
                        {getShortOrderId(order.id)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {order.recipientName ||
                            order.user?.fullName ||
                            order.user?.email ||
                            "Người dùng"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-600">
                        {order.recipientPhone || order.user?.phone || "--"}
                      </td>
                      <td className="max-w-[220px] px-5 py-4 text-sm font-semibold text-slate-600">
                        <span className="line-clamp-2">
                          {order.user?.address || "Chưa cập nhật"}
                        </span>
                      </td>
                      <td className="max-w-[260px] px-5 py-4 text-sm font-semibold text-slate-600">
                        <span className="line-clamp-2">{products || "--"}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {totalQuantity}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={order.orderStatus}
                          disabled={
                            isUpdating || selectableStatuses.length <= 1
                          }
                          onChange={(event) =>
                            handleStatusChange(order, event.target.value)
                          }
                          className={`h-9 rounded-md border border-transparent px-2 text-xs font-bold outline-none transition focus:border-pink-200 focus:ring-4 focus:ring-pink-50 disabled:cursor-not-allowed disabled:opacity-70 ${statusMeta.className}`}
                        >
                          {statusOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="sticky right-0 bg-white px-5 py-4 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.12)]">
                        <button
                          type="button"
                          onClick={() => handleViewOrder(order.id)}
                          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 px-2 py-1.5 text-[11px] font-extrabold text-pink-600 transition hover:bg-pink-100 focus:outline-none focus:ring-4 focus:ring-pink-100"
                        >
                          <Eye size={14} />
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
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
            onClick={() =>
              setPage((value) =>
                Math.min(pagination.totalPages || 1, value + 1),
              )
            }
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

      {(selectedOrder || isOrderDetailLoading) && (
        <AdminOrderDetailModal
          order={selectedOrder}
          isLoading={isOrderDetailLoading}
          onClose={handleCloseOrderDetail}
          onOrderUpdated={(updatedOrder) => {
            setSelectedOrder(updatedOrder);
            setOrders((current) =>
              current.map((item) =>
                item.id === updatedOrder.id ? updatedOrder : item,
              ),
            );
          }}
        />
      )}
    </main>
  );
}

export default AdminOrdersPage;
