import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiEdit2, FiTrash2, FiInfo, FiX } from "react-icons/fi";
import { AiOutlineUser, AiOutlineCheck } from "react-icons/ai";
import { Briefcase, Calendar, Heart, Mail, MapPin, Package, Phone, X } from "lucide-react";
import DeleteAccountModal from "../../components/DeleteAccountModal";
import OrderCustomizationDetails from "../../components/OrderCustomizationDetails.jsx";
import toast from "react-hot-toast";
import { orderApi, profileApi } from "../../services/apiService.js";
import { Skeleton, TableSkeleton } from "../../components/Skeleton.jsx";
import avatarDefault from "../../assets/avatar_default.png";
import "./UserProfile.scss";

const targetStatusLabels = {
  tryingToConceive: "Đang mong con",
  pregnant: "Đang trong thai kỳ",
  ivf: "IVF",
  normal: "Chăm sóc sức khỏe",
  periodTracking: "Theo dõi chu kỳ",
  relatives: "Người thân",
  partner: "Người thân",
};

const accountTypeLabels = {
  user_free: "User_free",
  user_premium: "User_premium",
  admin: "Admin",
  others: "Khác",
};

const orderStatusMeta = {
  pending: { label: "Chờ", className: "bg-orange-50 text-orange-600" },
  confirmed: { label: "Đã duyệt", className: "bg-blue-50 text-blue-600" },
  delivering: { label: "Đang giao hàng", className: "bg-violet-50 text-violet-600" },
  delivered: { label: "Giao hàng thành công", className: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Đã hủy", className: "bg-red-50 text-red-600" },
  deleted: { label: "Đã xóa", className: "bg-slate-100 text-slate-500" },
};

const paymentMethodLabels = {
  bank_transfer: "Chuyển khoản ngân hàng",
  qr_transfer: "Chuyển khoản QR",
  cod: "Thanh toán khi nhận hàng",
};

const formatOrderCurrency = (value) => new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

const formatOrderDate = (value) => value
  ? new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
  : "--";

const getOrderCode = (order) => order?.id
  ? `HD${String(order.id).slice(-6).toUpperCase()}`
  : "--";

function OrderDetailModal({ order, isLoading, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isLoading) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, onClose]);

  const status = orderStatusMeta[order?.orderStatus] || {
    label: order?.orderStatus || "Không xác định",
    className: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[65px] z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6" onClick={onClose}>
      <section
        className="max-h-[calc(100vh-65px-3rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#ed77a5]">Chi tiết đơn hàng</p>
            <h2 id="order-detail-title" className="mt-1 text-xl font-extrabold text-slate-900">
              {isLoading ? <Skeleton className="h-6 w-28" /> : getOrderCode(order)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết đơn hàng"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6" role="status" aria-label="Đang tải thông tin đơn hàng">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : order ? (
          <div className="space-y-6 p-6">
            <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-400">Ngày đặt hàng</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{formatOrderDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Trạng thái</p>
                <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Phương thức thanh toán</p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {paymentMethodLabels[order.paymentMethod] || order.paymentMethod || "Chưa xác định"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Tổng thanh toán</p>
                <p className="mt-1 text-base font-extrabold text-[#ed77a5]">{formatOrderCurrency(order.totalAmount)}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-extrabold text-slate-800">Sản phẩm</h3>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {(order.items || []).map((item) => (
                  <div key={String(item.itemId)}>
                    <div className="flex items-center gap-4 p-4">
                      {item.thumbnail ? (
                        <img className="h-16 w-16 rounded-lg border border-slate-100 object-cover" src={item.thumbnail} alt={item.itemName || "Sản phẩm"} />
                      ) : (
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#ed77a5]">
                          <Package size={24} />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">{item.itemName || (item.isBox ? "Box trong đơn hàng" : "Sản phẩm")}</p>
                        <p className="mt-1 text-xs font-medium text-slate-400">Số lượng: {item.quantity}</p>
                      </div>
                      <p className="text-right text-sm font-extrabold text-slate-700">
                        {formatOrderCurrency(Number(item.price) * Number(item.quantity))}
                      </p>
                    </div>
                    {item.isBox && (
                      <div className="px-4 pb-4">
                        <OrderCustomizationDetails item={item} showProductStatus={false} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {order.lovelyMessage && (
              <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-4">
                <p className="text-xs font-semibold text-slate-400">Lời nhắn</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{order.lovelyMessage}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="px-6 py-12 text-center text-sm font-semibold text-red-500">Không thể tải thông tin đơn hàng.</p>
        )}
      </section>
    </div>
  );
}

const formatVietnamPhoneForDisplay = (phone) => {
  if (!phone) return "";
  if (/^\+84\d{9}$/.test(phone)) return `0${phone.slice(3)}`;
  if (/^84\d{9}$/.test(phone)) return `0${phone.slice(2)}`;
  return phone;
};

const normalizeProfilePhoneInput = (value) => value.replace(/\D/g, "").slice(0, 10);

const isValidVietnamPhoneInput = (phone) => !phone || /^0\d{9}$/.test(phone);

const buildProfileUpdates = (formData, savedProfile) => {
  const updates = {};
  const editableFields = ["fullName", "phone", "address"];

  editableFields.forEach((field) => {
    if ((formData[field] || "") !== (savedProfile?.[field] || "")) {
      updates[field] = formData[field];
    }
  });

  return updates;
};

const mapProfileToForm = (profile) => ({
  displayName: profile.fullName || profile.email || "HERDAYS user",
  email: profile.email || "",
  phone: formatVietnamPhoneForDisplay(profile.phone),
  fullName: profile.fullName || "",
  dateOfBirth: profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
    : "",
  accountType: accountTypeLabels[profile.accountClass] || profile.accountClass || "",
  goal: targetStatusLabels[profile.targetStatus] || profile.targetStatus || "",
  address: profile.address || "",
  joinDate: "",
});


export default function UserProfile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedProfile, setSavedProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailError, setOrderDetailError] = useState(null);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    fullName: "",
    dateOfBirth: "",
    accountType: "",
    goal: "",
    address: "",
    joinDate: "",
  });

  useEffect(() => {
    let isActive = true;

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await profileApi.getProfile();
        if (!isActive) return;
        const nextProfile = mapProfileToForm(profile);
        setSavedProfile(nextProfile);
        setFormData(nextProfile);
      } catch (error) {
        if (isActive) toast.error(error.message || "Không thể tải hồ sơ.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchOrders = async () => {
      setIsOrdersLoading(true);
      setOrdersError("");
      try {
        const result = await orderApi.listMine();
        if (isActive) setOrders(result || []);
      } catch (error) {
        if (isActive) setOrdersError(error.message || "Không thể tải danh sách đơn hàng.");
      } finally {
        if (isActive) setIsOrdersLoading(false);
      }
    };

    fetchOrders();
    return () => {
      isActive = false;
    };
  }, []);

  const requestedOrderId = searchParams.get("orderId");

  useEffect(() => {
    if (!requestedOrderId) return undefined;

    let isActive = true;

    orderApi.getById(requestedOrderId)
      .then((order) => {
        if (isActive) {
          setSelectedOrder(order);
          setOrderDetailError(null);
        }
      })
      .catch((error) => {
        if (isActive) {
          setOrderDetailError({
            orderId: requestedOrderId,
            message: error.message || "Không thể tải chi tiết đơn hàng.",
          });
          toast.error(error.message || "Không thể tải chi tiết đơn hàng.");
        }
      });

    return () => {
      isActive = false;
    };
  }, [requestedOrderId]);

  const isSelectedOrderCurrent = String(selectedOrder?.id || "") === requestedOrderId;
  const currentOrderDetailError = orderDetailError?.orderId === requestedOrderId
    ? orderDetailError.message
    : "";
  const isOrderDetailLoading = Boolean(requestedOrderId)
    && !isSelectedOrderCurrent
    && !currentOrderDetailError;

  const handleViewOrder = (orderId) => {
    setSearchParams({ orderId: String(orderId) });
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrder(null);
    setOrderDetailError(null);
    setSearchParams({}, { replace: true });
  };

  const userData = {
    displayName: formData.displayName,
    email: formData.email,
    phone: formData.phone,
    status: "Đang hoạt động",
    accountType: formData.accountType || "User_free",
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "phone" ? normalizeProfilePhoneInput(value) : value,
    }));
  };

  const handleSave = async () => {
    const updates = buildProfileUpdates(formData, savedProfile);

    if (Object.keys(updates).length === 0) {
      toast("Không có thông tin nào cần cập nhật.");
      setIsEditing(false);
      return;
    }

    if (updates.fullName !== undefined && !updates.fullName.trim()) {
      toast.error("Họ và tên không được để trống.");
      return;
    }

    if (updates.phone !== undefined && !isValidVietnamPhoneInput(updates.phone)) {
      toast.error("Số điện thoại Việt Nam phải có 10 chữ số và bắt đầu bằng 0.");
      return;
    }

    const loadingToast = toast.loading("Đang cập nhật hồ sơ...");

    try {
      const result = await profileApi.updateProfile(updates);
      const nextProfile = mapProfileToForm(result.profile);
      setSavedProfile(nextProfile);
      setFormData(nextProfile);
      setIsEditing(false);
      toast.success(result.message || "Cập nhật hồ sơ thành công.", { id: loadingToast });
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật hồ sơ.", { id: loadingToast });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (savedProfile) setFormData(savedProfile);
  };

  const handleRetakeQuiz = () => {
    navigate("/welcome-quiz", { state: { returnTo: "/profile" } });
  };

  const fieldConfigs = [
    {
      label: "Họ và tên",
      field: "fullName",
      icon: AiOutlineUser,
      readValue: formData.fullName,
    },
    {
      label: "Email",
      field: "email",
      icon: Mail,
      readValue: formData.email,
      readOnly: true,
      placeholder: "Chưa cập nhật",
    },
    {
      label: "Số điện thoại",
      field: "phone",
      icon: Phone,
      readValue: formData.phone,
      inputMode: "tel",
      placeholder: "Chưa cập nhật",
    },
    {
      label: "Ngày sinh",
      field: "dateOfBirth",
      icon: Calendar,
      readValue: formData.dateOfBirth,
      readOnly: true,
      placeholder: "Chưa cập nhật",
    },
    {
      label: "Hạng tài khoản",
      field: "accountType",
      icon: Briefcase,
      readValue: formData.accountType,
      readOnly: true,
      placeholder: "Chưa cập nhật",
    },
    {
      label: "Mục tiêu",
      field: "goal",
      icon: Heart,
      readValue: formData.goal,
      readOnly: true,
      placeholder: "Chưa cập nhật",
      changeGoalText: "Thay đổi mục tiêu",
    },
    {
      label: "Ngày tham gia",
      field: "joinDate",
      icon: Calendar,
      readValue: formData.joinDate,
      readOnly: true,
      placeholder: "Chưa cập nhật",
    },
    {
      label: "Địa chỉ",
      field: "address",
      icon: MapPin,
      readValue: formData.address,
      placeholder: "Chưa cập nhật",
    },
  ];

  return (
    <main className="contact-us bg-gray-50 py-5 px-4 font-roboto">
      <div className="max-w-[1100px] mx-auto">
        {isLoading && (
          <div className="mb-4 rounded-lg bg-white px-4 py-3 shadow-sm" role="status" aria-label="Đang tải hồ sơ">
            <Skeleton className="h-5 w-48" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="inline-flex items-center gap-2 mb-3 w-fit bg-white border border-gray-200 rounded-[8px] px-4 py-2 shadow-sm"
            >
              <div className="flex items-center justify-center w-4 h-4 rounded-full">
                <AiOutlineUser size={30} className="text-[#ED77A5]" strokeWidth={4} />
              </div>
              <span className="text-[#ED77A5] text-sm font-semibold">
                Chi tiết Người dùng
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  className="user-profile-btn user-profile-btn--save"
                  onClick={handleSave}
                >
                  <AiOutlineCheck size={16} />
                  Lưu
                </button>
                <button
                  className="user-profile-btn user-profile-btn--cancel-edit"
                  onClick={handleCancel}
                >
                  <FiX size={16} />
                  Hủy
                </button>
              </>
            ) : (
              <>
                <button
                  className="user-profile-btn user-profile-btn--edit"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit2 size={16} />
                  Chỉnh sửa
                </button>
                {/* <button
                  className="user-profile-btn user-profile-btn--quiz"
                  onClick={handleRetakeQuiz}
                >
                  <Heart size={16} />
                  Trả lời quiz lại
                </button> */}
                <button
                  className="user-profile-btn user-profile-btn--delete"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FiTrash2 size={16} />
                  Xóa tài khoản
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_2fr] gap-6 lg:gap-10">
          <div className="user-profile-card">
            <div className="user-profile-avatar-section">
              <img
                src={avatarDefault}
                alt="Avatar"
                className="user-profile-avatar"
              />
            </div>

            <h2 className="user-profile-name">{userData.displayName}</h2>
            <p className="user-profile-email">{userData.email}</p>

            <div className="user-profile-badges">
              <span className="user-profile-badge user-profile-badge--active">
                <span className="user-profile-badge-dot"></span>
                {userData.status}
              </span>
              <span className="user-profile-badge user-profile-badge--type">
                <FiInfo size={14} />
                {userData.accountType}
              </span>
            </div>

            <div className="user-profile-details-mini">
              <div className="user-profile-detail-item">
                <span className="user-profile-detail-label">Số điện thoại</span>
                <span className={formData.phone ? "user-profile-detail-value" : "user-profile-detail-value user-profile-detail-value--empty"}>
                  {formData.phone || "Chưa cập nhật"}
                </span>
              </div>
              <div className="user-profile-detail-item">
                <span className="user-profile-detail-label">Mục tiêu</span>
                <span className={formData.goal ? "user-profile-detail-value" : "user-profile-detail-value user-profile-detail-value--empty"}>
                  {formData.goal || "Chưa cập nhật"}
                </span>
              </div>
            </div>
          </div>

          <div className="user-profile-details-card">
            <div className="user-profile-details-header">
              <FiInfo size={20} className="user-profile-details-icon" />
              <h2 className="user-profile-details-title">Thông tin chi tiết</h2>
            </div>

            <div className="user-profile-details-grid">
              {fieldConfigs.map(({ label, field, icon: Icon, readValue, readOnly, changeGoalText, inputMode, placeholder }) => (
                <div key={field} className="user-profile-detail-row">
                  <span className="user-profile-detail-label">{label}</span>
                  {isEditing && !readOnly ? (
                    <div className="relative">
                      <Icon
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        strokeWidth={2}
                      />
                      <input
                        type={field === "phone" ? "tel" : "text"}
                        inputMode={inputMode}
                        placeholder={placeholder}
                        value={formData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="user-profile-input w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#ED77A5]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={readValue ? "user-profile-detail-value" : "user-profile-detail-value user-profile-detail-value--empty"}>
                        {readValue || placeholder || "Chưa cập nhật"}
                      </span>
                      {changeGoalText && (
                        <button className="user-profile-goal-link" type="button" onClick={handleRetakeQuiz}>{changeGoalText}</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-[#ed77a5]">
              <Package size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Đơn hàng của bạn</h2>
              <p className="text-sm text-gray-500">Theo dõi và xem lại các đơn hàng đã đặt.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3">Mã đơn</th>
                  <th className="px-5 py-3">Ngày đặt</th>
                  <th className="px-5 py-3">Sản phẩm</th>
                  <th className="px-5 py-3">Tổng tiền</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isOrdersLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6">
                      <TableSkeleton columns={6} rows={5} />
                    </td>
                  </tr>
                ) : ordersError ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm font-semibold text-red-500">{ordersError}</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm font-semibold text-gray-400">Bạn chưa có đơn hàng nào.</td>
                  </tr>
                ) : orders.map((order) => {
                  const status = orderStatusMeta[order.orderStatus] || {
                    label: order.orderStatus,
                    className: "bg-slate-100 text-slate-500",
                  };
                  const productNames = (order.items || [])
                    .map((item) => item.itemName || "Sản phẩm")
                    .join(", ");

                  return (
                    <tr key={order.id} className="transition hover:bg-pink-50/30">
                      <td className="px-5 py-4 text-sm font-extrabold text-gray-800">{getOrderCode(order)}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-500">{formatOrderDate(order.createdAt)}</td>
                      <td className="max-w-[240px] px-5 py-4 text-sm font-semibold text-gray-600">
                        <span className="line-clamp-2">{productNames || "--"}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-extrabold text-gray-800">{formatOrderCurrency(order.totalAmount)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewOrder(order.id)}
                          className="user-profile-order-view-btn inline-flex min-h-10 items-center justify-center rounded-lg bg-[#ed77a5] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f91] focus:outline-none focus:ring-4 focus:ring-pink-100"
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {(requestedOrderId || selectedOrder) && (
        <OrderDetailModal
          order={isSelectedOrderCurrent ? selectedOrder : null}
          isLoading={isOrderDetailLoading}
          onClose={handleCloseOrderDetail}
        />
      )}

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          toast.error("Backend hiện chưa có endpoint xóa tài khoản.");
        }}
      />
    </main>
  );
}
