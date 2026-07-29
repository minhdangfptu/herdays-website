import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, MapPin, RefreshCw, Save } from "lucide-react";
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

const normalizeCartItem = (item) => {
  const box = item.boxId || {};
  const boxId = box._id || box.id || item.boxId;
  const stock = Number(box.quantity) || 0;
  const quantity = item.quantity || 1;
  const customizedProducts = Array.isArray(item.customizedProducts)
    ? item.customizedProducts
    : [];
  const customizationExtra = customizedProducts.reduce((total, customizedProduct) => {
    const productId = customizedProduct.productId?._id
      || customizedProduct.productId?.id
      || customizedProduct.productId;
    const baseProduct = (box.products || []).find((boxProduct) => (
      String(boxProduct.productId?._id || boxProduct.productId?.id || boxProduct.productId) === String(productId)
    ));
    const baseQuantity = Number(baseProduct?.quantity) || 1;
    const selectedQuantity = Number(customizedProduct.quantity) || 0;
    const extraQuantity = Math.max(selectedQuantity - baseQuantity, 0);
    return total + extraQuantity * (Number(customizedProduct.productId?.price) || 0);
  }, 0);

  return {
    id: String(boxId),
    name: box.boxName || "HerDays Box",
    quantity,
    stock,
    remainingStock: Math.max(stock - quantity, 0),
    price: (Number(box.price) || 0) + customizationExtra,
    image:
      box.thumbnail ||
      `https://placehold.co/160x160/f8c4d8/ffffff?text=${encodeURIComponent(box.boxName || "Box")}`,
  };
};

const SUBSCRIPTION_PLANS = [
  { months: 1, label: "1 tháng", discount: 0, badge: null },
  { months: 3, label: "3 tháng", discount: 5, badge: "Tiết kiệm 5%" },
  { months: 6, label: "6 tháng", discount: 10, badge: "Tiết kiệm 10%" },
  { months: 12, label: "12 tháng", discount: 20, badge: "Tốt nhất" },
];

