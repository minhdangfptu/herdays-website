import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { cartApi, getCartBoxQuantities, hasAuthSession, marketplaceApi } from '../../services/apiService.js'
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

const normalizeBoxProduct = (item) => ({
  id: String(item.productId),
  productName: item.productName || 'Sản phẩm trong box',
  category: item.category || 'Trong box',
  thumbnail: item.thumbnail,
  quantity: item.quantity || 1
})

export default function BoxCustomize() {
  const { boxId } = useParams()
  const navigate = useNavigate()
  const [box, setBox] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [cartBoxQuantities, setCartBoxQuantities] = useState({})
  const checkoutButtonRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const loadCustomizeData = async () => {
      setLoading(true)
      setErrorMessage('')

      try {
        const [productResult, boxResult, cartResult] = await Promise.all([
          marketplaceApi.listProducts({ limit: 100 }),
          boxId ? marketplaceApi.getBox(boxId) : Promise.resolve(null),
          hasAuthSession()
            ? cartApi.getCart().catch(() => null)
            : Promise.resolve(null)
        ])

        if (!isMounted) return

        const nextProducts = productResult.items || []
        const initialProducts = (boxResult?.products || []).map(normalizeBoxProduct)

        setProducts(nextProducts)
        setBox(boxResult)
        setSelectedItems(initialProducts)
        setCartBoxQuantities(getCartBoxQuantities(cartResult))
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

  const toggleProduct = (product) => {
    const productId = String(product.id)
    const isSelected = selectedItems.some((item) => item.id === productId)

    if (isSelected) {
      setSelectedItems((current) => current.filter((item) => item.id !== productId))
      return
    }

    setSelectedItems((current) => [
      ...current,
      {
        id: productId,
        productName: product.productName,
        category: product.category,
        thumbnail: product.thumbnail,
        quantity: 1
      }
    ])
  }

  const availableBoxQuantity = box
    ? Math.max((Number(box.quantity) || 0) - (cartBoxQuantities[String(box.id)] || 0), 0)
    : 0

  const handleBuyNow = async () => {
    if (!box?.id) {
      toast.error('Vui lòng chọn một box trước khi mua.')
      return
    }

    if (availableBoxQuantity <= 0) {
      toast.error('Box này đã hết hàng.')
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
        </div>

        {loading && <p className="box-customize-status">Đang tải sản phẩm...</p>}
        {errorMessage && <p className="box-customize-status box-customize-status--error">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <div className="box-selection-card">
            <div className="selection-card-body">
              {Object.keys(groupedProducts).length === 0 ? (
                <p className="box-customize-status">Chưa có sản phẩm nào để tùy chỉnh box.</p>
              ) : (
                Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                  <div key={category} className="category-section">
                    <div className="category-divider">
                      <span>{category}</span>
                    </div>

                    <div className="product-grid">
                      {categoryProducts.map((product) => {
                        const isSelected = selectedItems.some((item) => item.id === String(product.id))
                        return (
                          <button
                            key={product.id}
                            type="button"
                            className={`product-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleProduct(product)}
                          >
                            <div className="product-image">
                              <img src={getProductImage(product)} alt={product.productName} />
                            </div>
                            <div className="product-info">
                              <h3 className="product-name">{product.productName}</h3>
                              <div className="product-meta">
                                <span className="product-tag">{product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng'}</span>
                              </div>
                            </div>
                          </button>
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
            <span className="bar-count">Đã chọn {selectedItems.length} sản phẩm</span>
            <span className="bar-stock">{availableBoxQuantity > 0 ? `Còn ${availableBoxQuantity}` : 'Hết hàng'}</span>
            <button
              ref={checkoutButtonRef}
              className="bar-checkout-btn"
              type="button"
              disabled={isAdding || !box?.id || availableBoxQuantity <= 0}
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
