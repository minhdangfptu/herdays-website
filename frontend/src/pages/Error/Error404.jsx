import React from 'react';
import './Error404.scss';
import notFoundImg from '../../assets/Error404.png';
import { Link } from 'react-router-dom';
// Nhớ import cái ảnh của ông vào đây nhé, ví dụ:
// import notFoundImg from '../../assets/404-image.png';

export default function Error404() {
  return (
    <div className="herdays-404-page">
      <div className="herdays-404-container">
        <h1 className="herdays-404-title">404</h1>
        <p className="herdays-404-subtitle">OOPS, Bạn đi lạc rồi!</p>

        <div className="herdays-404-image-wrapper">
          <img 
            src={notFoundImg} 
            alt="Page Not Found" 
            className="herdays-404-image" 
          />
        </div>

        {/* Nếu ông dùng react-router-dom thì thay thẻ <a> bằng thẻ <Link to="/"> nhé */}
        <Link to="/" className="herdays-404-back-link">
          <span className="herdays-404-back-icon">↩</span> Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}