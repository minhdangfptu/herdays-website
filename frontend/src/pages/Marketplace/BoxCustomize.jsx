import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { cartApi, getCartBoxQuantities, hasAuthSession, marketplaceApi, profileApi } from '../../services/apiService.js'
import { isBoxCompatibleWithTarget } from '../../utils/boxTarget.js'
import { flyToCart, getCartTargetElement, getFlyToCartSourceRect } from '../../utils/flyToCart.js'
import './BoxCustomize.scss'

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)

const getProductImage = (product) =>
  product.thumbnail || `https://placehold.co/280x280/f8c4d8/ffffff?text=${encodeURIComponent(product.productName || 'HerDays')}`

const getBoxName = (box) => box?.boxName || 'HerDays Box của bạn'

const getBoxImage = (box) =>
  box?.thumbnail || `https://placehold.co/360x360/f8c4d8/ffffff?text=${encodeURIComponent(getBoxName(box))}`

const isProductInStock = (product) => Number(product?.quantity) > 0

const normalizeBoxProduct = (item) => ({
  id: String(item.productId),
  productName: item.productName || 'Sản phẩm trong box',
  category: item.category || 'Trong box',
  thumbnail: item.thumbnail,
  quantity: item.quantity || 1
})

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

export default function BoxCustomize() {
  const { boxId } = useParams()
  const navigate = useNavigate()
  const [box, setBox] = useState(null)
  const [boxes, setBoxes] = useState([])
  const [products, setProducts] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [cartBoxQuantities, setCartBoxQuantities] = useState({})
  const [targetStatus, setTargetStatus] = useState('')
  const checkoutButtonRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const loadCustomizeData = async () => {
      setLoading(true)
      setErrorMessage('')

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
        ])

        if (!isMounted) return

        const nextProducts = productList
        const availableProductIds = new Set(
          nextProducts
            .filter(isProductInStock)
            .map((product) => String(product.id))
        )
        const initialProducts = (boxResult?.products || [])
          .map(normalizeBoxProduct)
          .filter((product) => availableProductIds.has(product.id))

        const nextTargetStatus = profileResult?.targetStatus || ''
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
        setSelectedItems(initialProducts)
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || 'Không thể tải dữ liệu tùy chỉnh box.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadCustomizeData()

    return () => {
      isMounted = false
    }
  }, [boxId])

  const groupedProducts = useMemo(() => (
    products.reduce((acc, product) => {
      const category = product.category || 'Sản phẩm khác'
      if (!acc[category]) acc[category] = []
      acc[category].push(product)
      return acc
    }, {})
  ), [products])

  const categoryLimits = useMemo(() => (
    (box?.products || []).reduce((limits, item) => {
      const product = normalizeBoxProduct(item)
      limits[product.category] = (limits[product.category] || 0) + product.quantity
      return limits
    }, {})
  ), [box])

  const requiredCategories = useMemo(() => Object.keys(categoryLimits), [categoryLimits])

  const customizableProductGroups = useMemo(() => (
    Object.entries(groupedProducts).filter(([category]) => requiredCategories.includes(category))
  ), [groupedProducts, requiredCategories])

  const selectedCategoryTotals = useMemo(() => (
    selectedItems.reduce((totals, item) => {
      totals[item.category] = (totals[item.category] || 0) + item.quantity
      return totals
    }, {})
  ), [selectedItems])

  const incompleteCategories = useMemo(() => (
    requiredCategories.filter((category) => (
      (selectedCategoryTotals[category] || 0) !== categoryLimits[category]
    ))
  ), [categoryLimits, requiredCategories, selectedCategoryTotals])

  const isSelectionComplete = requiredCategories.length > 0 && incompleteCategories.length === 0

  const selectedProductCount = useMemo(() => (
    selectedItems.reduce((total, item) => total + item.quantity, 0)
  ), [selectedItems])

  const updateProductQuantity = (product, change) => {
    const productId = String(product.id)
    const category = product.category || 'Sản phẩm khác'
    const currentItem = selectedItems.find((item) => item.id === productId)
    const currentQuantity = currentItem?.quantity || 0

    if (change > 0 && !isProductInStock(product)) {
      toast.error('Sản phẩm này đã hết hàng.')
      return
    }

    if (change > 0 && (selectedCategoryTotals[category] || 0) >= (categoryLimits[category] || 0)) {
      toast.error(`Danh mục ${category} đã đủ ${categoryLimits[category]} sản phẩm.`)
      return
    }

    if (change > 0 && currentQuantity >= Number(product.quantity)) {
      toast.error('Số lượng chọn đã đạt tồn kho của sản phẩm này.')
      return
    }

    const nextQuantity = currentQuantity + change
    setSelectedItems((current) => {
      if (nextQuantity <= 0) return current.filter((item) => item.id !== productId)
      if (currentItem) {
        return current.map((item) => (
          item.id === productId ? { ...item, quantity: nextQuantity } : item
        ))
      }

      return [...current, {
        id: productId,
        productName: product.productName,
        category,
        thumbnail: product.thumbnail,
        quantity: 1
      }]
    })
  }

  const availableBoxQuantity = box
    ? Math.max((Number(box.quantity) || 0) - (cartBoxQuantities[String(box.id)] || 0), 0)
    : 0

  const handleBuyNow = async () => {
    if (!box?.id) {
      toast.error('Vui lòng chọn một box trước khi mua.')
      return
    }

    if (!isBoxCompatibleWithTarget(box, targetStatus)) {
      toast.error('Bạn chỉ có thể tùy chỉnh box phù hợp với mục tiêu của mình.')
      return
    }

    if (availableBoxQuantity <= 0) {
      toast.error('Box này đã hết hàng.')
      return
    }

    if (!isSelectionComplete) {
      const missingText = incompleteCategories.length > 0
        ? `: ${incompleteCategories.join(', ')}`
        : ''
      toast.error(`Vui lòng chọn đúng số lượng sản phẩm cho mỗi danh mục${missingText}.`)
      return
    }

    if (!hasAuthSession()) {
      toast.error('Vui lòng đăng nhập để thêm box vào giỏ hàng.')
      navigate('/login')
      return
    }

    setIsAdding(true)
    const flySourceRect = getFlyToCartSourceRect(checkoutButtonRef.current)

    try {
      const cart = await cartApi.addItem({ boxId: box.id, quantity: 1 })
      const flyAnimation = flyToCart({
        sourceRect: flySourceRect,
        targetElement: getCartTargetElement(),
        imageUrl: getBoxImage(box),
        label: getBoxName(box)
      })
      setCartBoxQuantities(getCartBoxQuantities(cart))
      await flyAnimation
      toast.success('Đã thêm box vào giỏ hàng.')
      navigate('/check-out')
    } catch (error) {
      toast.error(error.message || 'Không thể thêm box vào giỏ hàng.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="box-customize-page">
      <div className="box-customize-container">
        <div className="box-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <MdKeyboardArrowRight />
          <Link to="/marketplace">Cửa hàng</Link>
          <MdKeyboardArrowRight />
          <span className="box-breadcrumb-active">{box?.boxName || 'HerDays Box của bạn'}</span>
        </div>

        <div className="box-header">
          <h1 className="box-title">{box?.boxName || 'HerDays Box của bạn'}</h1>
          <p className="box-subtitle">
            {box?.description || 'Chọn sản phẩm từ marketplace để xem cấu hình box cá nhân hóa.'}
          </p>
          <label className="box-picker">
            <span>Chọn box muốn tùy chỉnh</span>
            <select
              value={boxId || ''}
              onChange={(event) => {
                const nextBoxId = event.target.value
                if (nextBoxId) navigate(`/box-customize/${nextBoxId}`)
              }}
            >
              <option value="">-- Chọn một box --</option>
              {boxes.map((boxOption) => (
                <option key={boxOption.id} value={boxOption.id}>
                  {boxOption.boxName}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && <p className="box-customize-status">Đang tải sản phẩm...</p>}
        {errorMessage && <p className="box-customize-status box-customize-status--error">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <div className="box-selection-card">
            <div className="selection-card-body">
              {!box ? (
                <p className="box-customize-status">Vui lòng chọn một box để bắt đầu tùy chỉnh.</p>
              ) : customizableProductGroups.length === 0 ? (
                <p className="box-customize-status">Box này chưa có danh mục sản phẩm để tùy chỉnh.</p>
              ) : (
                customizableProductGroups.map(([category, categoryProducts]) => (
                  <div key={category} className="category-section">
                    <div className="category-divider">
                      <span>{category}</span>
                      <strong>
                        Đã chọn {selectedCategoryTotals[category] || 0}/{categoryLimits[category]}
                      </strong>
                    </div>

                    <div className="product-grid">
                      {categoryProducts.map((product) => {
                        const selectedQuantity = selectedItems.find(
                          (item) => item.id === String(product.id)
                        )?.quantity || 0
                        const isSelected = selectedQuantity > 0
                        const isOutOfStock = !isProductInStock(product)
                        const isCategoryFull = (selectedCategoryTotals[category] || 0) >= categoryLimits[category]
                        return (
                          <article
                            key={product.id}
                            className={`product-card ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'is-out-of-stock' : ''}`}
                          >
                            <div className="product-image">
                              <img src={getProductImage(product)} alt={product.productName} />
                            </div>
                            <div className="product-info">
                              <h3 className="product-name">{product.productName}</h3>
                              <p className="product-description">
                                {product.description || 'Chưa có mô tả sản phẩm.'}
                              </p>
                              <div className="product-meta">
                                <span className="product-tag">{product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng'}</span>
                                <div className="product-quantity-selector" aria-label={`Số lượng ${product.productName}`}>
                                  <button
                                    type="button"
                                    disabled={selectedQuantity <= 0}
                                    onClick={() => updateProductQuantity(product, -1)}
                                    aria-label={`Giảm ${product.productName}`}
                                  >
                                    −
                                  </button>
                                  <strong>{selectedQuantity}</strong>
                                  <button
                                    type="button"
                                    disabled={isOutOfStock || isCategoryFull || selectedQuantity >= Number(product.quantity)}
                                    onClick={() => updateProductQuantity(product, 1)}
                                    aria-label={`Tăng ${product.productName}`}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="sticky-bottom-bar">
        <div className="bar-content">
          <div className="bar-left">
            <span className="bar-title">{box?.boxName || 'Box cá nhân hóa'}</span>
            <span className="bar-price">{formatCurrency(box?.price || 0)}</span>
          </div>

          <div className="bar-right">
            <span className="bar-count">Đã chọn {selectedProductCount} sản phẩm</span>
            {!isSelectionComplete && (
              <span className="bar-required">Còn {incompleteCategories.length} danh mục chưa đủ</span>
            )}
            <span className="bar-stock">{availableBoxQuantity > 0 ? `Còn ${availableBoxQuantity}` : 'Hết hàng'}</span>
            <button
              ref={checkoutButtonRef}
              className="bar-checkout-btn"
              type="button"
              disabled={isAdding || !box?.id || availableBoxQuantity <= 0 || !isSelectionComplete}
              onClick={handleBuyNow}
            >
              {isAdding ? 'Đang thêm...' : 'Mua ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
