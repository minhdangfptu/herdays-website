import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdCategory,
  MdCheck,
  MdCleanHands,
  MdHealthAndSafety,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdLock,
  MdMedicalServices,
  MdMedication,
  MdRestaurant,
} from "react-icons/md";
import {
  cartApi,
  getCartBoxQuantities,
  hasAuthSession,
  marketplaceApi,
  profileApi,
} from "../../services/apiService.js";
import { isBoxCompatibleWithTarget } from "../../utils/boxTarget.js";
import { Skeleton } from "../../components/Skeleton.jsx";
import { ShimmerButton } from "../../components/magic-ui/ShimmerButton.jsx";
import { MotionCard } from "../../motion/MotionPrimitives.jsx";
import { getLenis } from "../../motion/lenisInstance.js";
import {
  flyToCart,
  getCartTargetElement,
  getFlyToCartSourceRect,
} from "../../utils/flyToCart.js";
import "./BoxCustomize.scss";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getProductImage = (product) =>
  product.thumbnail ||
  `https://placehold.co/280x280/f8c4d8/ffffff?text=${encodeURIComponent(product.productName || "HerDays")}`;

const getBoxName = (box) => box?.boxName || "HerDays Box của bạn";

const getBoxImage = (box) =>
  box?.thumbnail ||
  `https://placehold.co/360x360/f8c4d8/ffffff?text=${encodeURIComponent(getBoxName(box))}`;

const isProductInStock = (product) =>
  Number(product?.stockQuantity ?? product?.quantity) > 0;

const normalizeBoxProduct = (item) => ({
  id: String(item.productId),
  productName: item.productName || "Sản phẩm trong box",
  unit: item.unit || "",
  category: item.category || "Trong box",
  thumbnail: item.thumbnail,
  price: Number(item.price) || 0,
  quantity: item.quantity || 1,
  isCustomizable: item.isCustomizable === true,
  selectionGroup: item.selectionGroup || null,
});

const selectionGroupLabels = {
  "box-dau-bvs-ngay": "Băng vệ sinh ngày · Chọn 1 sản phẩm",
  "box-dau-bvs-dem": "Băng vệ sinh đêm · Chọn 1 sản phẩm",
  "box-dau-thuc-pham-chuc-nang": "Thực phẩm chức năng · Chọn 1 sản phẩm",
  "box-mam-que-thu-rung-trung": "Que thử rụng trứng · Chọn 1 sản phẩm",
  "box-mam-ddvs-mini": "Dung dịch vệ sinh mini · Chọn 1 sản phẩm",
  "box-mam-thuc-pham-chuc-nang": "Thực phẩm chức năng · Chọn 1 sản phẩm",
  "box-bau-ddvs-mini": "Dung dịch vệ sinh mini · Chọn 1 sản phẩm",
  "box-bau-sua-khong-duong": "Sữa không đường · Chọn 1 sản phẩm",
  "box-bau-thuc-pham-chuc-nang": "Thực phẩm chức năng · Chọn 1 sản phẩm",
};

const getSelectionGroupLabel = (selectionGroup) =>
  selectionGroupLabels[selectionGroup] || `${selectionGroup} · Chọn 1 sản phẩm`;

const getAllMarketplaceItems = async (listItems) => {
  const firstPage = await listItems({ page: 1, limit: 50 })
  const totalPages = firstPage.pagination?.totalPages || 1

  if (totalPages === 1) return firstPage.items || []

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => (
      listItems({ page: index + 2, limit: 50 })
    ))
  )

  return [
    ...(firstPage.items || []),
    ...remainingPages.flatMap((result) => result.items || [])
  ]
}

const getCategoryIcon = (category) => {
  const normalizedCategory = String(category || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedCategory.includes("dinh duong")) return MdRestaurant;
  if (normalizedCategory.includes("dich vu")) return MdMedicalServices;
  if (
    normalizedCategory.includes("theo doi") ||
    normalizedCategory.includes("suc khoe")
  ) {
    return MdHealthAndSafety;
  }
  if (
    normalizedCategory.includes("vitamin") ||
    normalizedCategory.includes("khoang chat")
  ) {
    return MdMedication;
  }
  if (
    normalizedCategory.includes("ve sinh") ||
    normalizedCategory.includes("ca nhan")
  ) {
    return MdCleanHands;
  }

  return MdCategory;
};

