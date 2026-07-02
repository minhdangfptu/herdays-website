import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, PackageSearch, Search } from 'lucide-react';

import { adminApi } from '../../services/apiService.js';

const PAGE_SIZE = 10;
const ADMIN_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

const formatCurrency = (value) => (
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
);

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isActive = true;

    const fetchProducts = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await adminApi.getProducts({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch,
        });

        if (!isActive) return;
        setProducts(result.products || []);
        setPagination(result.pagination || { page, totalPages: 1, totalItems: 0 });
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, page]);

  return (
    <main className="min-h-screen bg-white px-5 py-6 sm:px-8" style={{ fontFamily: ADMIN_FONT_FAMILY }}>
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-400">Marketplace</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Quản lý sản phẩm</h1>
            <p className="mt-2 text-sm text-slate-500">
              Danh sách sản phẩm và combo box từ backend.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Giá</th>
                <th className="px-6 py-4">Tồn kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-10 text-center font-semibold text-slate-400" colSpan={5}>Đang tải sản phẩm...</td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td className="px-6 py-10 text-center font-semibold text-red-500" colSpan={5}>{errorMessage}</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center font-semibold text-slate-400" colSpan={5}>Không có sản phẩm phù hợp.</td>
                </tr>
              ) : products.map((product) => (
                <tr key={`${product.type}-${product.id}`} className="transition hover:bg-pink-50/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.thumbnail ? (
                        <img className="h-12 w-12 rounded-lg object-cover" src={product.thumbnail} alt={product.productName} />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-50 text-pink-400">
                          <PackageSearch size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{product.productName}</p>
                        <p className="line-clamp-1 text-sm text-slate-500">{product.description || 'Chưa có mô tả'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold capitalize text-slate-600">{product.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{product.category || 'Chưa phân loại'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>
            Tổng: <strong className="text-slate-800">{pagination.totalItems || 0}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              disabled={isLoading || page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {page} / {pagination.totalPages || 1}
            </span>
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
        </div>
      </section>
    </main>
  );
}

export default AdminProductsPage;
