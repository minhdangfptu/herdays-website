import React from 'react';
import './Checkout.scss';

export default function Checkout() {
  // Mock data sản phẩm để render cho nhàn, mốt ông gọi API thì thay thế vào đây nhé
  const cartItems = [
    {
      id: 1,
      name: 'Box Dâu 1',
      quantity: 1,
      price: '363.363 đ',
      // Dùng ảnh tạm, ông thay link ảnh thật vào đây
      image: 'https://via.placeholder.com/80x80/FFB6C1/FFFFFF?text=Box+Dau' 
    },
    {
      id: 2,
      name: 'Box Dâu 1',
      quantity: 1,
      price: '363.363 đ',
      image: 'https://via.placeholder.com/80x80/98FB98/FFFFFF?text=Box+Dau'
    }
  ];

  return (
    <div className="herdays-checkout-page">
      <div className="herdays-checkout-container">
        
        {/* Nút Back */}
        <a href="/cart" className="herdays-checkout-back">
          <span className="icon">←</span> Tiếp tục mua sắm
        </a>

        {/* Tiêu đề */}
        <div className="herdays-checkout-header">
          <h1 className="herdays-checkout-title">Thanh toán đơn hàng</h1>
          <p className="herdays-checkout-subtitle">
            Bạn hãy kiểm tra thật kỹ đơn hàng, rồi bấm xác nhận thanh toán nhé
          </p>
        </div>

        {/* Bố cục 2 cột */}
        <div className="herdays-checkout-layout">
          
          {/* CỘT TRÁI: Danh sách sản phẩm */}
          <div className="herdays-checkout-left">
            <div className="herdays-checkout-card">
              <h2 className="herdays-checkout-card-title">Sản phẩm đặt mua (2)</h2>
              
              <div className="herdays-checkout-product-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="herdays-checkout-product-item">
                    <div className="product-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{item.name}</h3>
                      <p className="product-quantity">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="product-price">{item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Tóm tắt đơn hàng */}
          <div className="herdays-checkout-right">
            <div className="herdays-checkout-card">
              <h2 className="herdays-checkout-card-title">Tóm tắt đơn hàng</h2>
              
              <div className="herdays-checkout-summary">
                <div className="summary-row">
                  <span className="summary-label">Tạm tính</span>
                  <span className="summary-value">363.363 đ</span>
                </div>
                
                <div className="summary-row">
                  <span className="summary-label">Phí vận chuyển</span>
                  <span className="summary-value text-green">Miễn phí</span>
                </div>
                
                <hr className="summary-divider" />
                
                <div className="summary-row total-row">
                  <span className="summary-label">Tổng cộng</span>
                  <span className="summary-value total-price">363.363 đ</span>
                </div>

                <button className="herdays-checkout-btn">
                  Xác nhận thanh toán
                </button>
                
                <p className="summary-note">
                  Bạn sẽ được chuyển hướng đến trang thanh toán QR
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}