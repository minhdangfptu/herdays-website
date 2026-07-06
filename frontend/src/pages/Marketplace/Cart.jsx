'use client';

import React, { useState } from 'react';
import { FiPlus, FiMinus, FiTrash2, FiHeart, FiX } from 'react-icons/fi';
import { BsHouseFill } from 'react-icons/bs';
import './Cart.scss';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'ÁO MƯA ĐI BỘ ĐƯỜNG DÀI 50 - 10L XANH NGỌC',
      image: '/images/product-1.jpg',
      color: 'Xanh lá',
      size: 'XL',
      inStock: true,
      quantity: 12,
      price: 41.78,
    },
    {
      id: 2,
      name: 'ÁO MƯA ĐI BỘ ĐƯỜNG DÀI 50 - 10L XANH NGỌC',
      image: '/images/product-2.jpg',
      color: 'Xanh lá',
      size: 'XL',
      inStock: true,
      quantity: 1,
      price: 41.78,
    },
    {
      id: 3,
      name: 'TÚI 10 L XANH NGỌC',
      image: '/images/product-3.jpg',
      color: 'Xanh lá',
      size: 'XL',
      inStock: true,
      quantity: 12,
      price: 41.78,
    },
  ]);

  const [promoMessage] = useState('Tuyệt vời! Bạn đã được MIỄN PHÍ VẬN CHUYỂN. Chỉ cần mua thêm $14.25 để nhận thêm 3% HOÀN TIỀN');
  const [shippingProgress] = useState(60);
  const [recommendedProduct] = useState({
    name: 'Áo nỉ có mũ HUGO',
    price: 44.99,
    image: '/images/recommended.jpg',
  });

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.length;

  return (
    <div className="cart-page">

      {/* Main Cart Section */}
      <div className="cart-container">
        <h1 className="cart-title">Giỏ hàng</h1>

        {/* Cart Items Section */}
        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <p className="cart-items-count">Bạn đang có {totalItems} sản phẩm trong giỏ hàng</p>
            </div>

            {/* Cart Table */}
            <div className="cart-table">
              <div className="cart-table-header">
                <div className="cart-col-product">Sản phẩm</div>
                <div className="cart-col-price">Đơn giá</div>
                <div className="cart-col-quantity">Số lượng</div>
                <div className="cart-col-total">Tổng tiền</div>
              </div>

              <div className="cart-table-body">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-table-row">
                    <div className="cart-col-product">
                      <div className="cart-product-info">
                        <img src={item.image} alt={item.name} className="cart-product-image" />
                        <div className="cart-product-details">
                          <h4 className="cart-product-name">{item.name}</h4>
                          <p className="cart-product-attr">Màu sắc: <span>{item.color}</span></p>
                          <p className="cart-product-attr">Kích cỡ: <span>{item.size}</span></p>
                        </div>
                        <button className="cart-wishlist-btn" title="Thêm vào danh sách yêu thích">
                          <FiHeart />
                        </button>
                      </div>
                    </div>

                    <div className="cart-col-price">
                      <span className="cart-stock-status">
                        <span className="cart-stock-dot">●</span>
                        Còn hàng ({item.quantity} cái)
                      </span>
                      <span className="cart-price">${item.price.toFixed(2)}</span>
                    </div>

                    <div className="cart-col-quantity">
                      <div className="cart-quantity-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="cart-quantity-btn">
                          <FiMinus />
                        </button>
                        <input type="number" value={item.quantity} readOnly className="cart-quantity-input" />
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="cart-quantity-btn">
                          <FiPlus />
                        </button>
                      </div>
                    </div>

                    <div className="cart-col-total">
                      <span className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeItem(item.id)} className="cart-remove-btn" title="Xóa sản phẩm">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Section */}
        <div className="cart-checkout-section">
          <div className="cart-subtotal-box">
            <div className="cart-subtotal-row">
              <span>Tạm tính (chưa bao gồm phí vận chuyển)</span>
              <span className="cart-subtotal-amount">${subtotal.toFixed(2)}</span>
            </div>
         
          </div>

          <div className="cart-action-buttons">
            <button className="cart-btn-continue">Tiếp tục mua sắm</button>
            <button onClick={() => navigate('/check-out')} className="cart-btn-checkout">Thanh toán</button>
          </div>
        </div>
      </div>
    </div>
  );
}