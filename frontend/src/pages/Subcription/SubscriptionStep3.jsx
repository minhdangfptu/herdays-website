import React from 'react';
import { FaCheck } from 'react-icons/fa';
import './Subscription.scss';

const SubscriptionStep3 = () => {
  const plans = [
    {
      id: 1,
      name: 'Premium - 1',
      price: 59000,
      duration: '1tháng',
      description: 'Giải pháp chăm sóc sức khỏe chuyên sâu và toàn diện.',
      features: [
        'Mọi thứ của gói miễn phí',
        'Truy lực AI chuyên sâu không giới hạn',
        'Báo cáo y khoa năng cao',
        'Kết nối chuyên gia',
        'Để xuất thông minh',
        'Cá nhân hoá hỗ số người dùng'
      ]
    },
    {
      id: 2,
      name: 'Premium - 2',
      price: 177000,
      duration: '3 tháng',
      description: 'Giải pháp chăm sóc sức khỏe chuyên sâu và toàn diện.',
      features: [
        'Mọi thứ của gói miễn phí',
        'Truy lực AI chuyên sâu không giới hạn',
        'Báo cáo y khoa năng cao',
        'Kết nối chuyên gia',
        'Để xuất thông minh',
        'Cá nhân hoá hỗ số người dùng'
      ]
    },
    {
      id: 3,
      name: 'Premium - 3',
      price: 354000,
      duration: '6 tháng',
      description: 'Giải pháp chăm sóc sức khỏe chuyên sâu và toàn diện.',
      features: [
        'Mọi thứ của gói miễn phí',
        'Truy lực AI chuyên sâu không giới hạn',
        'Báo cáo y khoa năng cao',
        'Kết nối chuyên gia',
        'Để xuất thông minh',
        'Cá nhân hoá hỗ số người dùng'
      ]
    },
    {
      id: 4,
      name: 'Premium - 4',
      price: 708000,
      duration: '12 tháng',
      description: 'Giải pháp chăm sóc sức khỏe chuyên sâu và toàn diện.',
      features: [
        'Mọi thứ của gói miễn phí',
        'Truy lực AI chuyên sâu không giới hạn',
        'Báo cáo y khoa năng cao',
        'Kết nối chuyên gia',
        'Để xuất thông minh',
        'Cá nhân hoá hỗ số người dùng'
      ]
    }
  ];

  return (
    <div className="sub-step3">
      <div className="sub-step3-container">
        <div className="sub-step3-header">
          <h1 className="sub-step3-title">Giới thiệu các gói Premium</h1>
          <p className="sub-step3-subtitle">
            Từ phân tích và dự báo chuyên sâu từ Trợ lý AI, lưu trữ dữ liệu cho đến xuất báo cáo y khoa không giới hạn.<br />
            Huy bắt cứ lực nào.
          </p>
        </div>

        <div className="sub-step3-cards">
          {plans.map((plan) => (
            <div key={plan.id} className="sub-step3-card">
              <div className="sub-step3-card-header">
                <h3 className="sub-step3-plan-name">{plan.name}</h3>
              </div>

              <div className="sub-step3-plan-price">
                <span className="sub-step3-price-number">
                  {plan.price.toLocaleString('vi-VN')}
                </span>
                <span className="sub-step3-price-unit">VND/{plan.duration}</span>
              </div>

              <p className="sub-step3-plan-desc">{plan.description}</p>

              <button className="sub-step3-plan-btn">Đăng ký ngay</button>

              <ul className="sub-step3-features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="sub-step3-feature-item">
                    <FaCheck className="sub-step3-feature-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <p className="sub-step3-plan-footer">
                Luôn luôn tuân thủ tất cả quy định <span className="sub-step3-footer-link">pháp lý</span> và <span className="sub-step3-footer-link">thỏa thuận người dùng</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStep3;