export default function Checkout() {
  const location = useLocation();
  const initialSelectedBoxIds = useMemo(
    () =>
      Array.isArray(location.state?.selectedBoxIds)
        ? location.state.selectedBoxIds.map(String)
        : [],
    [location.state],
  );
  const [cartItems, setCartItems] = useState([]);
  const [selectedBoxIds, setSelectedBoxIds] = useState(initialSelectedBoxIds);
  const [loading, setLoading] = useState(true);
  const [updatingBoxId, setUpdatingBoxId] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(1);
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
        const filteredSelectedIds = initialSelectedBoxIds.filter((boxId) =>
          validIds.includes(String(boxId)),
        );

        setCartItems(nextItems);
        setSelectedBoxIds(
          filteredSelectedIds.length > 0 ? filteredSelectedIds : validIds,
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
  }, [initialSelectedBoxIds, navigate]);

  useEffect(() => {
    let isMounted = true;

    profileApi
      .getProfile()
      .then((profile) => {
        if (!isMounted) return;
        const nextAddress = profile?.address?.trim() || "";
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
    () => cartItems.filter((item) => selectedBoxIds.includes(String(item.id))),
    [cartItems, selectedBoxIds],
  );

  const subtotal = useMemo(
    () =>
      selectedCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [selectedCartItems],
  );

  const selectedPlanData =
    SUBSCRIPTION_PLANS.find((plan) => plan.months === selectedPlan) ||
    SUBSCRIPTION_PLANS[0];
  const discountPercent = selectedPlanData.discount;
  const discountAmount = (subtotal * discountPercent) / 100;
  const orderTotal = subtotal - discountAmount;
  const selectedAddress =
    addressOption === "profile" ? profileAddress.trim() : newAddress.trim();
  const isAddressReady =
    Boolean(selectedAddress) &&
    (addressOption === "profile" || isNewAddressSaved);

  const handleQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;
    if (quantity > item.stock) {
      toast.error("Số lượng vượt quá tồn kho hiện có.");
      return;
    }

    const boxId = item.id;
    setUpdatingBoxId(boxId);

    try {
      const cart = await cartApi.updateItem({ boxId, quantity });
      setCartItems((cart.items || []).map(normalizeCartItem));
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật sản phẩm thanh toán.");
    } finally {
      setUpdatingBoxId("");
    }
  };

  const handleRemove = async (boxId) => {
    setUpdatingBoxId(boxId);

    try {
      const cart = await cartApi.removeItem(boxId);
      const nextItems = (cart.items || []).map(normalizeCartItem);
      setCartItems(nextItems);
      setSelectedBoxIds((current) =>
        current.filter((id) =>
          nextItems.some((item) => String(item.id) === String(id)),
        ),
      );
      toast.success("Đã xóa sản phẩm khỏi danh sách thanh toán.");
    } catch (error) {
      toast.error(error.message || "Không thể xóa sản phẩm.");
    } finally {
      setUpdatingBoxId("");
    }
  };

  const toggleSelectItem = (boxId) => {
    const normalizedBoxId = String(boxId);
    setSelectedBoxIds((current) =>
      current.includes(normalizedBoxId)
        ? current.filter((id) => id !== normalizedBoxId)
        : [...current, normalizedBoxId],
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

    if (isAddressLoading || isSavingAddress) return;
    if (!selectedAddress || (addressOption === "new" && !isNewAddressSaved)) {
      toast.error(
        "Vui lòng chọn hoặc lưu địa chỉ giao hàng trước khi thanh toán.",
      );
      return;
    }

    setIsCheckingOut(true);

    try {
      const order = await orderApi.createFromCart({
        paymentMethod: "bank_transfer",
        boxIds: selectedBoxIds,
      });
      const nextItems = cartItems.filter(
        (item) => !selectedBoxIds.includes(String(item.id)),
      );
      setCartItems(nextItems);
      notifyCartChanged({ items: nextItems });
      setSelectedBoxIds([]);
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
                  Sản phẩm đặt mua ({cartItems.length})
                </h2>

                {cartItems.length === 0 ? (
                  <p className="herdays-checkout-empty">
                    Sản phẩm thanh toán của bạn đang trống.
                  </p>
                ) : (
                  <div className="herdays-checkout-product-list">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="herdays-checkout-product-item"
                      >
                        {/* <label className="product-select" aria-label="Chọn sản phẩm thanh toán">
                          <input
                            type="checkbox"
                            checked={selectedBoxIds.includes(String(item.id))}
                            onChange={() => toggleSelectItem(item.id)}
                          />
                        </label> */}
                        <div className="product-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="product-info-checkout">
                          <h3 className="product-name">{item.name}</h3>
                          {/* <p className="product-stock-note">
                            Còn trongkho: {item.stock} - Còn lại sau khi thêm: {item.remainingStock}
                          </p> */}
                          {/* <div className="product-quantity-control">
                            <button
                              type="button"
                              disabled={updatingBoxId === item.id || item.quantity <= 1}
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              disabled={updatingBoxId === item.id || item.quantity >= item.stock}
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div> */}
                          <button
                            className="product-remove"
                            type="button"
                            disabled={updatingBoxId === item.id}
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
                      Địa chỉ giao hàng
                    </p>
                    <p className="m-0 text-xs font-medium text-slate-400">
                      Chọn địa chỉ bạn muốn sử dụng
                    </p>
                  </div>
                </div>

                {isAddressLoading ? (
                  <Skeleton className="h-[82px] w-full rounded-xl" />
                ) : (
                  <div className="space-y-3">
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
                    <span className="summary-label">Tạm tính</span>
                    <span className="summary-value">
                      {formatCurrency(subtotal)}
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
                    disabled={
                      selectedCartItems.length === 0 ||
                      isCheckingOut ||
                      isAddressLoading ||
                      isSavingAddress ||
                      !isAddressReady
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
