import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { cartApi, hasAuthSession } from '../../services/apiService.js';
import './Cart.scss';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const normalizeCartItem = (item) => {
  const box = item.boxId || {};
  const boxId = box._id || box.id || item.boxId;
  const stock = Number(box.quantity) || 0;
  const quantity = item.quantity || 1;

  return {
    id: String(boxId),
    name: box.boxName || 'HerDays Box',
    category: box.category || 'Subscription Box',
    image: box.thumbnail || `https://placehold.co/160x160/f8c4d8/ffffff?text=${encodeURIComponent(box.boxName || 'Box')}`,
    stock,
    quantity,
    remainingStock: Math.max(stock - quantity, 0),
    price: Number(box.price) || 0
  };
};

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedBoxIds, setSelectedBoxIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingBoxId, setUpdatingBoxId] = useState('');

  useEffect(() => {
    if (!hasAuthSession()) {
      toast.error('Vui long dang nhap de xem gio hang.');
      navigate('/login', { replace: true });
      return undefined;
    }

    let isMounted = true;

    cartApi.getCart()
      .then((cart) => {
        if (!isMounted) return;
        const nextItems = (cart.items || []).map(normalizeCartItem);
        setCartItems(nextItems);
        setSelectedBoxIds(nextItems.map((item) => item.id));
      })
      .catch((error) => {
        if (isMounted) setErrorMessage(error.message || 'Khong the tai gio hang.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const selectedItems = useMemo(
    () => cartItems.filter((item) => selectedBoxIds.includes(item.id)),
    [cartItems, selectedBoxIds]
  );

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isAllSelected = cartItems.length > 0 && selectedBoxIds.length === cartItems.length;

  const syncCartState = (cart) => {
    const nextItems = (cart.items || []).map(normalizeCartItem);
    setCartItems(nextItems);
    setSelectedBoxIds((current) => current.filter((boxId) => nextItems.some((item) => item.id === boxId)));
  };

  const toggleSelectAll = () => {
    setSelectedBoxIds(isAllSelected ? [] : cartItems.map((item) => item.id));
  };

  const toggleSelectItem = (boxId) => {
    setSelectedBoxIds((current) => (
      current.includes(boxId)
        ? current.filter((id) => id !== boxId)
        : [...current, boxId]
    ));
  };

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return;
    if (quantity > item.stock) {
      toast.error('So luong vuot qua ton kho hien co.');
      return;
    }

    const boxId = item.id;
    setUpdatingBoxId(boxId);

    try {
      const cart = await cartApi.updateItem({ boxId, quantity });
      syncCartState(cart);
    } catch (error) {
      toast.error(error.message || 'Khong the cap nhat so luong.');
    } finally {
      setUpdatingBoxId('');
    }
  };

  const removeItem = async (boxId) => {
    setUpdatingBoxId(boxId);

    try {
      const cart = await cartApi.removeItem(boxId);
      syncCartState(cart);
      toast.success('Da xoa san pham khoi gio hang.');
    } catch (error) {
      toast.error(error.message || 'Khong the xoa san pham.');
    } finally {
      setUpdatingBoxId('');
    }
  };

  const handleCheckout = () => {
    if (selectedBoxIds.length === 0) {
      toast.error('Vui long tick chon san pham muon thanh toan.');
      return;
    }

    navigate('/check-out', { state: { selectedBoxIds } });
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Gio hang</h1>

        {loading && <p className="cart-status">Dang tai gio hang...</p>}
        {errorMessage && <p className="cart-status cart-status--error">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <>
            <div className="cart-content">
              <div className="cart-items-section">
                <div className="cart-items-header">
                  <p className="cart-items-count">
                    Ban dang co {cartItems.length} san pham trong gio hang, da chon {selectedItems.length}
                  </p>
                </div>

                {cartItems.length === 0 ? (
                  <p className="cart-status">Gio hang dang trong.</p>
                ) : (
                  <div className="cart-table">
                    <div className="cart-table-header">
                      <label className="cart-select-all">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                        />
                        <span>San pham</span>
                      </label>
                      <div className="cart-col-price">Don gia</div>
                      <div className="cart-col-quantity">So luong</div>
                      <div className="cart-col-total">Tong tien</div>
                    </div>

                    <div className="cart-table-body">
                      {cartItems.map((item) => (
                        <div key={item.id} className="cart-table-row">
                          <div className="cart-col-product">
                            <label className="cart-product-select">
                              <input
                                type="checkbox"
                                checked={selectedBoxIds.includes(item.id)}
                                onChange={() => toggleSelectItem(item.id)}
                              />
                              <span className="cart-product-info">
                                <img src={item.image} alt={item.name} className="cart-product-image" />
                                <span className="cart-product-details">
                                  <span className="cart-product-name">{item.name}</span>
                                  <span className="cart-product-attr">Danh muc: <span>{item.category}</span></span>
                                </span>
                              </span>
                            </label>
                          </div>

                          <div className="cart-col-price">
                            <span className="cart-stock-status">
                              <span className="cart-stock-dot"></span>
                              Ton kho: {item.stock}
                            </span>
                            <span className="cart-stock-remaining">
                              Con lai sau khi them: {item.remainingStock}
                            </span>
                            <span className="cart-price">{formatCurrency(item.price)}</span>
                          </div>

                          <div className="cart-col-quantity">
                            <div className="cart-quantity-control">
                              <button
                                type="button"
                                disabled={updatingBoxId === item.id || item.quantity <= 1}
                                onClick={() => updateQuantity(item, item.quantity - 1)}
                                className="cart-quantity-btn"
                              >
                                <FiMinus />
                              </button>
                              <input type="number" value={item.quantity} readOnly className="cart-quantity-input" />
                              <button
                                type="button"
                                disabled={updatingBoxId === item.id || item.quantity >= item.stock}
                                onClick={() => updateQuantity(item, item.quantity + 1)}
                                className="cart-quantity-btn"
                              >
                                <FiPlus />
                              </button>
                            </div>
                          </div>

                          <div className="cart-col-total">
                            <span className="cart-item-total">{formatCurrency(item.price * item.quantity)}</span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="cart-remove-btn"
                              title="Xoa san pham"
                              disabled={updatingBoxId === item.id}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="cart-checkout-section">
              <div className="cart-subtotal-box">
                <div className="cart-subtotal-row">
                  <span>Tam tinh cac san pham da chon</span>
                  <span className="cart-subtotal-amount">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <div className="cart-action-buttons">
                <Link className="cart-btn-continue" to="/marketplace">Tiep tuc mua sam</Link>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="cart-btn-checkout"
                  disabled={selectedBoxIds.length === 0}
                >
                  Thanh toan
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
