import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cartApi, hasAuthSession } from '../../services/apiService.js'
import './Checkout.scss'

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)

const normalizeCartItem = (item) => {
  const box = item.boxId || {}
  const boxId = box._id || box.id || item.boxId

  return {
    id: boxId,
    name: box.boxName || 'HerDays Box',
    quantity: item.quantity || 1,
    price: Number(box.price) || 0,
    image: box.thumbnail || `https://placehold.co/160x160/f8c4d8/ffffff?text=${encodeURIComponent(box.boxName || 'Box')}`
  }
}

export default function Checkout() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingBoxId, setUpdatingBoxId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!hasAuthSession()) {
      toast.error('Vui lòng đăng nhập để xem giỏ hàng.')
      navigate('/login', { replace: true })
      return
    }

    let isMounted = true

    cartApi.getCart()
      .then((cart) => {
        if (isMounted) setCartItems((cart.items || []).map(normalizeCartItem))
      })
      .catch((error) => {
        if (isMounted) setErrorMessage(error.message || 'Không thể tải giỏ hàng.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [navigate])

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )

  const handleQuantityChange = async (boxId, quantity) => {
    if (quantity < 1) return

    setUpdatingBoxId(boxId)

    try {
      const cart = await cartApi.updateItem({ boxId, quantity })
      setCartItems((cart.items || []).map(normalizeCartItem))
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật giỏ hàng.')
    } finally {
      setUpdatingBoxId('')
    }
  }

  const handleRemove = async (boxId) => {
    setUpdatingBoxId(boxId)

    try {
      const cart = await cartApi.removeItem(boxId)
      setCartItems((cart.items || []).map(normalizeCartItem))
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng.')
    } catch (error) {
      toast.error(error.message || 'Không thể xóa sản phẩm.')
    } finally {
      setUpdatingBoxId('')
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng đang trống.')
      return
    }

    navigate('/qr-payment', {
      state: {
        amount: subtotal,
        orderCode: `HD${Date.now().toString().slice(-6)}`
      }
    })
  }

  return (
    <div className="herdays-checkout-page">
      <div className="herdays-checkout-container">
        <Link to="/marketplace" className="herdays-checkout-back">
          <span className="icon">←</span> Tiếp tục mua sắm
        </Link>

        <div className="herdays-checkout-header">
          <h1 className="herdays-checkout-title">Thanh toán đơn hàng</h1>
          <p className="herdays-checkout-subtitle">
            Kiểm tra sản phẩm trong giỏ hàng trước khi chuyển sang thanh toán QR.
          </p>
        </div>

        {loading && <p className="herdays-checkout-status">Đang tải giỏ hàng...</p>}
        {errorMessage && <p className="herdays-checkout-status herdays-checkout-status--error">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <div className="herdays-checkout-layout">
            <div className="herdays-checkout-left">
              <div className="herdays-checkout-card">
                <h2 className="herdays-checkout-card-title">
                  Sản phẩm đặt mua ({cartItems.length})
                </h2>

                {cartItems.length === 0 ? (
                  <p className="herdays-checkout-empty">Giỏ hàng của bạn đang trống.</p>
                ) : (
                  <div className="herdays-checkout-product-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="herdays-checkout-product-item">
                        <div className="product-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{item.name}</h3>
                          <div className="product-quantity-control">
                            <button
                              type="button"
                              disabled={updatingBoxId === item.id || item.quantity <= 1}
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              disabled={updatingBoxId === item.id}
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="product-remove"
                            type="button"
                            disabled={updatingBoxId === item.id}
                            onClick={() => handleRemove(item.id)}
                          >
                            Xóa
                          </button>
                        </div>
                        <div className="product-price">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="herdays-checkout-right">
              <div className="herdays-checkout-card">
                <h2 className="herdays-checkout-card-title">Tóm tắt đơn hàng</h2>

                <div className="herdays-checkout-summary">
                  <div className="summary-row">
                    <span className="summary-label">Tạm tính</span>
                    <span className="summary-value">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Phí vận chuyển</span>
                    <span className="summary-value text-green">Miễn phí</span>
                  </div>

                  <hr className="summary-divider" />

                  <div className="summary-row total-row">
                    <span className="summary-label">Tổng cộng</span>
                    <span className="summary-value total-price">{formatCurrency(subtotal)}</span>
                  </div>

                  <button
                    className="herdays-checkout-btn"
                    type="button"
                    disabled={cartItems.length === 0}
                    onClick={handleCheckout}
                  >
                    Xác nhận thanh toán
                  </button>

                  <p className="summary-note">
                    Bạn sẽ được chuyển hướng đến trang thanh toán QR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