function FixedProductsSection({ products, selectedItems, onSelect }) {
  if (products.length === 0) return null;

  const groupedProducts = products.reduce((groups, product) => {
    const group = product.selectionGroup || "__always_fixed__";
    if (!groups[group]) groups[group] = [];
    groups[group].push(product);
    return groups;
  }, {});
  const choiceGroups = Object.entries(groupedProducts).filter(
    ([selectionGroup]) => selectionGroup !== "__always_fixed__",
  );
  const alwaysFixedProducts = groupedProducts.__always_fixed__ || [];

  const selectedIds = new Set(
    selectedItems
      .filter((item) => item.isCustomizable !== true)
      .map((item) => String(item.id)),
  );

  return (
    <section
      className="fixed-products-section"
      aria-labelledby="fixed-products-title"
    >
      <div className="fixed-products-heading">
        <div>
          <span className="fixed-products-icon">
            <MdLock aria-hidden="true" />
          </span>
          <div>
            <h2 id="fixed-products-title">Sản phẩm cố định</h2>
            <p>
              Sản phẩm cố định luôn thuộc box; một số nhóm cho phép chọn 1 sản phẩm.
            </p>
          </div>
        </div>
        <strong>{products.length} sản phẩm</strong>
      </div>
      <div className="fixed-products-list">
        {choiceGroups.map(([selectionGroup, groupProducts]) => {
          return (
            <div
              className="fixed-product-group is-choice-group"
              key={selectionGroup}
            >
              <h3 className="fixed-product-group-title">
                {getSelectionGroupLabel(selectionGroup)}
              </h3>
              <div className="fixed-product-group-list">
                {groupProducts.map((product) => {
                  const isSelected = selectedIds.has(String(product.id));
                  const isAvailable = isProductInStock(product);

                  return (
                    <label
                      className={`fixed-product-item fixed-product-choice ${isSelected ? "is-selected" : ""} ${!isAvailable ? "is-unavailable" : ""}`}
                      key={product.id}
                    >
                      <input
                        type="radio"
                        name={selectionGroup}
                        checked={isSelected}
                        disabled={!isAvailable}
                        onChange={() => onSelect(product)}
                      />
                      <img src={getProductImage(product)} alt="" />
                      <span className="fixed-product-name">
                        {product.productName}
                        {product.unit ? ` · ${product.unit}` : ""}
                      </span>
                      <span className="fixed-product-quantity">×{product.quantity}</span>
                      <MdCheck aria-label="Đã chọn" />
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        {alwaysFixedProducts.length > 0 && (
          <div className="fixed-product-group is-always-fixed">
            <h3 className="fixed-product-group-title">
              Sản phẩm luôn có sẵn trong box
            </h3>
            <div className="fixed-product-group-list">
              {alwaysFixedProducts.map((product) => (
                <div className="fixed-product-item" key={product.id}>
                  <img src={getProductImage(product)} alt="" />
                  <span className="fixed-product-name">
                    {product.productName}
                    {product.unit ? ` · ${product.unit}` : ""}
                  </span>
                  <span className="fixed-product-quantity">×{product.quantity}</span>
                  <MdCheck aria-label="Đã có trong box" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function BoxCustomize() {
  const { boxId } = useParams();
  const navigate = useNavigate();
  const [box, setBox] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [cartBoxQuantities, setCartBoxQuantities] = useState({});
  const [targetStatus, setTargetStatus] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [isBoxPickerOpen, setIsBoxPickerOpen] = useState(false);
  const [highlightedBoxId, setHighlightedBoxId] = useState(boxId || "");
  const checkoutButtonRef = useRef(null);
  const categorySectionRefs = useRef({});
  const boxPickerRef = useRef(null);
  const programmaticCategoryRef = useRef(null);
  const programmaticCategoryTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadCustomizeData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const [boxList, productList, boxResult, cartResult, profileResult] = await Promise.all([
          getAllMarketplaceItems(marketplaceApi.listBoxes),
          getAllMarketplaceItems(marketplaceApi.listProducts),
          boxId ? marketplaceApi.getBox(boxId) : Promise.resolve(null),
          hasAuthSession()
            ? cartApi.getCart().catch(() => null)
            : Promise.resolve(null),
          hasAuthSession()
            ? profileApi.getProfile()
            : Promise.resolve(null)
        ]);

        if (!isMounted) return;

        const nextProducts = productList;
        const availableProductIds = new Set(
          nextProducts
            .filter(isProductInStock)
            .map((product) => String(product.id)),
        );
        const initialProducts = [];
        const selectedGroups = new Set();
        (boxResult?.products || [])
          .map(normalizeBoxProduct)
          .forEach((product) => {
            if (!availableProductIds.has(product.id)) return;
            if (product.selectionGroup) {
              if (selectedGroups.has(product.selectionGroup)) return;
              selectedGroups.add(product.selectionGroup);
            }
            initialProducts.push({
              ...product,
              quantity: product.isCustomizable ? 0 : product.quantity,
            });
          });

        const nextTargetStatus = profileResult?.targetStatus || '';
        const allowedBoxes = boxList.filter((boxOption) => (
          isBoxCompatibleWithTarget(boxOption, nextTargetStatus)
        ))

        setTargetStatus(nextTargetStatus)
        setBoxes(allowedBoxes)
        setProducts(nextProducts)
        setCartBoxQuantities(getCartBoxQuantities(cartResult))

        if (!hasAuthSession()) {
          setBox(null)
          setSelectedItems([])
          setErrorMessage('Vui lòng đăng nhập để tùy chỉnh box.')
          return
        }

        if (!nextTargetStatus) {
          setBox(null)
          setSelectedItems([])
          setErrorMessage('Vui lòng hoàn thành mục tiêu cá nhân trước khi tùy chỉnh box.')
          return
        }

        if (boxResult && !isBoxCompatibleWithTarget(boxResult, nextTargetStatus)) {
          setBox(null)
          setSelectedItems([])
          setErrorMessage('Bạn chỉ có thể tùy chỉnh box phù hợp với mục tiêu của mình.')
          return
        }

        setBox(boxResult)
        setSelectedItems(initialProducts);
      } catch (error) {
        if (isMounted)
          setErrorMessage(
            error.message || "Không thể tải dữ liệu tùy chỉnh box.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCustomizeData();

    return () => {
      isMounted = false;
    };
  }, [boxId]);

  const productsById = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products],
  );

  const fixedProducts = useMemo(
    () =>
      (box?.products || [])
        .map(normalizeBoxProduct)
        .filter((product) => !product.isCustomizable)
        .map((boxProduct) => {
          const catalogProduct = productsById.get(boxProduct.id);
          return {
            ...boxProduct,
            ...catalogProduct,
            id: boxProduct.id,
            category: boxProduct.category,
            productName: boxProduct.productName,
            thumbnail: boxProduct.thumbnail,
            quantity: boxProduct.quantity,
            stockQuantity: catalogProduct?.quantity ?? 0,
          };
        }),
    [box, productsById],
  );

  const fixedSelectionGroups = useMemo(
    () =>
      Object.entries(
        fixedProducts.reduce((groups, product) => {
          if (!product.selectionGroup) return groups;
          if (!groups[product.selectionGroup]) groups[product.selectionGroup] = [];
          groups[product.selectionGroup].push(product);
          return groups;
        }, {}),
      ),
    [fixedProducts],
  );

  const customizableProducts = useMemo(
    () =>
      (box?.products || [])
        .map(normalizeBoxProduct)
        .filter((product) => product.isCustomizable)
        .map((boxProduct) => ({
          ...boxProduct,
          ...productsById.get(boxProduct.id),
          id: boxProduct.id,
          category: boxProduct.category,
          productName: boxProduct.productName,
          thumbnail: boxProduct.thumbnail,
          boxQuantity: boxProduct.quantity,
        })),
    [box, productsById],
  );

  const customizableProductsById = useMemo(
    () => new Map(customizableProducts.map((product) => [product.id, product])),
    [customizableProducts],
  );

  const groupedProducts = useMemo(
    () =>
      customizableProducts.reduce((acc, product) => {
        const category = product.category || "Sản phẩm khác";
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
      }, {}),
    [customizableProducts],
  );

  const categoryLimits = useMemo(
    () =>
      (box?.products || []).reduce((limits, item) => {
        const product = normalizeBoxProduct(item);
        if (!product.isCustomizable) return limits;
        limits[product.category] =
          (limits[product.category] || 0) + product.quantity;
        return limits;
      }, {}),
    [box],
  );

  const requiredCategories = useMemo(
    () => Object.keys(categoryLimits),
    [categoryLimits],
  );

  const customizableProductGroups = useMemo(
    () =>
      Object.entries(groupedProducts).filter(([category]) =>
        requiredCategories.includes(category),
      ),
    [groupedProducts, requiredCategories],
  );

  const categoryNames = useMemo(
    () => customizableProductGroups.map(([category]) => category),
    [customizableProductGroups],
  );

  const currentActiveCategory = categoryNames.includes(activeCategory)
    ? activeCategory
    : categoryNames[0] || "";

  useEffect(() => {
    if (categoryNames.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];

        const visibleCategory = visibleEntry?.target.dataset.category;
        if (!visibleCategory) return;

        if (programmaticCategoryRef.current) {
          if (visibleCategory !== programmaticCategoryRef.current) return;
          programmaticCategoryRef.current = null;
          window.clearTimeout(programmaticCategoryTimeoutRef.current);
        }

        setActiveCategory(visibleCategory);
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.2, 0.45, 0.7],
      },
    );

    categoryNames.forEach((category) => {
      const section = categorySectionRefs.current[category];
      if (section) observer.observe(section);
    });

    return () => {
      observer.disconnect();
      window.clearTimeout(programmaticCategoryTimeoutRef.current);
    };
  }, [categoryNames]);

  useEffect(() => {
    if (!isBoxPickerOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!boxPickerRef.current?.contains(event.target))
        setIsBoxPickerOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsBoxPickerOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBoxPickerOpen]);

  const selectedCategoryTotals = useMemo(
    () =>
      selectedItems
        .filter((item) => item.isCustomizable)
        .reduce((totals, item) => {
          totals[item.category] = (totals[item.category] || 0) + item.quantity;
          return totals;
        }, {}),
    [selectedItems],
  );

  const incompleteSelectionGroups = useMemo(
    () =>
      fixedSelectionGroups.filter(([, groupProducts]) => {
        const selectedCount = groupProducts.filter((product) =>
          selectedItems.some((item) => item.id === product.id),
        ).length;
        return selectedCount !== 1;
      }),
    [fixedSelectionGroups, selectedItems],
  );

  const isSelectionComplete =
    Boolean(box?.id) &&
    (box?.products || []).length > 0 &&
    incompleteSelectionGroups.length === 0;

  const selectedProductCount = useMemo(
    () => selectedItems.reduce((total, item) => total + item.quantity, 0),
    [selectedItems],
  );

  const customizationExtraPrice = useMemo(
    () =>
      selectedItems.reduce((total, item) => {
        const product = customizableProductsById.get(item.id);
        if (!product) return total;

        return total + Number(item.quantity) * (Number(product.price) || 0);
      }, 0),
    [customizableProductsById, selectedItems],
  );

  const totalBoxPrice = (Number(box?.price) || 0) + customizationExtraPrice;
  const isBoxCustomized = useMemo(
    () =>
      customizableProducts.some((product) => {
        const selectedQuantity =
          selectedItems.find((item) => item.id === product.id)?.quantity || 0;
        return selectedQuantity > 0;
      }),
    [customizableProducts, selectedItems],
  );

  const scrollToCategory = (category) => {
    programmaticCategoryRef.current = category;
    window.clearTimeout(programmaticCategoryTimeoutRef.current);
    programmaticCategoryTimeoutRef.current = window.setTimeout(() => {
      programmaticCategoryRef.current = null;
    }, 1000);
    setActiveCategory(category);
    const target = categorySectionRefs.current[category];
    if (!target) return;

    const headerHeight = document.querySelector(".header")?.getBoundingClientRect().height || 0;
    const stepperRect = document.querySelector(".category-stepper")?.getBoundingClientRect();
    const lenis = getLenis();
    const currentScroll = lenis?.scroll ?? window.scrollY;
    const stickyContentBottom = stepperRect
      ? stepperRect.bottom
      : headerHeight;
    const targetScrollTop = Math.max(
      currentScroll + target.getBoundingClientRect().top - stickyContentBottom - 24,
      0,
    );

    if (lenis) {
      lenis.scrollTo(targetScrollTop, { duration: 0.7 });
      return;
    }

    window.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  };

  const activeCategoryIndex = Math.max(
    categoryNames.indexOf(currentActiveCategory),
    0,
  );

  const moveToCategory = (category, direction) => {
    const categoryIndex = categoryNames.indexOf(category);
    const nextCategory = categoryNames[categoryIndex + direction];
    if (nextCategory) scrollToCategory(nextCategory);
  };

  const selectBox = (nextBoxId) => {
    setHighlightedBoxId(nextBoxId);
    setIsBoxPickerOpen(false);
    if (nextBoxId && String(nextBoxId) !== String(boxId || "")) {
      navigate(`/box-customize/${nextBoxId}`);
    }
  };

  const handleBoxPickerKeyDown = (event) => {
    if (!isBoxPickerOpen && ["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      setHighlightedBoxId(boxId || boxes[0]?.id || "");
      setIsBoxPickerOpen(true);
      return;
    }

    if (!isBoxPickerOpen || boxes.length === 0) return;

    const currentIndex = boxes.findIndex(
      (boxOption) => String(boxOption.id) === String(highlightedBoxId),
    );

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = Math.min(
        Math.max(currentIndex + direction, 0),
        boxes.length - 1,
      );
      setHighlightedBoxId(boxes[nextIndex].id);
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setHighlightedBoxId(
        event.key === "Home" ? boxes[0].id : boxes[boxes.length - 1].id,
      );
    }

    if (event.key === "Enter" && highlightedBoxId) {
      event.preventDefault();
      selectBox(highlightedBoxId);
    }
  };

  const updateProductQuantity = (product, change) => {
    const productId = String(product.id);
    const category = product.category || "Sản phẩm khác";
    const currentItem = selectedItems.find((item) => item.id === productId);
    const currentQuantity = currentItem?.quantity || 0;

    if (change > 0 && !isProductInStock(product)) {
      toast.error("Sản phẩm này đã hết hàng.");
      return;
    }

    if (change > 0 && currentQuantity >= Number(product.quantity)) {
      toast.error("Số lượng chọn đã đạt tồn kho của sản phẩm này.");
      return;
    }

    const nextQuantity = currentQuantity + change;
    setSelectedItems((current) => {
      if (nextQuantity <= 0)
        return current.filter((item) => item.id !== productId);
      if (currentItem) {
        return current.map((item) =>
          item.id === productId ? { ...item, quantity: nextQuantity } : item,
        );
      }

      return [
        ...current,
        {
          id: productId,
          productName: product.productName,
          unit: product.unit || "",
          category,
          thumbnail: product.thumbnail,
          quantity: 1,
          isCustomizable: true,
        },
      ];
    });
  };

  const selectFixedProduct = (product) => {
    if (!product.selectionGroup || !isProductInStock(product)) return;

    setSelectedItems((current) => [
      ...current.filter(
        (item) => item.selectionGroup !== product.selectionGroup,
      ),
      {
        ...product,
        quantity: product.quantity,
        isCustomizable: false,
      },
    ]);
  };

  const availableBoxQuantity = box
    ? Math.max(
        (Number(box.quantity) || 0) - (cartBoxQuantities[String(box.id)] || 0),
        0,
      )
    : 0;

  const selectedBoxName =
    box?.boxName ||
    boxes.find((boxOption) => String(boxOption.id) === String(boxId || ""))
      ?.boxName ||
    "Chọn một box";

  const handleBuyNow = async () => {
    if (!box?.id) {
      toast.error("Vui lòng chọn một box trước khi mua.");
      return;
    }

    if (!isBoxCompatibleWithTarget(box, targetStatus)) {
      toast.error('Bạn chỉ có thể tùy chỉnh box phù hợp với mục tiêu của mình.')
      return
    }

    if (availableBoxQuantity <= 0) {
      toast.error("Box này đã hết hàng.");
      return;
    }

    if (!isSelectionComplete) {
      const missingText = [
        ...incompleteSelectionGroups.map(([selectionGroup]) =>
          getSelectionGroupLabel(selectionGroup),
        ),
      ].join(", ");
      toast.error(
        `Vui lòng hoàn tất lựa chọn sản phẩm${missingText ? `: ${missingText}` : ""}.`,
      );
      return;
    }

    if (!hasAuthSession()) {
      toast.error("Vui lòng đăng nhập để thêm box vào giỏ hàng.");
      navigate("/login");
      return;
    }

    setIsAdding(true);
    const flySourceRect = getFlyToCartSourceRect(checkoutButtonRef.current);

    try {
      const selectableIds = new Set([
        ...customizableProducts.map((product) => product.id),
        ...fixedProducts
          .filter((product) => product.selectionGroup)
          .map((product) => product.id),
      ]);
      const customizedProducts = selectedItems
        .filter((item) => selectableIds.has(item.id) && item.quantity > 0)
        .map((item) => ({ productId: item.id, quantity: item.quantity }));
      const cart = await cartApi.addItem({
        boxId: box.id,
        quantity: 1,
        customizedProducts,
      });
      const flyAnimation = flyToCart({
        sourceRect: flySourceRect,
        targetElement: getCartTargetElement(),
        imageUrl: getBoxImage(box),
        label: getBoxName(box),
      });
      setCartBoxQuantities(getCartBoxQuantities(cart));
      await flyAnimation;
      toast.success("Đã thêm box vào giỏ hàng.");
      navigate("/check-out");
    } catch (error) {
      toast.error(error.message || "Không thể thêm box vào giỏ hàng.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="box-customize-page">
      <div className="box-customize-container">
        <div className="box-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <MdKeyboardArrowRight />
          <Link to="/marketplace">Cửa hàng</Link>
          <MdKeyboardArrowRight />
          <span className="box-breadcrumb-active">
            {box?.boxName || "HerDays Box của bạn"}
          </span>
        </div>

        <div className="box-header">
          <h1 className="box-title">Tùy chỉnh box của bạn</h1>
          <p className="box-subtitle">
            Chọn những sản phẩm chăm sóc phù hợp với nhu cầu của bạn để tạo nên
            một box dành riêng cho hành trình của mình.
          </p>
          <label className="box-picker">
            <span className="box-picker-label">Chọn box muốn tùy chỉnh</span>
            <div
              className={`box-picker-control ${isBoxPickerOpen ? "is-open" : ""}`}
              ref={boxPickerRef}
            >
              <button
                type="button"
                className="box-picker-trigger"
                aria-haspopup="listbox"
                aria-expanded={isBoxPickerOpen}
                aria-controls="box-picker-listbox"
                aria-activedescendant={
                  isBoxPickerOpen && highlightedBoxId
                    ? `box-picker-option-${String(highlightedBoxId).replace(/[^a-zA-Z0-9_-]/g, "-")}`
                    : undefined
                }
                onClick={() => {
                  setHighlightedBoxId(boxId || boxes[0]?.id || "");
                  setIsBoxPickerOpen((isOpen) => !isOpen);
                }}
                onKeyDown={handleBoxPickerKeyDown}
              >
                <span className="box-picker-trigger-value">
                  {selectedBoxName}
                </span>
                <MdKeyboardArrowDown aria-hidden="true" />
              </button>

              {isBoxPickerOpen && (
                <div
                  id="box-picker-listbox"
                  className="box-picker-menu"
                  role="listbox"
                  aria-label="Danh sách box có thể tùy chỉnh"
                  data-lenis-prevent
                >
                  {boxes.length === 0 ? (
                    <p className="box-picker-empty">Chưa có box để lựa chọn.</p>
                  ) : (
                    boxes.map((boxOption) => {
                      const isSelected =
                        String(boxOption.id) === String(boxId || "");
                      const isHighlighted =
                        String(boxOption.id) === String(highlightedBoxId);
                      const optionId = `box-picker-option-${String(boxOption.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`;

                      return (
                        <button
                          key={boxOption.id}
                          id={optionId}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={`box-picker-option ${isSelected ? "is-selected" : ""} ${isHighlighted ? "is-highlighted" : ""}`}
                          onMouseEnter={() => setHighlightedBoxId(boxOption.id)}
                          onClick={() => selectBox(boxOption.id)}
                        >
                          <span>{boxOption.boxName}</span>
                          {isSelected && <MdCheck aria-hidden="true" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </label>
        </div>

        {loading && (
          <div
            className="space-y-5"
            role="status"
            aria-label="Đang tải sản phẩm"
          >
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        )}
        {errorMessage && (
          <p className="box-customize-status box-customize-status--error">
            {errorMessage}
          </p>
        )}

        {!loading && !errorMessage && (
          <>
            {box && customizableProductGroups.length > 0 && (
              <nav
                className="category-stepper"
                aria-label="Tiến trình chọn sản phẩm"
              >
                <div className="category-stepper-heading">
                  <div>
                    <span>Tiến trình lựa chọn</span>
                    <strong>{selectedProductCount} sản phẩm đã chọn</strong>
                  </div>
                  <span className="category-stepper-position">
                    Phần {activeCategoryIndex + 1}/{categoryNames.length}
                  </span>
                </div>

                <div className="category-stepper-list" data-lenis-prevent>
                  {categoryNames.map((category) => {
                    const selectedCount = selectedCategoryTotals[category] || 0;
                    const isComplete =
                      selectedCount >= categoryLimits[category];
                    const isActive = category === currentActiveCategory;
                    const CategoryIcon = getCategoryIcon(category);

                    return (
                      <button
                        key={category}
                        type="button"
                        className={`category-step ${isActive ? "is-active" : ""} ${isComplete ? "is-complete" : ""}`}
                        aria-current={isActive ? "step" : undefined}
                        onClick={() => scrollToCategory(category)}
                      >
                        <span className="category-step-icon">
                          <CategoryIcon aria-hidden="true" />
                          {isComplete && (
                            <span className="category-step-complete-mark">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="category-step-content">
                          <strong>{category}</strong>
                          <small>Đã chọn {selectedCount} sản phẩm</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            )}

            <div className="box-selection-card">
              <div className="selection-card-body">
                {!box ? (
                  <p className="box-customize-status">
                    Vui lòng chọn một box để bắt đầu tùy chỉnh.
                  </p>
                ) : customizableProductGroups.length === 0 ? (
                  <>
                    <FixedProductsSection
                      products={fixedProducts}
                      selectedItems={selectedItems}
                      onSelect={selectFixedProduct}
                    />
                    <p className="box-customize-status">
                      Box này chưa có sản phẩm thay đổi.
                    </p>
                  </>
                ) : (
                  <>
                    <FixedProductsSection
                      products={fixedProducts}
                      selectedItems={selectedItems}
                      onSelect={selectFixedProduct}
                    />

                    <div className="customizable-products-heading">
                      <span className="customizable-products-icon">
                        <MdCategory aria-hidden="true" />
                      </span>
                      <div>
                        <h2>Sản phẩm thay đổi</h2>
                        <p>
                          Điều chỉnh số lượng trong danh sách sản phẩm được phép
                          thay đổi của box.
                        </p>
                      </div>
                    </div>

                    {customizableProductGroups.map(
                      ([category, categoryProducts]) => (
                        <div
                          key={category}
                          ref={(element) => {
                            categorySectionRefs.current[category] = element;
                          }}
                          data-category={category}
                          className="category-section"
                        >
                          <div className="category-divider">
                            <span>{category}</span>
                            <strong>
                              Đã chọn {selectedCategoryTotals[category] || 0}{" "}
                              sản phẩm
                            </strong>
                          </div>

                          <div className="product-grid">
                            {categoryProducts.map((product) => {
                              const selectedQuantity =
                                selectedItems.find(
                                  (item) => item.id === String(product.id),
                                )?.quantity || 0;
                              const isSelected = selectedQuantity > 0;
                              const isOutOfStock = !isProductInStock(product);
                              return (
                                <MotionCard
                                  as="article"
                                  key={product.id}
                                  className={`product-card ${isSelected ? "selected" : ""} ${isOutOfStock ? "is-out-of-stock" : ""}`}
                                  delay={
                                    0.03 *
                                    (categoryProducts.indexOf(product) % 4)
                                  }
                                >
                                  <div className="product-image">
                                    <img
                                      src={getProductImage(product)}
                                      alt={product.productName}
                                    />
                                  </div>
                                  <div className="product-info">
                                    <h3 className="product-name">
                                      {product.productName}
                                    </h3>
                                    <p className="product-description">
                                      {product.description ||
                                        "Chưa có mô tả sản phẩm."}
                                    </p>
                                    <p className="product-price">
                                      {formatCurrency(product.price)}
                                      {product.unit ? ` / ${product.unit}` : ""}
                                    </p>
                                    <div className="product-meta">
                                      <span className="product-tag">
                                        {product.quantity > 0
                                          ? `Còn ${product.quantity}`
                                          : "Hết hàng"}
                                      </span>
                                      <div
                                        className="product-quantity-selector"
                                        aria-label={`Số lượng ${product.productName}`}
                                      >
                                        <button
                                          type="button"
                                          disabled={selectedQuantity <= 0}
                                          onClick={() =>
                                            updateProductQuantity(product, -1)
                                          }
                                          aria-label={`Giảm ${product.productName}`}
                                        >
                                          −
                                        </button>
                                        <strong>{selectedQuantity}</strong>
                                        <button
                                          type="button"
                                          disabled={
                                            isOutOfStock ||
                                            selectedQuantity >=
                                              Number(product.quantity)
                                          }
                                          onClick={() =>
                                            updateProductQuantity(product, 1)
                                          }
                                          aria-label={`Tăng ${product.productName}`}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </MotionCard>
                              );
                            })}
                          </div>

                          <div
                            className="category-navigation"
                            aria-label={`Điều hướng ${category}`}
                          >
                            <button
                              type="button"
                              className="category-navigation-button category-navigation-button--previous"
                              disabled={categoryNames.indexOf(category) === 0}
                              onClick={() => moveToCategory(category, -1)}
                            >
                              ← Phần trước
                            </button>
                            <button
                              type="button"
                              className="category-navigation-button category-navigation-button--next"
                              disabled={
                                categoryNames.indexOf(category) ===
                                categoryNames.length - 1
                              }
                              onClick={() => moveToCategory(category, 1)}
                            >
                              Tiếp theo →
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sticky-bottom-bar">
        <div className="bar-content">
          <div className="bar-left">
            <span className="bar-title">
              {box?.boxName || "Box cá nhân hóa"}
              {isBoxCustomized ? "  đã cá nhân hoá" : ""}
            </span>
            <span className="bar-price">
              {formatCurrency(totalBoxPrice)}
              {isBoxCustomized && (
                <span className="bar-price-breakdown">
                  (+{formatCurrency(customizationExtraPrice)})
                </span>
              )}
            </span>
          </div>

          <div className="bar-right">
            <span className="bar-count">
              Đã chọn {selectedProductCount} sản phẩm
            </span>
            <span className="bar-stock">
              {availableBoxQuantity > 0
                ? `Còn ${availableBoxQuantity} box`
                : "Hết box"}
            </span>
            <ShimmerButton
              ref={checkoutButtonRef}
              className="bar-checkout-btn"
              disabled={
                isAdding ||
                !box?.id ||
                availableBoxQuantity <= 0 ||
                !isSelectionComplete
              }
              onClick={handleBuyNow}
            >
              {isAdding ? "Đang thêm..." : "Mua ngay"}
            </ShimmerButton>
          </div>
        </div>
      </div>
    </div>
  );
}
