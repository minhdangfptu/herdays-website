import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cartApi, hasAuthSession, marketplaceApi } from '../../services/apiService.js'
import heroBanner from '../../assets/marketplace/hero_banner.png'
import subBoxBanner from '../../assets/marketplace/sub_box.png'
import './Marketplace.scss'

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)

const getItemName = (item) => item.boxName || item.productName || 'HerDays item'

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
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const loadMarketplace = async () => {
      setLoading(true)
      setErrorMessage('')

      try {
        const boxResult = await marketplaceApi.listBoxes({ limit: 12 })

        if (!isMounted) return
        setBoxes(boxResult.items || [])
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || 'Khong the tai marketplace.')
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

  const handleAddToCart = async (boxId) => {
    if (!hasAuthSession()) {
      toast.error('Vui long dang nhap de them san pham vao gio hang.')
      navigate('/login')
      return
    }

    setAddingBoxId(boxId)

    try {
      await cartApi.addItem({ boxId, quantity: 1 })
      toast.success('Da them box vao gio hang.')
    } catch (error) {
      toast.error(error.message || 'Khong the them box vao gio hang.')
    } finally {
      setAddingBoxId('')
    }
  }

  const renderBoxCard = (box) => {
    const detailPath = `/product-detail/box/${box.id}`

    return (
      <article className="marketplace-product" key={`box-${box.id}`}>
        <Link className="marketplace-product__image" to={detailPath}>
          <img src={getItemImage(box)} alt={getItemName(box)} />
        </Link>
        <div className="marketplace-product__content">
          <p className="marketplace-product__category">
            {box.category || 'Subscription Box'}
          </p>
          <h2>{getItemName(box)}</h2>
          <p className="marketplace-product__description">
            {box.description || 'Box cham soc suc khoe duoc thiet ke cho nhu cau ca nhan.'}
          </p>
          <div className="marketplace-product__meta">
            <strong>{formatCurrency(box.price)}</strong>
            <span>{box.quantity > 0 ? `Con ${box.quantity}` : 'Het hang'}</span>
          </div>
          <button
            type="button"
            disabled={addingBoxId === box.id || box.quantity <= 0}
            onClick={() => handleAddToCart(box.id)}
          >
            {addingBoxId === box.id ? 'Dang them...' : 'Them vao gio'}
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
          <p className="hero-banner-subtitle">Item "must-have" cho hoi chi em</p>
          <Link to={firstBoxId ? `/product-detail/box/${firstBoxId}` : '/marketplace'} className="hero-banner-btn">
            Mua ngay
          </Link>
        </div>
      </section>

      <section className="marketplace-hero">
        <div>
          <h1>Chọn box và sản phẩm chăm sóc phù hợp với hành trình của bạn</h1>
          <p>
            Dữ liệu box và sản phẩm được lấy trực tiếp từ backend marketplace để đồng bộ với tồn kho,
            giá bán và nội dung admin đã cấu hình.
          </p>
        </div>
        {categories.length > 0 && (
          <div className="marketplace-hero__goals" aria-label="Mục tiêu sản phẩm">
            {categories.map((category) => (
              <span className="marketplace-hero__goal" key={category}>
                <span>Mục tiêu</span>
                {formatGoalLabel(category)}
              </span>
            ))}
          </div>
        )}
      </section>

      {loading && <p className="marketplace-status">Dang tai marketplace...</p>}
      {errorMessage && <p className="marketplace-status marketplace-status--error">{errorMessage}</p>}

      {!loading && !errorMessage && (
        <>
          <section className="marketplace-section" aria-label="Danh sach box">
            <div className="marketplace-section__header">
              <h2>Subscription Box</h2>
              <Link to={firstBoxId ? `/box-customize/${firstBoxId}` : '/box-customize'}>Tao box ca nhan hoa</Link>
            </div>
            <div className="marketplace-grid">
              {boxes.length === 0 ? (
                <p className="marketplace-status">Chua co box nao.</p>
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
            <span className="footer-banner-title-herdays">HerDays</span> Subscription Box
          </h2>
          <p className="footer-banner-subtitle">
            Cac Subscription Box duoc ca nhan hoa dua tren tung giai doan suc khoe cua nguoi dung.
          </p>
          <Link to={firstBoxId ? `/box-customize/${firstBoxId}` : '/box-customize'} className="footer-banner-btn">
            Tao box ca nhan hoa
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Marketplace
