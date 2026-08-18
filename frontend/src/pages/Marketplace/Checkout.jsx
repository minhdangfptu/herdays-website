import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, MapPin, Phone, RefreshCw, Save, UserRound } from "lucide-react";
import {
  cartApi,
  hasAuthSession,
  notifyCartChanged,
  orderApi,
  profileApi,
} from "../../services/apiService.js";
import { Skeleton } from "../../components/Skeleton.jsx";
import "./Checkout.scss";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatVietnamPhoneForInput = (value) => {
  const normalizedPhone = String(value || "")
    .trim()
    .replace(/[\s().-]/g, "");

  if (/^0\d{9}$/.test(normalizedPhone)) return normalizedPhone;
  if (/^\+84\d{9}$/.test(normalizedPhone)) {
    return `0${normalizedPhone.slice(3)}`;
  }
  if (/^84\d{9}$/.test(normalizedPhone)) {
    return `0${normalizedPhone.slice(2)}`;
  }
  return "";
};

const normalizeRecipientPhoneInput = (value) =>
  value.replace(/\D/g, "").slice(0, 10);

const normalizeCartItem = (item) => {
  const box = item.boxId || {};
  const boxId = box._id || box.id || item.boxId;
  const cartItemId =
    item._id || item.cartItemId || item.id || item.configurationKey || boxId;
  const stock = Number(box.quantity) || 0;
  const quantity = item.quantity || 1;
  const customizedProducts = Array.isArray(item.customizedProducts)
    ? item.customizedProducts
    : [];
  const customizationExtra = customizedProducts.reduce(
    (total, customizedProduct) => {
      const productId =
        customizedProduct.productId?._id ||
        customizedProduct.productId?.id ||
        customizedProduct.productId;
      const boxProduct = (box.products || []).find((product) => {
        const boxProductId =
          product.productId?._id || product.productId?.id || product.productId;
        return String(boxProductId) === String(productId);
      });

      if (!boxProduct?.isCustomizable) return total;

      const selectedQuantity = Number(customizedProduct.quantity) || 0;
      return (
        total +
        selectedQuantity *
          (Number(customizedProduct.productId?.price) ||
            Number(boxProduct?.price) ||
            0)
      );
    },
    0,
  );

  const customizationLabel = customizedProducts
    .map((customizedProduct) => {
      const productId =
        customizedProduct.productId?._id ||
        customizedProduct.productId?.id ||
        customizedProduct.productId;
      const boxProduct = (box.products || []).find((product) => {
        const boxProductId =
          product.productId?._id || product.productId?.id || product.productId;
        return String(boxProductId) === String(productId);
      });
      const productName =
        customizedProduct.productId?.productName ||
        boxProduct?.productId?.productName ||
        boxProduct?.productName ||
        "Sản phẩm";

      return `${productName} x${customizedProduct.quantity}`;
    })
    .join(", ");

  return {
    id: String(cartItemId),
    boxId: String(boxId),
    name: box.boxName || "HerDays Box",
    category: box.category || "Subscription Box",
    quantity,
    stock,
    remainingStock: Math.max(stock - quantity, 0),
    price: (Number(box.price) || 0) + customizationExtra,
    customizationLabel,
    image:
      box.thumbnail ||
      `https://placehold.co/160x160/f8c4d8/ffffff?text=${encodeURIComponent(box.boxName || "Box")}`,
  };
};

const SUBSCRIPTION_PLANS = [
  { months: 1, label: "1 tháng", discount: 0, badge: null },
  { months: 3, label: "3 tháng", discount: 10, badge: "Tiết kiệm 10%" },
  { months: 6, label: "6 tháng", discount: 15, badge: "Tiết kiệm 15%" },
  { months: 12, label: "12 tháng", discount: 20, badge: "Tốt nhất" },
];

const getInitialSubscriptionMonths = (value) => {
  const months = Number(value);
  return [1, 3, 6, 12].includes(months) ? months : 1;
};

