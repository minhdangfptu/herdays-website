import React, { useState } from 'react';
import { FaFacebookMessenger, FaTimes } from 'react-icons/fa';
import './MessengerButton.scss';
import logo from '../assets/logo_2.png';
export default function MessengerButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="messenger-wrapper">
      {/* Khung Pop-up chat */}
      {isOpen && (
        <div className="messenger-popup">
          <div className="popup-header">
            <div className="header-info">
              {/* Bồ nhớ thay link ảnh logo của dự án vào đây nha */}
              <img src={logo} alt="HerDays" className="page-avatar" />
              <div className="page-details">
                <h4>HerDays</h4>
                <p>Thường trả lời ngay lập tức</p>
              </div>
            </div>
          </div>
          
          <div className="popup-body">
            <div className="chat-bubble">
              Xin chào! <br/>
              HerDays có thể giúp gì cho bạn hôm nay?
            </div>
          </div>
          
          <div className="popup-footer">
            <a 
              href="https://m.me/herdaysvn" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="start-chat-btn"
            >
              <FaFacebookMessenger className="btn-icon" />
              Chat trên Messenger
            </a>
          </div>
        </div>
      )}

      {/* Nút bấm tròn lơ lửng */}
      <button 
        className="messenger-fab" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở khung chat"
      >
        {isOpen ? <FaTimes /> : <FaFacebookMessenger />}
      </button>
    </div>
  );
}