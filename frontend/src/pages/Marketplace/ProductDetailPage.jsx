'use client';

import React, { useState } from 'react';
import { FiMinus, FiPlus, FiStar } from 'react-icons/fi';
import { MdKeyboardArrowRight } from 'react-icons/md'; // Dùng icon mũi tên cho breadcrumb
import './ProductDetailPage.scss';
import { Link } from 'react-router-dom';

export default function ProductDetailPage() {
  const [selectedSubscription, setSelectedSubscription] = useState('6 tháng');
  const [quantity, setQuantity] = useState(1);

  const product = {
    id: 1,
    name: 'One Life Graphic T-shirt',
    rating: 4.5,
    reviews: 5,
    price: 260,
    originalPrice: 300,
    discount: -40,
    description: 'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
    subscriptions: ['1 tháng', '3 tháng', '6 tháng', '12 tháng'],
    image: '/images/product-detail.jpg',
  };

  const relatedProducts = [
    { id: 1, name: 'Box Dâu', subtitle: 'Theo dõi chu kỳ', image: '/images/box-1.jpg' },
    { id: 2, name: 'Box Dâu', subtitle: 'Theo dõi chu kỳ', image: '/images/box-2.jpg' },
    { id: 3, name: 'Box Dâu', subtitle: 'Theo dõi chu kỳ', image: '/images/box-3.jpg' },
    { id: 4, name: 'Box Dâu', subtitle: 'Theo dõi chu kỳ', image: '/images/box-4.jpg' },
  ];

  const updateQuantity = (newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="product-detail-breadcrumb">
        <a href="/">Home</a>
        <MdKeyboardArrowRight />
        <a href="/shop">Shop</a>
        <MdKeyboardArrowRight />
        <a href="/men">Men</a>
        <MdKeyboardArrowRight />
        <span className="product-detail-breadcrumb-active">T-shirts</span>
      </div>

      <div className="product-detail-container">
        <div className="product-detail-content">
          {/* Product Image */}
          <div className="product-detail-image-section">
            <img src={product.image} alt={product.name} className="product-detail-main-image" />
          </div>

          {/* Product Details */}
          <div className="product-detail-info-section">
            <h1 className="product-detail-title">{product.name}</h1>
            
            <div className="product-detail-rating">
              <div className="product-detail-stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`product-detail-star ${i < Math.floor(product.rating) ? 'product-detail-star-filled' : ''}`}
                  />
                ))}
              </div>
              <span className="product-detail-rating-text">{product.rating}/5</span>
            </div>

            <div className="product-detail-price-section">
              <span className="product-detail-current-price">${product.price}</span>
              <span className="product-detail-original-price">${product.originalPrice}</span>
              <span className="product-detail-discount">{product.discount}%</span>
            </div>

            <hr className="product-detail-divider" />

            <p className="product-detail-description">{product.description}</p>

            <div className="product-detail-subscription">
              <label className="product-detail-subscription-label">Đăng ký định kỳ</label>
              <div className="product-detail-subscription-options">
                {product.subscriptions.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubscription(sub)}
                    className={`product-detail-subscription-btn ${selectedSubscription === sub ? 'product-detail-subscription-btn-active' : ''}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <hr className="product-detail-divider" />

            <div className="product-detail-actions">
              <div className="product-detail-quantity">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  className="product-detail-quantity-btn"
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
                  onClick={() => updateQuantity(quantity + 1)}
                  className="product-detail-quantity-btn"
                >
                  <FiPlus />
                </button>
              </div>
              <button className="product-detail-add-to-cart">Thêm vào giỏ hàng</button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="product-detail-related-section">
          <div className="product-detail-related-header">
            <h2 className="product-detail-related-title">Sản phẩm có trong Box</h2>
            <Link to="/box-customize" className="product-detail-related-customize">Tuỳ chỉnh</Link>
          </div>

          <div className="product-detail-related-grid">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="product-detail-related-card">
                <div className="product-detail-related-image">
                  <img src={relatedProduct.image} alt={relatedProduct.name} />
                </div>
                <div className="product-detail-related-info">
                  <p className="product-detail-related-subtitle">{relatedProduct.subtitle}</p>
                  <h4 className="product-detail-related-name">{relatedProduct.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}