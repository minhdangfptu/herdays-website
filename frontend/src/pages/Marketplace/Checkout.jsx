import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cartApi, hasAuthSession, orderApi } from '../../services/apiService.js'
import { RefreshCw } from 'lucide-react'
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

const SUBSCRIPTION_PLANS = [
  { months: 1, label: '1 tháng', discount: 0, badge: null },
  { months: 3, label: '3 tháng', discount: 5, badge: 'Tiết kiệm 5%' },
  { months: 6, label: '6 tháng', discount: 10, badge: 'Tiết kiệm 10%' },
  { months: 12, label: '12 tháng', discount: 20, badge: 'Tốt nhất' },
]

export default function Checkout() {
  const location = useLocation()
  const initialSelectedBoxIds = useMemo(
    () => Array.isArray(location.state?.selectedBoxIds) ? location.state.selectedBoxIds.map(String) : [],
    [location.state]
  )
  const [cartItems, setCartItems] = useState([])
  const [selectedBoxIds, setSelectedBoxIds] = useState(initialSelectedBoxIds)
  const [loading, setLoading] = useState(true)
  const [updatingBoxId, setUpdatingBoxId] = useState('')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    if (!hasAuthSession()) {
      toast.error('Vui lòng đăng nhập để xem sản phẩm thanh toán.')
      navigate('/login', { replace: true })
      return
    }

    let isMounted = true

    cartApi.getCart()
      .then((cart) => {
        if (!isMounted) return
        const nextItems = (cart.items || []).map(normalizeCartItem)
        const validIds = nextItems.map((item) => String(item.id))
        const filteredSelectedIds = initialSelectedBoxIds.filter((boxId) => validIds.includes(String(boxId)))

        setCartItems(nextItems)
        setSelectedBoxIds(filteredSelectedIds.length > 0 ? filteredSelectedIds : validIds)
      })
      .catch((error) => {
        if (isMounted) setErrorMessage(error.message || 'Không thể tải sản phẩm thanh toán.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [initialSelectedBoxIds, navigate])

  const selectedCartItems = useMemo(
    () => cartItems.filter((item) => selectedBoxIds.includes(String(item.id))),
    [cartItems, selectedBoxIds]
  )

  const subtotal = useMemo(
    () => selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedCartItems]
  )

  const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.months === selectedPlan) || SUBSCRIPTION_PLANS[0]
  const discountPercent = selectedPlanData.discount
  const discountAmount = subtotal * discountPercent / 100
  const orderTotal = subtotal - discountAmount

  const handleQuantityChange = async (boxId, quantity) => {
    if (quantity < 1) return

    setUpdatingBoxId(boxId)

    try {
      const cart = await cartApi.updateItem({ boxId, quantity })
      setCartItems((cart.items || []).map(normalizeCartItem))
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật sản phẩm thanh toán.')
    } finally {
      setUpdatingBoxId('')
    }
  }

  const handleRemove = async (boxId) => {
    setUpdatingBoxId(boxId)

    try {
      const cart = await cartApi.removeItem(boxId)
      const nextItems = (cart.items || []).map(normalizeCartItem)
      setCartItems(nextItems)
      setSelectedBoxIds((current) => (
        current.filter((id) => nextItems.some((item) => String(item.id) === String(id)))
      ))
      toast.success('Đã xóa sản phẩm khỏi sản phẩm thanh toán.')
    } catch (error) {
      toast.error(error.message || 'Không thể xóa sản phẩm.')
    } finally {
      setUpdatingBoxId('')
    }
  }

  const toggleSelectItem = (boxId) => {
    const normalizedBoxId = String(boxId)
    setSelectedBoxIds((current) => (
      current.includes(normalizedBoxId)
        ? current.filter((id) => id !== normalizedBoxId)
        : [...current, normalizedBoxId]
    ))
  }

  const handleCheckout = async () => {
    if (selectedCartItems.length === 0) {
      toast.error('Sản phẩm thanh toán đang trống.')
      return
    }

    setIsCheckingOut(true)

    try {
      const order = await orderApi.createFromCart({
        paymentMethod: 'bank_transfer',
        boxIds: selectedBoxIds
      })
      setCartItems((current) => current.filter((item) => !selectedBoxIds.includes(String(item.id))))
      setSelectedBoxIds([])
      navigate('/qr-payment', {
        state: {
          amount: order.totalAmount,
          orderCode: order.id ? `HD${String(order.id).slice(-6).toUpperCase()}` : `HD${Date.now().toString().slice(-6)}`,
          orderId: order.id
        }
      })
    } catch (error) {
      toast.error(error.message || 'KhÃ´ng thá»ƒ táº¡o Ä‘Æ¡n hÃ ng.')
    } finally {
      setIsCheckingOut(false)
    }
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

        {loading && <p className="herdays-checkout-status">Đang tải sản phẩm thanh toán...</p>}
        {errorMessage && <p className="herdays-checkout-status herdays-checkout-status--error">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <div className="herdays-checkout-layout">
            <div className="herdays-checkout-left">
              <div className="herdays-checkout-card">
                <h2 className="herdays-checkout-card-title">
                  Sản phẩm đặt mua ({cartItems.length})
                </h2>

                {cartItems.length === 0 ? (
                  <p className="herdays-checkout-empty">Sản phẩm thanh toán của bạn đang trống.</p>
                ) : (
                  <div className="herdays-checkout-product-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="herdays-checkout-product-item">
                        <label className="product-select" aria-label="Chon san pham thanh toan">
                          <input
                            type="checkbox"
                            checked={selectedBoxIds.includes(String(item.id))}
                            onChange={() => toggleSelectItem(item.id)}
                          />
                        </label>
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
              <div className="herdays-checkout-subscription-card herdays-checkout-card">
                <h2 className="herdays-checkout-card-title">
                  <RefreshCw size={18} />
                  Đăng ký định kỳ
                </h2>
                <div className="subscription-plans">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <button
                      key={plan.months}
                      type="button"
                      className={`subscription-plan-btn ${selectedPlan === plan.months ? 'active' : ''}`}
                      onClick={() => setSelectedPlan(plan.months)}
                    >
                      <span className="plan-label">{plan.label}</span>
                      {/* {plan.badge && (
                        <span className="plan-badge">{plan.badge}</span>
                      )} */}
                    </button>
                  ))}
                </div>
                {/* {discountPercent > 0 && (
                  <p className="subscription-savings">
                    Tiết kiệm <strong>{formatCurrency(discountAmount)}</strong> với gói {selectedPlanData.label}
                  </p>
                )} */}
              </div>

              <div className="herdays-checkout-card">
                <h2 className="herdays-checkout-card-title">Tóm tắt đơn hàng</h2>

                <div className="herdays-checkout-summary">
                  <div className="summary-row">
                    <span className="summary-label">Tạm tính</span>
                    <span className="summary-value">{formatCurrency(subtotal)}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="summary-row">
                      <span className="summary-label">Giảm giá ({discountPercent}%)</span>
                      <span className="summary-value text-green">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span className="summary-label">Phí vận chuyển</span>
                    <span className="summary-value text-green">Miễn phí</span>
                  </div>

                  <hr className="summary-divider" />

                  <div className="summary-row total-row">
                    <span className="summary-label">Tổng cộng</span>
                    <span className="summary-value total-price">{formatCurrency(orderTotal)}</span>
                  </div>

                  <button
                    className="herdays-checkout-btn"
                    type="button"
                    disabled={selectedCartItems.length === 0 || isCheckingOut}
                    onClick={handleCheckout}
                  >
                    {isCheckingOut ? 'Đang tạo đơn...' : 'Xác nhận thanh toán'}
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
