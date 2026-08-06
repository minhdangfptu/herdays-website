import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMinus, FiPlus, FiStar } from "react-icons/fi";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  cartApi,
  getCartBoxQuantities,
  hasAuthSession,
  marketplaceApi,
} from "../../services/apiService.js";
import { Skeleton } from "../../components/Skeleton.jsx";
import {
  flyToCart,
  getCartTargetElement,
  getFlyToCartSourceRect,
} from "../../utils/flyToCart.js";
import "./ProductDetailPage.scss";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "")
    return "Đang cập nhật";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const getItemName = (item) =>
  item?.boxName || item?.productName || item?.name || "HerDays item";

const getItemImage = (item) =>
  item?.thumbnail ||
  item?.image ||
  `https://placehold.co/520x520/f8c4d8/ffffff?text=${encodeURIComponent(getItemName(item))}`;

const SUBSCRIPTIONS = ["1 tháng", "3 tháng", "6 tháng", "12 tháng"];

const getSubscriptionMonths = (subscription) => {
  const months = Number.parseInt(String(subscription), 10);
  return [1, 3, 6, 12].includes(months) ? months : 1;
};

export default function ProductDetailPage() {
  const { type, itemId, productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedId = itemId || productId;
  const [selectedSubscription, setSelectedSubscription] = useState(
    SUBSCRIPTIONS[2],
  );
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState(null);
  const [itemType, setItemType] = useState(type || "");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [cartBoxQuantities, setCartBoxQuantities] = useState({});
  const productImageRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        let result;
        let nextType = type;

        if (type === "product") {
          result = await marketplaceApi.getProduct(resolvedId);
        } else if (type === "box") {
          result = await marketplaceApi.getBox(resolvedId);
        } else {
          try {
            result = await marketplaceApi.getBox(resolvedId);
            nextType = "box";
          } catch {
            result = await marketplaceApi.getProduct(resolvedId);
            nextType = "product";
          }
        }

        const cartResult = hasAuthSession()
          ? await cartApi.getCart().catch(() => null)
          : null;

        if (!isMounted) return;
        setItem(result);
        setItemType(nextType || result?.type || "");
        setCartBoxQuantities(getCartBoxQuantities(cartResult));
      } catch (error) {
        if (isMounted)
          setErrorMessage(error.message || "Không thể tải chi tiết sản phẩm.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (resolvedId) loadDetail();

    return () => {
      isMounted = false;
    };
  }, [resolvedId, type]);

  const relatedProducts = useMemo(
    () =>
      (item?.products || []).map((product) => ({
        id: product.productId,
        name: product.productName || "Sản phẩm trong box",
        subtitle: product.category || item?.category || "HerDays",
        thumbnail: product.thumbnail,
        quantity: product.quantity || 1,
      })),
    [item],
  );

  const updateQuantity = (newQuantity) => {
    if (newQuantity < 1) return;
    if (itemType === "box") {
      const currentCartQuantity = cartBoxQuantities[String(item?.id)] || 0;
      const availableQuantity = Math.max(
        (Number(item?.quantity) || 0) - currentCartQuantity,
        0,
      );
      if (newQuantity > availableQuantity) return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (itemType !== "box") {
      toast.error("Giỏ hàng hiện chỉ hỗ trợ thêm box.");
      return;
    }

    if (!hasAuthSession()) {
      toast.error("Vui lòng đăng nhập để thêm box vào giỏ hàng.");
      navigate("/login");
      return;
    }

    const currentCartQuantity = cartBoxQuantities[String(item.id)] || 0;
    const availableQuantity = Math.max(
      (Number(item.quantity) || 0) - currentCartQuantity,
      0,
    );
    if (availableQuantity <= 0) {
      toast.error("Box này đã đạt tới số lượng có thể thêm.");
      return;
    }

    if (quantity > availableQuantity) {
      toast.error("Số lượng vượt quá tồn kho hiện có.");
      setQuantity(Math.max(availableQuantity, 1));
      return;
    }

    setIsAdding(true);
    const flySourceRect = getFlyToCartSourceRect(productImageRef.current);

    try {
      const cart = await cartApi.addItem({ boxId: item.id, quantity });
      const nextCartBoxQuantities = getCartBoxQuantities(cart);
      const nextAvailableQuantity = Math.max(
        (Number(item.quantity) || 0) -
          (nextCartBoxQuantities[String(item.id)] || 0),
        0,
      );
      const flyAnimation = flyToCart({
        sourceRect: flySourceRect,
        targetElement: getCartTargetElement(),
        imageUrl: getItemImage(item),
        label: getItemName(item),
      });
      setCartBoxQuantities(nextCartBoxQuantities);
      setQuantity(
        nextAvailableQuantity > 0
          ? Math.min(quantity, nextAvailableQuantity)
          : 1,
      );
      await flyAnimation;
      toast.success("Đã thêm box vào giỏ hàng.");
      navigate("/cart", {
        state: { subscriptionMonths: getSubscriptionMonths(selectedSubscription) },
      });
    } catch (error) {
      toast.error(error.message || "Không thể thêm box vào giỏ hàng.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div
        className="product-detail-page product-detail-page--loading"
        role="status"
        aria-label="Đang tải chi tiết"
      >
        <div className="product-detail-breadcrumb">
          <Skeleton className="product-detail-skeleton product-detail-skeleton--crumb product-detail-skeleton--crumb-short" />
          <Skeleton className="product-detail-skeleton product-detail-skeleton--arrow" />
          <Skeleton className="product-detail-skeleton product-detail-skeleton--crumb" />
          <Skeleton className="product-detail-skeleton product-detail-skeleton--arrow" />
          <Skeleton className="product-detail-skeleton product-detail-skeleton--crumb-long" />
        </div>
        <div className="product-detail-container">
          <div className="product-detail-content">
            <div className="product-detail-image-section">
              <div className="product-detail-image-frame">
                <div className="product-detail-image-topline">
                  <Skeleton className="product-detail-skeleton product-detail-skeleton--image-label" />
                  <Skeleton className="product-detail-skeleton product-detail-skeleton--image-count" />
                </div>
                <Skeleton className="product-detail-skeleton product-detail-skeleton--main-image" />
                <Skeleton className="product-detail-skeleton product-detail-skeleton--caption" />
              </div>
            </div>
            <div className="product-detail-info-section product-detail-info-section--loading">
              <Skeleton className="product-detail-skeleton product-detail-skeleton--kicker" />
              <Skeleton className="product-detail-skeleton product-detail-skeleton--title" />
              <Skeleton className="product-detail-skeleton product-detail-skeleton--rating" />
              <Skeleton className="product-detail-skeleton product-detail-skeleton--price" />
              <Skeleton className="product-detail-skeleton product-detail-skeleton--divider" />
              <Skeleton className="product-detail-skeleton product-detail-skeleton--description" />
              {type === "box" && (
                <div className="product-detail-skeleton-subscription">
                  <Skeleton className="product-detail-skeleton product-detail-skeleton--subscription-label" />
                  <div className="product-detail-skeleton-subscription-options">
                    {SUBSCRIPTIONS.map((subscription) => (
                      <Skeleton
                        key={subscription}
                        className="product-detail-skeleton product-detail-skeleton--subscription-option"
                      />
                    ))}
                  </div>
                </div>
              )}
              <Skeleton className="product-detail-skeleton product-detail-skeleton--divider" />
              <Skeleton className="product-detail-skeleton product-detail-skeleton--actions" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !item) {
    return (
      <div className="product-detail-page">
        <p className="product-detail-status product-detail-status--error">
          {errorMessage || "Không tìm thấy sản phẩm."}
        </p>
      </div>
    );
  }

  const isBox = itemType === "box";
  const currentCartQuantity = isBox
    ? cartBoxQuantities[String(item.id)] || 0
    : 0;
  const availableQuantity = isBox
    ? Math.max((Number(item.quantity) || 0) - currentCartQuantity, 0)
    : Number(item.quantity) || 0;
  const ratingValue = Number(item.rating ?? item.averageRating);
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;
  const normalizedRating = Math.min(Math.max(ratingValue, 0), 5);
  const productCategory =
    item.category || (isBox ? "Subscription Box" : "HerDays marketplace");
  const parentBoxId =
    item.boxId || item.parentBoxId || item.box?.id || location.state?.boxId;
  const parentBoxName =
    item.boxName ||
    item.parentBoxName ||
    item.box?.boxName ||
    location.state?.boxName;

  return (
    <div className="product-detail-page">
      <div className="product-detail-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <MdKeyboardArrowRight />
        <Link to="/marketplace">Cửa hàng</Link>
        <MdKeyboardArrowRight />
        <span className="product-detail-breadcrumb-active">
          {getItemName(item)}
        </span>
      </div>

      <div className="product-detail-container">
        <div className="product-detail-content">
          <div className="product-detail-image-section">
            <div className="product-detail-image-frame">
              <div className="product-detail-image-topline">
                <span className="product-detail-image-context">Hình ảnh</span>
                <span className="product-detail-image-count">
                  {isBox ? `${relatedProducts.length} sản phẩm` : "HerDays"}
                </span>
              </div>
              <img
                ref={productImageRef}
                src={getItemImage(item)}
                alt={getItemName(item)}
                className="product-detail-main-image"
                width="600"
                height="600"
              />
              <p className="product-detail-image-caption">
                {isBox
                  ? "Một chăm sóc phù hợp với bạn."
                  : "Sản phẩm chăm sóc từ HerDays."}
              </p>
            </div>
          </div>

          <div className="product-detail-info-section">
            <p className="product-detail-kicker">{productCategory}</p>
            <h1 className="product-detail-title">{getItemName(item)}</h1>

            <div
              className={`product-detail-rating ${hasRating ? "" : "product-detail-rating--empty"}`}
            >
              {hasRating ? (
                <>
                  <div
                    role="img"
                    className="product-detail-stars"
                    aria-label={`Đánh giá ${normalizedRating} trên 5`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`product-detail-star ${i < Math.round(normalizedRating) ? "product-detail-star-filled" : ""}`}
                      />
                    ))}
                  </div>
                  <span className="product-detail-rating-text">
                    {normalizedRating}/5
                  </span>
                </>
              ) : (
                <span className="product-detail-rating-text">
                  Chưa có đánh giá
                </span>
              )}
            </div>

            <div className="product-detail-price-section">
              <span className="product-detail-current-price">
                {formatCurrency(item.price)}
              </span>
              {!isBox && item.unit && (
                <span className="product-detail-unit">/ {item.unit}</span>
              )}
              {isBox && (
                <span className="product-detail-discount">
                  {availableQuantity > 0
                    ? `Còn ${availableQuantity}`
                    : "Hết hàng"}
                </span>
              )}
            </div>

            <hr className="product-detail-divider" />

            <div className="product-detail-description-section">
              <h2 className="product-detail-description-heading">Mô tả</h2>
              <div className="product-detail-description-block">
                <p className="product-detail-description">
                  {item.description ||
                    "Sản phẩm HerDays được đồng bộ trực tiếp từ backend marketplace."}
                </p>
              </div>
            </div>

            {isBox && (
              <div className="product-detail-subscription">
                <span className="product-detail-subscription-label">
                  Đăng ký định kỳ
                </span>
                <div className="product-detail-subscription-options">
                  {SUBSCRIPTIONS.map((subscription) => (
                    <button
                      key={subscription}
                      type="button"
                      className={`product-detail-subscription-btn ${selectedSubscription === subscription ? "product-detail-subscription-btn-active" : ""}`}
                      aria-pressed={selectedSubscription === subscription}
                      onClick={() => setSelectedSubscription(subscription)}
                    >
                      {subscription}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <hr className="product-detail-divider" />

            <div className="product-detail-actions">
              <div className="product-detail-quantity">
                <button
                  type="button"
                  onClick={() => updateQuantity(quantity - 1)}
                  aria-label="Giảm số lượng"
                  className="product-detail-quantity-btn"
                  disabled={!isBox || quantity <= 1}
                >
                  <FiMinus />
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  aria-label="Số lượng box"
                  className="product-detail-quantity-input"
                />
                <button
                  type="button"
                  onClick={() => updateQuantity(quantity + 1)}
                  aria-label="Tăng số lượng"
                  className="product-detail-quantity-btn"
                  disabled={!isBox || quantity >= availableQuantity}
                >
                  <FiPlus />
                </button>
              </div>
              <button
                className="product-detail-add-to-cart"
                type="button"
                disabled={!isBox || isAdding || availableQuantity <= 0}
                onClick={handleAddToCart}
              >
                {isAdding
                  ? "Đang thêm..."
                  : isBox
                    ? "Thêm vào giỏ hàng"
                    : "Sản phẩm lẻ"}
              </button>
            </div>

            {!isBox && (
              <div className="product-detail-single-note">
                <p>Đây là sản phẩm lẻ, bạn cần mua theo box.</p>
                {parentBoxId && parentBoxName && (
                  <Link
                    to={`/product-detail/box/${parentBoxId}`}
                    className="product-detail-single-note-link"
                  >
                    Quay lại Box “{parentBoxName}”
                  </Link>
                )}
                <Link
                  to="/marketplace"
                  className="product-detail-single-note-link"
                >
                  Quay lại trang danh sách subcription box
                </Link>
              </div>
            )}
          </div>
        </div>

        {isBox && (
          <div className="product-detail-related-section">
            <div className="product-detail-related-header">
              <div className="product-detail-related-header-copy">
                <h2 className="product-detail-related-title">
                  Sản phẩm có trong Box
                </h2>
                <span className="product-detail-related-scroll-hint">
                  Cuộn để khám phá
                </span>
              </div>
              <Link
                to={`/box-customize/${item.id}`}
                className="product-detail-related-customize"
              >
                Tùy chỉnh
              </Link>
            </div>

            <div
              className="product-detail-related-grid"
              role="region"
              aria-label="Danh sách sản phẩm trong box"
            >
              {relatedProducts.length === 0 ? (
                <p className="product-detail-status">
                  Box này chưa có sản phẩm con.
                </p>
              ) : (
                relatedProducts.map((relatedProduct, index) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/product-detail/${relatedProduct.id}`}
                    state={{ boxId: item.id, boxName: getItemName(item) }}
                    className="product-detail-related-card"
                  >
                    <div className="product-detail-related-image">
                      <img
                        src={getItemImage(relatedProduct)}
                        alt={relatedProduct.name}
                        loading="lazy"
                        width="300"
                        height="300"
                      />
                    </div>
                    <div className="product-detail-related-info">
                      <div className="product-detail-related-topline">
                        <p className="product-detail-related-subtitle">
                          {relatedProduct.subtitle}
                        </p>
                        <span className="product-detail-related-quantity">
                          {String(index + 1).padStart(2, "0")} · ×
                          {relatedProduct.quantity}
                        </span>
                      </div>
                      <h3 className="product-detail-related-name">
                        {relatedProduct.name}
                      </h3>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
