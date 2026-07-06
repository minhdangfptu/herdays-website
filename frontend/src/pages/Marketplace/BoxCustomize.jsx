'use client';

import React, { useState } from 'react';
import { MdKeyboardArrowRight } from 'react-icons/md';
import './BoxCustomize.scss';

export default function BoxCustomize() {
  // Mock data dựa theo ảnh thiết kế
  const mockProducts = [
    { id: 1, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 1', tag: 'PK1', image: '/images/nan-milk.jpg' },
    { id: 2, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 1', tag: 'PK1', image: '/images/nan-milk.jpg' },
    { id: 3, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 1', tag: 'PK1', image: '/images/nan-milk.jpg' },
    { id: 4, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 1', tag: 'PK1', image: '/images/nan-milk.jpg' },
    { id: 5, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 2', tag: 'PK2', image: '/images/nan-milk.jpg' },
    { id: 6, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 2', tag: 'PK2', image: '/images/nan-milk.jpg' },
    { id: 7, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 2', tag: 'PK2', image: '/images/nan-milk.jpg' },
    { id: 8, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 2', tag: 'PK2', image: '/images/nan-milk.jpg' },
    { id: 9, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 3', tag: 'PK3', image: '/images/nan-milk.jpg' },
    { id: 10, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 3', tag: 'PK3', image: '/images/nan-milk.jpg' },
    { id: 11, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 3', tag: 'PK3', image: '/images/nan-milk.jpg' },
    { id: 12, name: 'Sữa Nan cho bà bầu', price: 1000000, category: 'Phân khúc 3', tag: 'PK3', image: '/images/nan-milk.jpg' },
  ];

  // Group sản phẩm theo phân khúc
  const groupedProducts = mockProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  // State quản lý giỏ hàng tạm thời
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleProduct = (product) => {
    const isSelected = selectedItems.some((item) => item.id === product.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter((item) => item.id !== product.id));
    } else {
      setSelectedItems([...selectedItems, product]);
    }
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="box-customize-page">
      <div className="box-customize-container">
        
        {/* Breadcrumb */}
        <div className="box-breadcrumb">
          <a href="/">Trang chủ</a>
          <MdKeyboardArrowRight />
          <a href="/shop">Cửa hàng</a>
          <MdKeyboardArrowRight />
          <span className="box-breadcrumb-active">HerDays Box của bạn</span>
        </div>

        {/* Header */}
        <div className="box-header">
          <h1 className="box-title">HerDays Box của bạn</h1>
          <p className="box-subtitle">Thêm sản phẩm từ marketplace để bắt đầu nhé</p>
        </div>

        {/* Main Selection Area */}
        <div className="box-selection-card">

          <div className="selection-card-body">
            {Object.keys(groupedProducts).map((category, index) => (
              <div key={category} className="category-section">
                
                {/* Divider có chữ ở giữa */}
                <div className="category-divider">
                  <span>{category}</span>
                </div>

                <div className="product-grid">
                  {groupedProducts[category].map((product) => {
                    const isSelected = selectedItems.some((item) => item.id === product.id);
                    return (
                      <div 
                        key={product.id} 
                        className={`product-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleProduct(product)}
                      >
                        <div className="product-image">
                          <img src={product.image} alt={product.name} />
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{product.name}</h3>
                          <div className="product-meta">
                            {/* <span className="product-price">
                              {product.price.toLocaleString('vi-VN')}đ
                            </span> */}
                            <span className="product-tag">{product.tag}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky-bottom-bar">
        <div className="bar-content">
          <div className="bar-left">
            <span className="bar-title">Box bầu cá nhân hoá</span>
            <span className="bar-price">{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          
          <div className="bar-right">
            <span className="bar-count">Đã chọn {selectedItems.length} sản phẩm</span>
            <button className="bar-checkout-btn">Mua ngay</button>
          </div>
        </div>
      </div>
    </div>
  );
}