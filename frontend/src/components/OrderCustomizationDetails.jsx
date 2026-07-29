import { CheckCircle2, Settings2 } from 'lucide-react';

const selectionGroupLabels = {
  'box-dau-bvs-ngay': 'Băng vệ sinh ngày',
  'box-dau-bvs-dem': 'Băng vệ sinh đêm',
  'box-dau-thuc-pham-chuc-nang': 'Thực phẩm chức năng',
  'box-mam-que-thu-rung-trung': 'Que thử rụng trứng',
  'box-mam-ddvs-mini': 'Dung dịch vệ sinh mini',
  'box-mam-thuc-pham-chuc-nang': 'Thực phẩm chức năng',
  'box-bau-ddvs-mini': 'Dung dịch vệ sinh mini',
  'box-bau-sua-khong-duong': 'Sữa không đường',
  'box-bau-thuc-pham-chuc-nang': 'Thực phẩm chức năng'
};

const getSelectionGroupLabel = (selectionGroup) => (
  selectionGroupLabels[selectionGroup] || selectionGroup || 'Lựa chọn cố định'
);

const formatQuantity = (quantity, unit) => (
  `${quantity}${unit ? ` ${unit}` : ''}`
);

export default function OrderCustomizationDetails({ item, compact = false }) {
  if (!item?.isBox) return null;

  const customizedProducts = Array.isArray(item.customizedProducts)
    ? item.customizedProducts
    : [];
  const boxProducts = Array.isArray(item.boxProducts) && item.boxProducts.length > 0
    ? item.boxProducts
    : customizedProducts.map((product) => ({
      ...product,
      isSelected: true,
      isCustomizable: product.isCustomizable === true
    }));
  const hasQuantityCustomization = item.hasCustomization
    || customizedProducts.some((product) => product.isQuantityChanged);
  const hasFixedSelection = item.hasFixedSelection
    || customizedProducts.some((product) => product.selectionGroup);
  const hasConfiguration = hasQuantityCustomization || hasFixedSelection;

  return (
    <div className={`rounded-xl border ${compact ? 'p-3' : 'p-4'} ${hasConfiguration ? 'border-pink-100 bg-pink-50/50' : 'border-slate-100 bg-slate-50'}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#ed77a5] shadow-sm">
          <Settings2 size={17} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-extrabold text-slate-800">Cấu hình box</p>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${hasConfiguration ? 'bg-pink-100 text-pink-700' : 'bg-slate-200 text-slate-600'}`}>
              {hasQuantityCustomization
                ? 'Có tuỳ chỉnh số lượng'
                : hasFixedSelection
                  ? 'Đã chọn cấu hình cố định'
                  : 'Không tuỳ chỉnh'}
            </span>
          </div>

          <p className="mt-3 text-xs font-extrabold text-slate-600">
            Sản phẩm trong box ({boxProducts.length})
          </p>
          {boxProducts.length > 0 ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {boxProducts.map((product, index) => {
                const isFixedSelection = Boolean(product.selectionGroup);
                const isSelected = product.isSelected !== false;
                const label = isFixedSelection
                  ? isSelected
                    ? `Đã chọn · ${getSelectionGroupLabel(product.selectionGroup)}`
                    : `Lựa chọn thay thế · ${getSelectionGroupLabel(product.selectionGroup)}`
                  : product.isCustomizable
                    ? product.isQuantityChanged
                      ? 'Sản phẩm thay đổi · Đã tăng số lượng'
                      : 'Sản phẩm thay đổi'
                    : 'Luôn có sẵn trong box';

                return (
                  <div
                    key={`${product.productId || product.productName || 'product'}-${index}`}
                    className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${isSelected ? 'border-pink-100 bg-white' : 'border-slate-100 bg-slate-50 opacity-70'}`}
                  >
                    {product.thumbnail ? (
                      <img
                        className="h-9 w-9 shrink-0 rounded-md border border-slate-100 object-cover"
                        src={product.thumbnail}
                        alt=""
                      />
                    ) : (
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#ed77a5]" size={15} aria-hidden="true" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-slate-700">
                        {product.productName || 'Sản phẩm trong box'}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                        {label} · {formatQuantity(product.quantity, product.unit)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Không thể tải danh sách sản phẩm của box.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
