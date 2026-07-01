import React from 'react';
import './QRPayment.scss';

export default function QRPayment() {
  return (
    // Thêm background-image chứa logo ngân hàng/ví điện tử của ông vào class này nhé
    <div className="herdays-qrpayment-wrapper">
      <div className="herdays-qrpayment-container">
        
        {/* ==========================================
            KHU VỰC CHÍNH: CHIA 2 CỘT
            ========================================== */}
        <div className="herdays-qrpayment-main">
          
          {/* CỘT TRÁI: THÔNG TIN THANH TOÁN */}
          <div className="herdays-qrpayment-left">
            <div className="herdays-qrpayment-header">
              <div className="herdays-qrpayment-wallet-icon">👛</div>
              <h1 className="herdays-qrpayment-title">Thanh toán đơn hàng</h1>
              <p className="herdays-qrpayment-subtitle">Quét mã QR để thanh toán đơn hàng của bạn</p>
            </div>

            <div className="herdays-qrpayment-amount-card">
              <p className="herdays-qrpayment-amount-label">Số tiền thanh toán</p>
              <h2 className="herdays-qrpayment-amount-value">500.000đ</h2>
              <div className="herdays-qrpayment-content-box">
                <p>Nội dung chuyển khoản</p>
                <strong>HD2478 - Thanh toán đơn hàng</strong>
              </div>
            </div>

            <div className="herdays-qrpayment-details">
              <div className="herdays-qrpayment-detail-row">
                <span className="icon">🏦</span>
                <span className="label">Ngân hàng</span>
                <span className="value"><strong>TPBank</strong> - Ngân hàng Tiên Phong</span>
              </div>
              <div className="herdays-qrpayment-detail-row">
                <span className="icon">💳</span>
                <span className="label">Số tài khoản</span>
                <span className="value"><strong>1903 8678 9999</strong></span>
              </div>
              <div className="herdays-qrpayment-detail-row">
                <span className="icon">👤</span>
                <span className="label">Chủ tài khoản</span>
                <span className="value"><strong>CÔNG TY TNHH HERDAYS</strong></span>
              </div>
              <div className="herdays-qrpayment-detail-row">
                <span className="icon">📝</span>
                <span className="label">Nội dung CK</span>
                <span className="value">HD2478 - Thanh toán đơn hàng</span>
                <button className="herdays-qrpayment-copy-btn" title="Copy">📄</button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: MÃ QR & COUNTDOWN */}
          <div className="herdays-qrpayment-right">
            <div className="herdays-qrpayment-qr-card">
              <p className="herdays-qrpayment-qr-instruction">
                Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử
              </p>
              
              <div className="herdays-qrpayment-qr-image-wrapper">
                {/* Thay ảnh mã QR thật của ông vào đây */}
                <img 
                  src="https://via.placeholder.com/200x200?text=QR+Code" 
                  alt="QR Code" 
                  className="herdays-qrpayment-qr-img" 
                />
              </div>

              <div className="herdays-qrpayment-timer-section">
                <p>Mã QR sẽ hết hạn sau</p>
                <div className="herdays-qrpayment-timer-countdown">09 : 58</div>
              </div>

              <div className="herdays-qrpayment-manual-text">
                Hoặc chuyển khoản thủ công
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            KHU VỰC DƯỚI: HƯỚNG DẪN THANH TOÁN
            ========================================== */}
        <div className="herdays-qrpayment-instructions">
          <h3 className="herdays-qrpayment-inst-title">Hướng dẫn thanh toán</h3>
          
          <div className="herdays-qrpayment-steps">
            <div className="herdays-qrpayment-step-item">
              <div className="step-icon">📱</div>
              <div className="step-text">
                <strong>Bước 1</strong>
                <p>Mở ứng dụng ngân hàng hoặc ví điện tử</p>
              </div>
            </div>
            
            <div className="herdays-qrpayment-step-item">
              <div className="step-icon">🔳</div>
              <div className="step-text">
                <strong>Bước 2</strong>
                <p>Quét mã QR hoặc chuyển khoản thủ công</p>
              </div>
            </div>
            
            <div className="herdays-qrpayment-step-item">
              <div className="step-icon">✅</div>
              <div className="step-text">
                <strong>Bước 3</strong>
                <p>Xác nhận thanh toán và chờ xử lý đơn hàng</p>
              </div>
            </div>
            
            <div className="herdays-qrpayment-step-item warning-step">
              <div className="step-icon">🎧</div>
              <div className="step-text">
                <strong>Bạn chưa thanh toán?</strong>
                <p>Đơn hàng sẽ được hủy tự động sau khi mã QR hết hạn.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}