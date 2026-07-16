import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cartApi, getCartBoxQuantities, hasAuthSession, marketplaceApi } from '../../services/apiService.js'
import { flyToCart, getCartTargetElement, getFlyToCartSourceRect } from '../../utils/flyToCart.js'
import heroBanner from '../../assets/marketplace/hero_banner.png'
import subBoxBanner from '../../assets/marketplace/sub_box.png'
import './Marketplace.scss'

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)

const getItemName = (item) => item.boxName || item.productName || 'Sản phẩm HerDays'

const getItemImage = (item) =>
  item.thumbnail || `https://placehold.co/480x360/f8c4d8/ffffff?text=${encodeURIComponent(getItemName(item))}`

const formatGoalLabel = (category) => (
  String(category || '').replace(/^(mục|muc)\s*(tiêu|tieu)\s*:\s*/i, '').trim()
)

function Marketplace() {
  const [boxes, setBoxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [addingBoxId, setAddingBoxId] = useState('')
  const [cartBoxQuantities, setCartBoxQuantities] = useState({})
  const boxImageRefs = useRef({})
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const loadMarketplace = async () => {
      setLoading(true)
      setErrorMessage('')

      try {
        const [boxResult, cartResult] = await Promise.all([
          marketplaceApi.listBoxes({ limit: 12 }),
          hasAuthSession()
            ? cartApi.getCart().catch(() => null)
            : Promise.resolve(null)
        ])

        if (!isMounted) return
        setBoxes(boxResult.items || [])
        setCartBoxQuantities(getCartBoxQuantities(cartResult))
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || 'Không thể tải marketplace.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadMarketplace()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = boxes.map((item) => item.category).filter(Boolean)
    return [...new Set(uniqueCategories)].slice(0, 4)
  }, [boxes])

  const firstBoxId = boxes[0]?.id

  const getAvailableBoxQuantity = (box) => (
    Math.max((Number(box.quantity) || 0) - (cartBoxQuantities[String(box.id)] || 0), 0)
  )

  const handleAddToCart = async (box) => {
    if (!hasAuthSession()) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
      navigate('/login')
      return
    }

    const boxId = box.id
    if (getAvailableBoxQuantity(box) <= 0) {
      toast.error('Box này đã đạt tới số lượng có thể thêm.')
      return
    }

    setAddingBoxId(boxId)
    const flySourceRect = getFlyToCartSourceRect(boxImageRefs.current[boxId])

    try {
      const cart = await cartApi.addItem({ boxId, quantity: 1 })
      const flyAnimation = flyToCart({
        sourceRect: flySourceRect,
        targetElement: getCartTargetElement(),
        imageUrl: getItemImage(box),
        label: getItemName(box)
      })
      setCartBoxQuantities(getCartBoxQuantities(cart))
      await flyAnimation
      toast.success('Đã thêm box vào giỏ hàng.')
    } catch (error) {
      toast.error(error.message || 'Không thể thêm box vào giỏ hàng.')
    } finally {
      setAddingBoxId('')
    }
  }

  const renderBoxCard = (box) => {
    const detailPath = `/product-detail/box/${box.id}`
    const availableQuantity = getAvailableBoxQuantity(box)

    return (
      <article className="marketplace-product" key={`box-${box.id}`}>
        <Link className="marketplace-product__image" to={detailPath}>
          <img
            ref={(node) => {
              if (node) boxImageRefs.current[box.id] = node
            }}
            src={getItemImage(box)}
            alt={getItemName(box)}
          />
        </Link>
        <div className="marketplace-product__content">
          <p className="marketplace-product__category">
            {box.category || 'Subscription Box'}
          </p>
          <h2>{getItemName(box)}</h2>
          <p className="marketplace-product__description">
            {box.description || 'Box chăm sóc sức khỏe được thiết kế cho nhu cầu cá nhân.'}
          </p>
          <div className="marketplace-product__meta">
            <strong>{formatCurrency(box.price)}</strong>
            <span>{availableQuantity > 0 ? `Còn ${availableQuantity}` : 'Hết hàng'}</span>
          </div>
          <button
            type="button"
            disabled={addingBoxId === box.id || availableQuantity <= 0}
            onClick={() => handleAddToCart(box)}
          >
            {addingBoxId === box.id ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
        </div>
      </article>
    )
  }

  return (
    <main className="marketplace-page">
      <section className="marketplace-hero-banner">
        <img src={heroBanner} alt="HerDays Box Subscription" className="hero-banner-image" />
        <div className="hero-banner-content">
          <p className="hero-banner-eyebrow">HerDays Marketplace</p>
          <h2 className="hero-banner-title">Box Subscription</h2>
          <p className="hero-banner-subtitle">Item "must-have" cho hội chị em</p>
          <Link to={firstBoxId ? `/product-detail/box/${firstBoxId}` : '/marketplace'} className="hero-banner-btn">
            Mua ngay
          </Link>
        </div>
      </section>

      <section className="marketplace-hero">
        <div>
          <h1>Chọn box và sản phẩm chăm sóc phù hợp với hành trình của bạn</h1>
          <p>
            Hãy lựa chọn box subcription phù hợp với nhu cầu của bạn và thêm vào giỏ hàng. 
          </p>
        </div>
        {categories.length > 0 && (
          <div className="marketplace-hero__goals" aria-label="Mục tiêu sản phẩm">
            {categories.map((category) => (
              <span className="marketplace-hero__goal" key={category}>
                <span>Mục tiêu: </span>
                {formatGoalLabel(category)}
              </span>
            ))}
          </div>
        )}
      </section>

      {loading && <p className="marketplace-status">Đang tải marketplace...</p>}
      {errorMessage && <p className="marketplace-status marketplace-status--error">{errorMessage}</p>}

      {!loading && !errorMessage && (
        <>
          <section className="marketplace-section" aria-label="Danh sách box">
            <div className="marketplace-section__header">
              <h2>Subscription Box</h2>
              <Link to={firstBoxId ? `/box-customize/${firstBoxId}` : '/box-customize'}>Tạo box cá nhân hóa</Link>
            </div>
            <div className="marketplace-grid">
              {boxes.length === 0 ? (
                <p className="marketplace-status">Chưa có box nào.</p>
              ) : (
                boxes.map((box) => renderBoxCard(box))
              )}
            </div>
          </section>
        </>
      )}

      <section className="marketplace-footer-banner">
        <img src={subBoxBanner} alt="HerDays Subscription Box" className="footer-banner-image" />
        <div className="footer-banner-content">
          <h2 className="footer-banner-title">
            <span className="lamoric-text">HerDays</span> Subscription Box
          </h2>
          <p className="footer-banner-subtitle">
            Các Subscription Box được cá nhân hóa dựa trên từng giai đoạn sức khỏe của người dùng.
          </p>
          <Link to={firstBoxId ? `/box-customize/${firstBoxId}` : '/box-customize'} className="footer-banner-btn">
            Tạo box cá nhân hóa
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Marketplace