export default function Checkout() {
  const location = useLocation();
  const hasSelectedCartItemIds = Array.isArray(
    location.state?.selectedCartItemIds,
  );
  const initialSelectedCartItemIds = useMemo(
    () =>
      Array.isArray(location.state?.selectedCartItemIds)
        ? location.state.selectedCartItemIds.map(String)
        : [],
    [location.state],
  );
  const [cartItems, setCartItems] = useState([]);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState(
    initialSelectedCartItemIds,
  );
  const [loading, setLoading] = useState(true);
  const [updatingCartItemId, setUpdatingCartItemId] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(() =>
    getInitialSubscriptionMonths(location.state?.subscriptionMonths),
  );
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [addressOption, setAddressOption] = useState("profile");
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isNewAddressSaved, setIsNewAddressSaved] = useState(false);
  const [addressError, setAddressError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasAuthSession()) {
      toast.error("Vui lòng đăng nhập để xem sản phẩm thanh toán.");
      navigate("/login", { replace: true });
      return undefined;
    }

    let isMounted = true;

    cartApi
      .getCart()
      .then((cart) => {
        if (!isMounted) return;
        const nextItems = (cart.items || []).map(normalizeCartItem);
        const validIds = nextItems.map((item) => String(item.id));
        const filteredSelectedIds = initialSelectedCartItemIds.filter(
          (cartItemId) => validIds.includes(String(cartItemId)),
        );

        setCartItems(nextItems);
        setSelectedCartItemIds(
          hasSelectedCartItemIds ? filteredSelectedIds : validIds,
        );
      })
      .catch((error) => {
        if (isMounted)
          setErrorMessage(
            error.message || "Không thể tải sản phẩm thanh toán.",
          );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hasSelectedCartItemIds, initialSelectedCartItemIds, navigate]);

  useEffect(() => {
    let isMounted = true;

    profileApi
      .getProfile()
      .then((profile) => {
        if (!isMounted) return;
        const nextRecipientName = profile?.fullName?.trim() || "";
        const nextRecipientPhone = formatVietnamPhoneForInput(profile?.phone);
        const nextAddress = profile?.address?.trim() || "";
        setRecipientName(nextRecipientName);
        setRecipientPhone(nextRecipientPhone);
        setProfileAddress(nextAddress);
        setAddressOption("profile");
        setAddressError("");
      })
      .catch((error) => {
        if (!isMounted) return;
        setAddressError(error.message || "Không thể tải địa chỉ giao hàng.");
        setAddressOption("new");
      })
      .finally(() => {
        if (isMounted) setIsAddressLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCartItems = useMemo(
    () =>
      cartItems.filter((item) => selectedCartItemIds.includes(String(item.id))),
    [cartItems, selectedCartItemIds],
  );

  const subtotal = useMemo(
    () =>
      selectedCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [selectedCartItems],
  );
  const selectedCartQuantity = useMemo(
    () => selectedCartItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedCartItems],
  );

  const selectedPlanData =
    SUBSCRIPTION_PLANS.find((plan) => plan.months === selectedPlan) ||
    SUBSCRIPTION_PLANS[0];
  const discountPercent = selectedPlanData.discount;
  const subscriptionSubtotal = subtotal * selectedPlanData.months;
  const discountAmount = Math.round(
    (subscriptionSubtotal * discountPercent) / 100,
  );
  const orderTotal = subscriptionSubtotal - discountAmount;
  const selectedAddress =
    addressOption === "profile" ? profileAddress.trim() : newAddress.trim();
  const isAddressReady =
    Boolean(selectedAddress) &&
    (addressOption === "profile" || isNewAddressSaved);
  const isCheckoutDisabled =
    selectedCartItems.length === 0 ||
    isCheckingOut ||
    isAddressLoading ||
    isSavingAddress;

  const handleQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;
    if (quantity > item.stock) {
      toast.error("Số lượng vượt quá tồn kho hiện có.");
      return;
    }

    const cartItemId = item.id;
    setUpdatingCartItemId(cartItemId);

    try {
      const cart = await cartApi.updateItem({ cartItemId, quantity });
      setCartItems((cart.items || []).map(normalizeCartItem));
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật sản phẩm thanh toán.");
    } finally {
      setUpdatingCartItemId("");
    }
  };

  const handleRemove = async (cartItemId) => {
    setUpdatingCartItemId(cartItemId);

    try {
      const cart = await cartApi.removeItem(cartItemId);
      const nextItems = (cart.items || []).map(normalizeCartItem);
      setCartItems(nextItems);
      setSelectedCartItemIds((current) =>
        current.filter((id) =>
          nextItems.some((item) => String(item.id) === String(id)),
        ),
      );
      toast.success("Đã xóa sản phẩm khỏi danh sách thanh toán.");
    } catch (error) {
      toast.error(error.message || "Không thể xóa sản phẩm.");
    } finally {
      setUpdatingCartItemId("");
    }
  };

  const toggleSelectItem = (cartItemId) => {
    const normalizedCartItemId = String(cartItemId);
    setSelectedCartItemIds((current) =>
      current.includes(normalizedCartItemId)
        ? current.filter((id) => id !== normalizedCartItemId)
        : [...current, normalizedCartItemId],
    );
  };

  const handleSaveAddress = async () => {
    const trimmedAddress = newAddress.trim();
    if (!trimmedAddress) {
      toast.error("Vui lòng nhập địa chỉ giao hàng.");
      return false;
    }

    setIsSavingAddress(true);
    try {
      const result = await profileApi.updateProfile({
        address: trimmedAddress,
      });
      const nextAddress = result.profile?.address || trimmedAddress;
      setProfileAddress(nextAddress);
      setNewAddress(nextAddress);
      setIsNewAddressSaved(true);
      setAddressOption("profile");
      setAddressError("");
      toast.success("Đã lưu địa chỉ giao hàng.");
      return true;
    } catch (error) {
      toast.error(error.message || "Không thể lưu địa chỉ giao hàng.");
      return false;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleCheckout = async () => {
    if (selectedCartItems.length === 0) {
      toast.error("Sản phẩm thanh toán đang trống.");
      return;
    }

    const normalizedRecipientName = recipientName.trim().replace(/\s+/g, " ");
    if (!normalizedRecipientName) {
      toast.error("Vui lòng nhập tên người nhận.");
      return;
    }

    if (!/^0\d{9}$/.test(recipientPhone)) {
      toast.error("Số điện thoại Việt Nam phải có 10 chữ số và bắt đầu bằng 0.");
      return;
    }

    if (isAddressLoading || isSavingAddress) return;
    if (!selectedAddress || (addressOption === "new" && !isNewAddressSaved)) {
      toast.error("Vui lòng cập nhật địa chỉ");
      return;
    }

    setIsCheckingOut(true);

    try {
      const order = await orderApi.createFromCart({
        recipientName: normalizedRecipientName,
        recipientPhone,
        paymentMethod: "bank_transfer",
        cartItemIds: selectedCartItemIds,
        subscriptionMonths: selectedPlan,
      });
      const nextItems = cartItems.filter(
        (item) => !selectedCartItemIds.includes(String(item.id)),
      );
      setCartItems(nextItems);
      notifyCartChanged({ items: nextItems });
      setSelectedCartItemIds([]);
      navigate("/qr-payment", {
        state: {
          amount: order.totalAmount,
          orderCode: order.id
            ? `HD${String(order.id).slice(-6).toUpperCase()}`
            : `HD${Date.now().toString().slice(-6)}`,
          orderId: order.id,
        },
      });
    } catch (error) {
      toast.error(error.message || "Không thể tạo đơn hàng.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="herdays-checkout-page">
      <div className="herdays-checkout-container">
        <Link to="/marketplace" className="herdays-checkout-back">
          <span className="icon">←</span> Tiếp tục mua sắm
        </Link>

        <div className="herdays-checkout-header">
          <h1 className="herdays-checkout-title">Thanh toán đơn hàng</h1>
          <p className="herdays-checkout-subtitle">
            Kiểm tra sản phẩm trong giỏ hàng trước khi chuyển sang thanh toán
            QR.
          </p>
        </div>

        {loading && (
          <div
            className="space-y-5"
            role="status"
            aria-label="Đang tải sản phẩm thanh toán"
          >
            <Skeleton className="h-8 w-1/3" />
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          </div>
        )}
        {errorMessage && (
          <p className="herdays-checkout-status herdays-checkout-status--error">
            {errorMessage}
          </p>
        )}

        {!loading && !errorMessage && (
          <div className="herdays-checkout-layout">
            <div className="herdays-checkout-left">
              <div className="herdays-checkout-card">
                <h2 className="herdays-checkout-card-title">
                  Sản phẩm đặt mua ({selectedCartQuantity})
                </h2>

                {selectedCartItems.length === 0 ? (
                  <p className="herdays-checkout-empty">
                    Sản phẩm thanh toán của bạn đang trống.
                  </p>
                ) : (
                  <div className="herdays-checkout-product-list">
                    {selectedCartItems.map((item) => (
                      <div
                        key={item.id}
                        className="herdays-checkout-product-item"
                      >
                        {/* <label className="product-select" aria-label="Chọn sản phẩm thanh toán">
                          <input
                            type="checkbox"
                            checked={selectedCartItemIds.includes(String(item.id))}
                            onChange={() => toggleSelectItem(item.id)}
                          />
                        </label> */}
                        <div className="product-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="product-info-checkout">
                          <h3 className="product-name">{item.name}</h3>
                          <p
                            style={{ fontWeight: "600" }}
                            className="product-quantity"
                          >
                            Số lượng box: {item.quantity}
                          </p>
                          {item.customizationLabel && (
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#4b5563",
                              }}
                            >
                              Sản phẩm: {item.customizationLabel}
                            </p>
                          )}
                          {/* <p className="product-stock-note">
                            Còn trongkho: {item.stock} - Còn lại sau khi thêm: {item.remainingStock}
                          </p> */}
                          {/* <div className="product-quantity-control">
                            <button
                              type="button"
                              disabled={updatingCartItemId === item.id || item.quantity <= 1}
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              disabled={updatingCartItemId === item.id || item.quantity >= item.stock}
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div> */}
                          <button
                            className="product-remove"
                            type="button"
                            disabled={updatingCartItemId === item.id}
                            onClick={() => handleRemove(item.id)}
                          >
                            Xóa
                          </button>
                        </div>
                        <div className="product-price">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="herdays-checkout-right">
              <div className="herdays-checkout-subscription-card herdays-checkout-card">
                <h2 className="herdays-checkout-card-title">
                  <RefreshCw size={18} />
                  Đăng ký định kỳ
                </h2>
                <div className="subscription-plans">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <button
                      key={plan.months}
                      type="button"
                      className={`subscription-plan-btn ${selectedPlan === plan.months ? "active" : ""}`}
                      onClick={() => setSelectedPlan(plan.months)}
                    >
                      <span className="plan-label">{plan.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="herdays-checkout-card herdays-checkout-address-card">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-[#ed77a5]">
                    <MapPin size={17} />
                  </span>
                  <div>
                    <p className="m-0 text-sm font-bold text-slate-800">
                      Thông tin giao hàng
                    </p>
                    <p className="m-0 text-xs font-medium text-slate-400">
                      Nhập tên, số điện thoại và chọn địa chỉ
                    </p>
                  </div>
                </div>

                {isAddressLoading ? (
                  <Skeleton className="h-[82px] w-full rounded-xl" />
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="checkout-recipient-name"
                        className="mb-1.5 block text-xs font-bold text-slate-600"
                      >
                        Tên người nhận <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserRound
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          id="checkout-recipient-name"
                          type="text"
                          autoComplete="name"
                          required
                          maxLength={100}
                          value={recipientName}
                          disabled={isCheckingOut}
                          placeholder="Nhập tên người nhận"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                          onChange={(event) => setRecipientName(event.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-recipient-phone"
                        className="mb-1.5 block text-xs font-bold text-slate-600"
                      >
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          id="checkout-recipient-phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          required
                          pattern="0[0-9]{9}"
                          maxLength={10}
                          value={recipientPhone}
                          disabled={isCheckingOut}
                          placeholder="Nhập số điện thoại người nhận"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                          onChange={(event) =>
                            setRecipientPhone(
                              normalizeRecipientPhoneInput(event.target.value),
                            )
                          }
                        />
                      </div>
                    </div>

                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${addressOption === "profile" ? "border-pink-300 bg-pink-50/60" : "border-slate-200 bg-white hover:border-pink-200"}`}
                    >
                      <input
                        className="mt-1 accent-[#ed77a5]"
                        type="radio"
                        name="shipping-address-option"
                        value="profile"
                        checked={addressOption === "profile"}
                        onChange={() => setAddressOption("profile")}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-800">
                          Dùng địa chỉ có trong hồ sơ của bạn
                        </span>
                        <span
                          className={`mt-1 block break-words text-sm font-medium ${profileAddress ? "text-slate-600" : "text-slate-400"}`}
                        >
                          {profileAddress || "Chưa có địa chỉ"}
                        </span>
                      </span>
                    </label>

                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${addressOption === "new" ? "border-pink-300 bg-pink-50/60" : "border-slate-200 bg-white hover:border-pink-200"}`}
                    >
                      <input
                        className="mt-1 accent-[#ed77a5]"
                        type="radio"
                        name="shipping-address-option"
                        value="new"
                        checked={addressOption === "new"}
                        onChange={() => {
                          setAddressOption("new");
                          setNewAddress("");
                          setIsNewAddressSaved(false);
                        }}
                      />
                      <span className="text-sm font-bold text-slate-800">
                        Nhập địa chỉ mới
                      </span>
                    </label>

                    {addressOption === "new" && (
                      <div className="space-y-3">
                        <textarea
                          className="min-h-[82px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
                          value={newAddress}
                          disabled={isSavingAddress}
                          maxLength={255}
                          placeholder="Nhập địa chỉ nhận hàng của bạn"
                          onChange={(event) => {
                            setNewAddress(event.target.value);
                            setIsNewAddressSaved(false);
                          }}
                        />
                        {newAddress.trim() && (
                          <button
                            style={{ cursor: "pointer" }}
                            type="button"
                            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#ed77a5] px-4 text-xs font-bold text-white transition hover:bg-[#d95f91] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSavingAddress}
                            onClick={handleSaveAddress}
                          >
                            {isSavingAddress ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Save size={14} />
                            )}
                            Lưu
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {addressError && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {addressError}
                  </p>
                )}
              </div>

              <div className="herdays-checkout-card">
                <h2 className="herdays-checkout-card-title">
                  Tóm tắt đơn hàng
                </h2>

                <div className="herdays-checkout-summary">
                  <div className="summary-row">
                    <span className="summary-label">
                      Tạm tính ({selectedPlanData.months} tháng)
                    </span>
                    <span className="summary-value">
                      {formatCurrency(subscriptionSubtotal)}
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="summary-row">
                      <span className="summary-label">
                        Giảm giá ({discountPercent}%)
                      </span>
                      <span className="summary-value text-green">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span className="summary-label">Phí vận chuyển</span>
                    <span className="summary-value text-green">Miễn phí</span>
                  </div>

                  <hr className="summary-divider" />

                  <div className="summary-row total-row">
                    <span className="summary-label">Tổng cộng</span>
                    <span className="summary-value total-price">
                      {formatCurrency(orderTotal)}
                    </span>
                  </div>

                  <button
                    className="herdays-checkout-btn"
                    type="button"
                    disabled={isCheckoutDisabled}
                    title={
                      !recipientName.trim()
                        ? "Vui lòng nhập tên người nhận"
                        : !/^0\d{9}$/.test(recipientPhone)
                        ? "Vui lòng nhập số điện thoại hợp lệ"
                        : !isAddressReady
                        ? "Vui lòng chọn hoặc lưu địa chỉ giao hàng"
                        : undefined
                    }
                    onClick={handleCheckout}
                  >
                    {isCheckingOut ? "Đang tạo đơn..." : "Xác nhận thanh toán"}
                  </button>

                  <p className="summary-note">
                    Bạn sẽ được chuyển hướng đến trang thanh toán QR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
