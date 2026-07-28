import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Image,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";

import { adminApi, cloudinaryApi } from "../../services/apiService.js";
import { TableSkeleton } from "../../components/Skeleton.jsx";

const PAGE_SIZE = 10;
const ADMIN_FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
const PRODUCT_CATEGORIES = [
  "Sức khỏe",
  "Dinh dưỡng",
  "Vệ sinh cá nhân",
  "Theo dõi & kiểm tra",
  "Tiện ích",
  "Chăm sóc da",
  "Quà tặng",
];

const emptyProductForm = {
  productName: "",
  thumbnail: "",
  category: "",
  price: "",
  quantity: "",
  description: "",
};

const emptyBoxForm = {
  boxName: "",
  thumbnail: "",
  price: "",
  quantity: "",
  description: "",
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Đang cập nhật";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const getPagination = (pagination, page) => ({
  page,
  totalPages: pagination?.totalPages || 1,
  totalItems: pagination?.totalItems || pagination?.total || 0,
});

const getProductRefId = (item) => {
  const ref = item?.productId || item?.id;
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  return String(ref.id || ref._id || ref);
};

function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [productCategories, setProductCategories] = useState(PRODUCT_CATEGORIES);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBox, setEditingBox] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [boxForm, setBoxForm] = useState(emptyBoxForm);
  const [productImageFile, setProductImageFile] = useState(null);
  const [boxImageFile, setBoxImageFile] = useState(null);
  const [boxProducts, setBoxProducts] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBoxTab = activeTab === "boxes";
  const rows = isBoxTab ? boxes : products;
  const productModalTitle = editingProduct
    ? "Cập nhật sản phẩm"
    : "Tạo mới sản phẩm";
  const boxModalTitle = editingBox ? "Cập nhật box" : "Tạo mới box";

  const selectedBoxProducts = useMemo(
    () =>
      Object.entries(boxProducts)
        .filter(([, value]) => value.selected)
        .map(([productId, value]) => ({
          productId,
          quantity: Number(value.quantity) || 1,
          isCustomizable: value.isCustomizable === true,
        })),
    [boxProducts],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchProductOptions = async () => {
    const result = await adminApi.getSingleProducts({ page: 1, limit: 50 });
    setProductOptions(result.products || []);
  };

  const fetchProductCategories = async () => {
    const categories = await adminApi.getProductCategories();
    setProductCategories(categories?.length ? categories : PRODUCT_CATEGORIES);
  };

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const params = { page, limit: PAGE_SIZE, search: debouncedSearch };
        const result = isBoxTab
          ? await adminApi.getBoxes(params)
          : await adminApi.getSingleProducts(params);

        if (!isActive) return;

        if (isBoxTab) setBoxes(result.boxes || []);
        else setProducts(result.products || []);
        setPagination(getPagination(result.pagination, page));
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [activeTab, debouncedSearch, isBoxTab, page]);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      adminApi.getSingleProducts({ page: 1, limit: 50 }),
      adminApi.getProductCategories(),
    ])
      .then(([productResult, categories]) => {
        if (!isActive) return;
        setProductOptions(productResult.products || []);
        setProductCategories(categories?.length ? categories : PRODUCT_CATEGORIES);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  const refreshCurrentTab = async () => {
    const params = { page, limit: PAGE_SIZE, search: debouncedSearch };
    const result = isBoxTab
      ? await adminApi.getBoxes(params)
      : await adminApi.getSingleProducts(params);

    if (isBoxTab) setBoxes(result.boxes || []);
    else setProducts(result.products || []);
    setPagination(getPagination(result.pagination, page));
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setProductImageFile(null);
  };

  const closeBoxModal = () => {
    setIsBoxModalOpen(false);
    setEditingBox(null);
    setBoxForm(emptyBoxForm);
    setBoxImageFile(null);
    setBoxProducts({});
  };

  const handleProductFieldChange = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const handleBoxFieldChange = (field, value) => {
    setBoxForm((current) => ({ ...current, [field]: value }));
  };

  const handleToggleBoxProduct = (productId, checked) => {
    setBoxProducts((current) => ({
      ...current,
      [productId]: {
        selected: checked,
        quantity: current[productId]?.quantity || 1,
        isCustomizable: current[productId]?.isCustomizable === true,
      },
    }));
  };

  const handleBoxProductQuantity = (productId, quantity) => {
    setBoxProducts((current) => ({
      ...current,
      [productId]: {
        selected: current[productId]?.selected || false,
        quantity,
        isCustomizable: current[productId]?.isCustomizable === true,
      },
    }));
  };

  const handleBoxProductMode = (productId, isCustomizable) => {
    setBoxProducts((current) => ({
      ...current,
      [productId]: {
        selected: current[productId]?.selected || false,
        quantity: current[productId]?.quantity || 1,
        isCustomizable,
      },
    }));
  };

  const uploadThumbnailIfNeeded = async (file, currentUrl, type) => {
    if (!file) return currentUrl;
    const uploadedImage = await cloudinaryApi.uploadImage(file, type);
    return uploadedImage.url;
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const thumbnail = await uploadThumbnailIfNeeded(
        productImageFile,
        productForm.thumbnail,
        "product",
      );
      if (!thumbnail) {
        toast.error("Vui lòng chọn hình ảnh sản phẩm");
        return;
      }

      const payload = {
        productName: productForm.productName,
        thumbnail,
        category: productForm.category,
        price: productForm.price === "" ? null : Number(productForm.price),
        quantity: Number(productForm.quantity),
        description: productForm.description,
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await adminApi.createProduct(payload);
        toast.success("Đã tạo sản phẩm");
      }

      closeProductModal();
      await Promise.all([
        refreshCurrentTab(),
        fetchProductOptions(),
        fetchProductCategories(),
      ]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBox = async (event) => {
    event.preventDefault();

    if (selectedBoxProducts.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm cho box");
      return;
    }

    setIsSubmitting(true);

    try {
      const thumbnail = await uploadThumbnailIfNeeded(
        boxImageFile,
        boxForm.thumbnail,
        "box",
      );
      if (!thumbnail) {
        toast.error("Vui lòng chọn hình ảnh box");
        return;
      }

      const payload = {
        boxName: boxForm.boxName,
        thumbnail,
        price: Number(boxForm.price),
        quantity: Number(boxForm.quantity),
        description: boxForm.description,
        products: selectedBoxProducts,
      };

      if (editingBox) {
        await adminApi.updateBox(editingBox.id, payload);
        toast.success("Đã cập nhật box");
      } else {
        await adminApi.createBox(payload);
        toast.success("Đã tạo box");
      }

      closeBoxModal();
      await refreshCurrentTab();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    if (isBoxTab) {
      closeProductModal();
      setEditingBox(null);
      setBoxForm(emptyBoxForm);
      setBoxImageFile(null);
      setBoxProducts({});
      setIsBoxModalOpen(true);
    } else {
      closeBoxModal();
      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setProductImageFile(null);
      setIsProductModalOpen(true);
    }
  };

  const openProductUpdateModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      productName: product.productName || "",
      thumbnail: product.thumbnail || "",
      category: product.category || "",
      price: product.price ?? "",
      quantity: product.quantity ?? "",
      description: product.description || "",
    });
    setProductImageFile(null);
    setIsProductModalOpen(true);
  };

  const openBoxUpdateModal = (box) => {
    const currentProducts = {};
    (box.products || []).forEach((item) => {
      const productId = getProductRefId(item);
      if (productId) {
        currentProducts[productId] = {
          selected: true,
          quantity: item.quantity || 1,
          isCustomizable: item.isCustomizable === true,
        };
      }
    });

    setEditingBox(box);
    setBoxForm({
      boxName: box.boxName || box.productName || "",
      thumbnail: box.thumbnail || "",
      price: box.price ?? "",
      quantity: box.quantity ?? "",
      description: box.description || "",
    });
    setBoxImageFile(null);
    setBoxProducts(currentProducts);
    setIsBoxModalOpen(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
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
              Quản lý sản phẩm
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Quản lý sản phẩm lẻ và box trong Marketplace.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 text-sm font-bold text-white transition hover:bg-pink-600"
          >
            <Plus size={16} />
            Tạo mới
          </button>
        </div>

        <div className="mb-4 flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => handleTabChange("products")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
              activeTab === "products"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Sản phẩm lẻ
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("boxes")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
              activeTab === "boxes"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Hộp quà
          </button>
        </div>

        <div className="mb-3 flex flex-col gap-3 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
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
              placeholder={
                isBoxTab ? "Tìm kiếm box..." : "Tìm kiếm sản phẩm..."
              }
            />
          </div>
          <span className="text-sm font-semibold text-slate-500">
            Tổng:{" "}
            <strong className="text-slate-800">{pagination.totalItems}</strong>
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-100 bg-white">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead className="bg-white text-xs font-bold uppercase tracking-wide text-slate-400">
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4">Mã</th>
                <th className="px-5 py-4">
                  {isBoxTab ? "Tên box" : "Tên sản phẩm"}
                </th>
                <th className="px-5 py-4">Danh mục</th>
                <th className="px-5 py-4">Mô tả</th>
                <th className="px-5 py-4">Giá</th>
                <th className="px-5 py-4">Số lượng</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    className="px-5 py-6"
                    colSpan={8}
                  >
                    <TableSkeleton columns={8} rows={6} />
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center font-semibold text-red-500"
                    colSpan={8}
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center font-semibold text-slate-400"
                    colSpan={8}
                  >
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                rows.map((item, index) => (
                  <tr key={item.id} className="transition hover:bg-pink-50/30">
                    <td className="px-5 py-4 text-sm font-bold text-slate-700">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={item.thumbnail}
                            alt={item.productName}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-pink-50 text-pink-400">
                            {isBoxTab ? (
                              <Box size={18} />
                            ) : (
                              <PackageSearch size={18} />
                            )}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.productName}
                          </p>
                          {isBoxTab && (
                            <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-400">
                              {(item.products || [])
                                .map((product) => product.productName)
                                .filter(Boolean)
                                .join(", ") || "Chưa chọn sản phẩm"}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {isBoxTab
                        ? (item.productCategories || []).join(", ") ||
                          item.category ||
                          "Tự động"
                        : item.category || "Chưa phân loại"}
                    </td>
                    <td className="max-w-[240px] px-5 py-4 text-sm text-slate-500">
                      <span className="line-clamp-2">
                        {item.description || "--"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-bold ${
                          Number(item.quantity) > 0
                            ? "bg-blue-50 text-blue-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {Number(item.quantity) > 0
                          ? "Đang hoạt động"
                          : "Ngừng theo dõi"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          isBoxTab
                            ? openBoxUpdateModal(item)
                            : openProductUpdateModal(item)
                        }
                        className="inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-200 px-3 py-2 text-xs font-bold leading-tight text-slate-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-500"
                      >
                        <Pencil size={15} />
                        {isBoxTab ? "Chi tiết box" : "Chi tiết sản phẩm"}
                      </button>
                    </td>
                  </tr>
                ))
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

      {isProductModalOpen && (
        <AdminModal title={productModalTitle} onClose={closeProductModal}>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <FormInput
              label="Tên sản phẩm"
              required
              value={productForm.productName}
              onChange={(value) =>
                handleProductFieldChange("productName", value)
              }
            />
            <ImageUploadField
              label="Hình ảnh sản phẩm"
              currentUrl={productForm.thumbnail}
              file={productImageFile}
              required={!editingProduct}
              onChange={setProductImageFile}
            />
            <FormSelect
              label="Danh mục"
              options={productCategories}
              required
              value={productForm.category}
              onChange={(value) => handleProductFieldChange("category", value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Giá"
                type="number"
                min="0"
                value={productForm.price}
                onChange={(value) => handleProductFieldChange("price", value)}
              />
              <FormInput
                label="Số lượng"
                type="number"
                min="0"
                required
                value={productForm.quantity}
                onChange={(value) =>
                  handleProductFieldChange("quantity", value)
                }
              />
            </div>
            <FormTextarea
              label="Ghi chú"
              value={productForm.description}
              onChange={(value) =>
                handleProductFieldChange("description", value)
              }
            />
            <ModalActions
              isSubmitting={isSubmitting}
              onCancel={closeProductModal}
              submitLabel={editingProduct ? "Cập nhật" : "Xác nhận"}
            />
          </form>
        </AdminModal>
      )}

      {isBoxModalOpen && (
        <AdminModal title={boxModalTitle} onClose={closeBoxModal}>
          <form onSubmit={handleSaveBox} className="space-y-4">
            <FormInput
              label="Tên box"
              required
              value={boxForm.boxName}
              onChange={(value) => handleBoxFieldChange("boxName", value)}
            />
            <ImageUploadField
              label="Hình ảnh box"
              currentUrl={boxForm.thumbnail}
              file={boxImageFile}
              required={!editingBox}
              onChange={setBoxImageFile}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Giá"
                type="number"
                min="0"
                required
                value={boxForm.price}
                onChange={(value) => handleBoxFieldChange("price", value)}
              />
              <FormInput
                label="Số lượng box"
                type="number"
                min="0"
                required
                value={boxForm.quantity}
                onChange={(value) => handleBoxFieldChange("quantity", value)}
              />
            </div>
            <FormTextarea
              label="Ghi chú"
              value={boxForm.description}
              onChange={(value) => handleBoxFieldChange("description", value)}
            />

            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">
                Sản phẩm trong box *
              </p>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
                {productOptions.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm font-semibold text-slate-400">
                    Chưa có sản phẩm lẻ để chọn.
                  </p>
                ) : (
                  productOptions.map((product) => {
                    const item = boxProducts[product.id] || {
                      selected: false,
                      quantity: 1,
                    };
                    return (
                      <label
                        key={product.id}
                        className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={(event) =>
                            handleToggleBoxProduct(
                              product.id,
                              event.target.checked,
                            )
                          }
                          className="h-4 w-4 rounded border-slate-300 text-pink-500 focus:ring-pink-400"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-800">
                            {product.productName}
                          </span>
                          <span className="block truncate text-xs font-medium text-slate-400">
                            {product.category || "Chưa phân loại"}
                          </span>
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          disabled={!item.selected}
                          onChange={(event) =>
                            handleBoxProductQuantity(
                              product.id,
                              event.target.value,
                            )
                          }
                          className="h-9 w-20 rounded-md border border-slate-200 px-2 text-sm font-semibold text-slate-700 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        />
                        <select
                          value={item.isCustomizable ? "customizable" : "fixed"}
                          disabled={!item.selected}
                          onChange={(event) =>
                            handleBoxProductMode(
                              product.id,
                              event.target.value === "customizable",
                            )
                          }
                          aria-label={`Loại sản phẩm ${product.productName}`}
                          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="fixed">Cố định</option>
                          <option value="customizable">Thay đổi</option>
                        </select>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <ModalActions
              isSubmitting={isSubmitting}
              onCancel={closeBoxModal}
              submitLabel={editingBox ? "Cập nhật" : "Xác nhận"}
            />
          </form>
        </AdminModal>
      )}
    </main>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-pink-500"> *</span>}
      </span>
      <input
        type={type}
        min={min}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
      />
    </label>
  );
}

function FormSelect({ label, options, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-pink-500"> *</span>}
      </span>
      <select
        className="h-11 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      >
        <option value="">Chọn danh mục</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ImageUploadField({
  label,
  currentUrl,
  file,
  onChange,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-pink-500"> *</span>}
      </span>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
        {currentUrl ? (
          <img
            className="h-14 w-14 rounded-md object-cover"
            src={currentUrl}
            alt={label}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-pink-50 text-pink-400">
            <Image size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <input
            type="file"
            accept="image/*"
            required={required && !currentUrl}
            onChange={(event) => onChange(event.target.files?.[0] || null)}
            className="block w-full text-sm font-semibold text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-pink-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-pink-500 hover:file:bg-pink-100"
          />
          <p className="mt-1 truncate text-xs font-medium text-slate-400">
            {file
              ? file.name
              : "Chọn ảnh từ máy bạn, hệ thống sẽ xử lý tự động"}
          </p>
        </div>
      </div>
    </label>
  );
}

function FormTextarea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
      />
    </label>
  );
}

function AdminModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/30 px-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between bg-pink-500 px-5 py-4 text-white">
          <h2 className="text-base font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-md p-1 transition hover:bg-white/15"
          >
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[calc(90vh-64px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalActions({ isSubmitting, onCancel, submitLabel = "Xác nhận" }) {
  return (
    <div className="-mx-5 -mb-5 mt-5 flex items-center justify-between bg-slate-50 px-5 py-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md bg-slate-400 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-500"
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Đang lưu..." : submitLabel}
      </button>
    </div>
  );
}

export default AdminProductsPage;
