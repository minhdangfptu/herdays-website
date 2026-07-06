import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { boxApi, cartApi, hasAuthSession } from '../../services/apiService.js'
import heroBanner from '../../assets/marketplace/hero_banner.png'
import subBoxBanner from '../../assets/marketplace/sub_box.png'
import './Marketplace.scss'

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)

const getBoxImage = (box) =>
  box.thumbnail || `https://placehold.co/480x360/f8c4d8/ffffff?text=${encodeURIComponent(box.boxName || 'HerDays')}`

function Marketplace() {
  const [boxes, setBoxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [addingBoxId, setAddingBoxId] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    boxApi.list()
      .then(({ items }) => {
        if (isMounted) setBoxes(items || [])
      })
      .catch((error) => {
        if (isMounted) setErrorMessage(error.message || 'Không thể tải danh sách sản phẩm.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = boxes.map((box) => box.category).filter(Boolean)
    return [...new Set(uniqueCategories)].slice(0, 4)
  }, [boxes])

  const handleAddToCart = async (boxId) => {
    if (!hasAuthSession()) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
      navigate('/login')
      return
    }

    setAddingBoxId(boxId)

    try {
      await cartApi.addItem({ boxId, quantity: 1 })
      toast.success('Đã thêm sản phẩm vào giỏ hàng.')
    } catch (error) {
      toast.error(error.message || 'Không thể thêm sản phẩm vào giỏ hàng.')
    } finally {
      setAddingBoxId('')
    }
  }

  return (
    <main className="marketplace-page">
      <section className="marketplace-hero-banner">
        <img src={heroBanner} alt="HerDays Box Subscription" className="hero-banner-image" />
        <div className="hero-banner-content">
          <p className="hero-banner-eyebrow">HerDays Marketplace</p>
          <h2 className="hero-banner-title">Box Subscription</h2>
          <p className="hero-banner-subtitle">Item "must-have" cho hội chị em</p>
          <Link to="/checkout" className="hero-banner-btn">Mua ngay</Link>
        </div>
      </section>

      <section className="marketplace-hero">
        <div>
          <h1>Chọn box chăm sóc phù hợp với hành trình của bạn</h1>
          <p>
            Các gói sản phẩm được cá nhân hóa để hỗ trợ theo dõi chu kỳ,
            chuẩn bị mang thai và chăm sóc sức khỏe nữ giới hằng ngày.
          </p>
        </div>
        {/* <Link className="marketplace-cart-link" to="/cart">
          Xem giỏ hàng
        </Link> */}
        {categories.length > 0 && (
        <div style={{color: '#fff', fontWeight: '600', fontSize: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', backgroundColor: '#F176A9', padding: '12px 22px', borderRadius: '25px' }} aria-label="Danh mục sản phẩm">
          {categories.map((category) => (
            <span key={category}>Mục tiêu: {category}</span>
          ))}
        </div>
      )}
      </section>

      

      {loading && <p className="marketplace-status">Đang tải sản phẩm...</p>}
      {errorMessage && <p className="marketplace-status marketplace-status--error">{errorMessage}</p>}

      {!loading && !errorMessage && (
        <section className="marketplace-grid" aria-label="Danh sách sản phẩm">
          {boxes.length === 0 ? (
            <p className="marketplace-status">Chưa có sản phẩm nào.</p>
          ) : (
            boxes.map((box) => (
              <article className="marketplace-product" key={box.id}>
                <div className="marketplace-product__image">
                  <img src={getBoxImage(box)} alt={box.boxName} />
                </div>
                <div className="marketplace-product__content">
                  <p className="marketplace-product__category">{box.category || 'Subscription Box'}</p>
                  <h2>{box.boxName}</h2>
                  <p className="marketplace-product__description">
                    {box.description || 'Box chăm sóc sức khỏe được thiết kế cho nhu cầu cá nhân.'}
                  </p>
                  <div className="marketplace-product__meta">
                    <strong>{formatCurrency(box.price)}</strong>
                    <span>{box.quantity > 0 ? `Còn ${box.quantity}` : 'Hết hàng'}</span>
                  </div>
                  <button
                    type="button"
                    disabled={addingBoxId === box.id || box.quantity <= 0}
                    onClick={() => handleAddToCart(box.id)}
                  >
                    {addingBoxId === box.id ? 'Đang thêm...' : 'Thêm vào giỏ'}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      )}

      <section className="marketplace-footer-banner">
        <img src={subBoxBanner} alt="HerDays Subscription Box" className="footer-banner-image" />
        <div className="footer-banner-content">
          <h2 className="footer-banner-title">
            <span className="footer-banner-title-herdays">HerDays</span> Subscription Box
          </h2>
          <p className="footer-banner-subtitle">
            Các Subscription Box được cá nhân hóa dựa trên từng giai đoạn sức khỏe của người dùng.
          </p>
          <Link to="/box-customize/:boxId" className="footer-banner-btn">Tạo box cá nhân hoá</Link>
        </div>
      </section>
    </main>
  )
}

export default Marketplace
