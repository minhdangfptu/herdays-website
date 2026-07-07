import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiMinus, FiPlus, FiStar } from 'react-icons/fi'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { cartApi, getCartBoxQuantities, hasAuthSession, marketplaceApi } from '../../services/apiService.js'
import { flyToCart, getCartTargetElement, getFlyToCartSourceRect } from '../../utils/flyToCart.js'
import './ProductDetailPage.scss'

const SUBSCRIPTIONS = ['1 thang', '3 thang', '6 thang', '12 thang']

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)

const getItemName = (item) => item?.boxName || item?.productName || item?.name || 'HerDays item'

const getItemImage = (item) =>
  item?.thumbnail || `https://placehold.co/520x520/f8c4d8/ffffff?text=${encodeURIComponent(getItemName(item))}`

export default function ProductDetailPage() {
  const { type, itemId, productId } = useParams()
  const navigate = useNavigate()
  const resolvedId = itemId || productId
  const [selectedSubscription, setSelectedSubscription] = useState(SUBSCRIPTIONS[2])
  const [quantity, setQuantity] = useState(1)
  const [item, setItem] = useState(null)
  const [itemType, setItemType] = useState(type || '')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [cartBoxQuantities, setCartBoxQuantities] = useState({})
  const productImageRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const loadDetail = async () => {
      setLoading(true)
      setErrorMessage('')

      try {
        let result
        let nextType = type

        if (type === 'product') {
          result = await marketplaceApi.getProduct(resolvedId)
        } else if (type === 'box') {
          result = await marketplaceApi.getBox(resolvedId)
        } else {
          try {
            result = await marketplaceApi.getBox(resolvedId)
            nextType = 'box'
          } catch {
            result = await marketplaceApi.getProduct(resolvedId)
            nextType = 'product'
          }
        }

        const cartResult = hasAuthSession()
          ? await cartApi.getCart().catch(() => null)
          : null

        if (!isMounted) return
        setItem(result)
        setItemType(nextType || result?.type || '')
        setCartBoxQuantities(getCartBoxQuantities(cartResult))
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || 'Khong the tai chi tiet san pham.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (resolvedId) loadDetail()

    return () => {
      isMounted = false
    }
  }, [resolvedId, type])

  const relatedProducts = useMemo(() => (
    (item?.products || []).map((product) => ({
      id: product.productId,
      name: product.productName || 'San pham trong box',
      subtitle: product.category || item?.category || 'HerDays',
      image: product.thumbnail,
      price: product.price,
      quantity: product.quantity || 1
    }))
  ), [item])

  const updateQuantity = (newQuantity) => {
    if (newQuantity < 1) return
    if (itemType === 'box') {
      const currentCartQuantity = cartBoxQuantities[String(item?.id)] || 0
      const availableQuantity = Math.max((Number(item?.quantity) || 0) - currentCartQuantity, 0)
      if (newQuantity > availableQuantity) return
    }
    setQuantity(newQuantity)
  }

  const handleAddToCart = async () => {
    if (itemType !== 'box') {
      toast.error('Gio hang hien chi ho tro them box.')
      return
    }

    if (!hasAuthSession()) {
      toast.error('Vui long dang nhap de them box vao gio hang.')
      navigate('/login')
      return
    }

    const currentCartQuantity = cartBoxQuantities[String(item.id)] || 0
    const availableQuantity = Math.max((Number(item.quantity) || 0) - currentCartQuantity, 0)
    if (availableQuantity <= 0) {
      toast.error('Box nay da dat toi so luong co the them.')
      return
    }

    if (quantity > availableQuantity) {
      toast.error('So luong vuot qua ton kho hien co.')
      setQuantity(Math.max(availableQuantity, 1))
      return
    }

    setIsAdding(true)
    const flySourceRect = getFlyToCartSourceRect(productImageRef.current)

    try {
      const cart = await cartApi.addItem({ boxId: item.id, quantity })
      const nextCartBoxQuantities = getCartBoxQuantities(cart)
      const nextAvailableQuantity = Math.max((Number(item.quantity) || 0) - (nextCartBoxQuantities[String(item.id)] || 0), 0)
      const flyAnimation = flyToCart({
        sourceRect: flySourceRect,
        targetElement: getCartTargetElement(),
        imageUrl: getItemImage(item),
        label: getItemName(item)
      })
      setCartBoxQuantities(nextCartBoxQuantities)
      setQuantity(nextAvailableQuantity > 0 ? Math.min(quantity, nextAvailableQuantity) : 1)
      await flyAnimation
      toast.success('Da them box vao gio hang.')
    } catch (error) {
      toast.error(error.message || 'Khong the them box vao gio hang.')
    } finally {
      setIsAdding(false)
    }
  }

  if (loading) {
    return <div className="product-detail-page"><p className="product-detail-status">Dang tai chi tiet...</p></div>
  }

  if (errorMessage || !item) {
    return (
      <div className="product-detail-page">
        <p className="product-detail-status product-detail-status--error">{errorMessage || 'Khong tim thay san pham.'}</p>
      </div>
    )
  }

  const isBox = itemType === 'box'
  const currentCartQuantity = isBox ? cartBoxQuantities[String(item.id)] || 0 : 0
  const availableQuantity = isBox
    ? Math.max((Number(item.quantity) || 0) - currentCartQuantity, 0)
    : Number(item.quantity) || 0

  return (
    <div className="product-detail-page">
      <div className="product-detail-breadcrumb">
        <Link to="/">Home</Link>
        <MdKeyboardArrowRight />
        <Link to="/marketplace">Marketplace</Link>
        <MdKeyboardArrowRight />
        <span className="product-detail-breadcrumb-active">{getItemName(item)}</span>
      </div>

      <div className="product-detail-container">
        <div className="product-detail-content">
          <div className="product-detail-image-section">
            <img
              ref={productImageRef}
              src={getItemImage(item)}
              alt={getItemName(item)}
              className="product-detail-main-image"
            />
          </div>

          <div className="product-detail-info-section">
            <h1 className="product-detail-title">{getItemName(item)}</h1>

            <div className="product-detail-rating">
              <div className="product-detail-stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`product-detail-star ${i < 4 ? 'product-detail-star-filled' : ''}`}
                  />
                ))}
              </div>
              <span className="product-detail-rating-text">4/5</span>
            </div>

            <div className="product-detail-price-section">
              <span className="product-detail-current-price">{formatCurrency(item.price)}</span>
              {isBox && (
                <span className="product-detail-discount">
                  {availableQuantity > 0 ? `Con ${availableQuantity}` : 'Het hang'}
                </span>
              )}
            </div>

            <hr className="product-detail-divider" />

            <p className="product-detail-description">
              {item.description || 'San pham HerDays duoc dong bo truc tiep tu backend marketplace.'}
            </p>

            {isBox && (
              <div className="product-detail-subscription">
                <label className="product-detail-subscription-label">Dang ky dinh ky</label>
                <div className="product-detail-subscription-options">
                  {SUBSCRIPTIONS.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubscription(sub)}
                      className={`product-detail-subscription-btn ${selectedSubscription === sub ? 'product-detail-subscription-btn-active' : ''}`}
                    >
                      {sub}
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
                  className="product-detail-quantity-btn"
                  disabled={!isBox || quantity <= 1}
                >
                  <FiMinus />
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="product-detail-quantity-input"
                />
                <button
                  type="button"
                  onClick={() => updateQuantity(quantity + 1)}
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
                {isAdding ? 'Dang them...' : isBox ? 'Them vao gio hang' : 'San pham le'}
              </button>
            </div>
          </div>
        </div>

        {isBox && (
          <div className="product-detail-related-section">
            <div className="product-detail-related-header">
              <h2 className="product-detail-related-title">San pham co trong Box</h2>
              <Link to={`/box-customize/${item.id}`} className="product-detail-related-customize">
                Tuy chinh
              </Link>
            </div>

            <div className="product-detail-related-grid">
              {relatedProducts.length === 0 ? (
                <p className="product-detail-status">Box nay chua co san pham con.</p>
              ) : (
                relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="product-detail-related-card">
                    <div className="product-detail-related-image">
                      <img src={getItemImage(relatedProduct)} alt={relatedProduct.name} />
                    </div>
                    <div className="product-detail-related-info">
                      <p className="product-detail-related-subtitle">{relatedProduct.subtitle}</p>
                      <h4 className="product-detail-related-name">{relatedProduct.name}</h4>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
