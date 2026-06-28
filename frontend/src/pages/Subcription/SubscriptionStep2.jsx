import React from "react";
import { Check, Users } from "lucide-react"; // Đã thêm Users icon
import "./Subscription.scss";

const SubscriptionStep2 = () => {
  const freeFeatures = [
    "Theo dõi toàn diện tiêu chuẩn",
    "Nhật ký sức khỏe hằng ngày",
    "Cẩm nang y khoa khoá, hệ thống bài viết kiến thức",
    "Cửa hàng tiện ích cá nhân hoá",
    "Trợ lý AI giới hạn",
  ];

  const premiumFeatures = [
    "Mọi thứ của gói miễn phí",
    "Trợ lý AI chuyên sâu không giới hạn",
    "Báo cáo y khoa nâng cao",
    "Kết nối chuyên gia",
    "Đề xuất thông minh", // Đã sửa lỗi typo "Dự xuất" -> "Đề xuất" theo design
    "Cá nhân hoá hồ sơ người dùng",
  ];

  return (
    <section className="subscription-step2">
      <div className="subscription-step2-container">
        {/* Header */}
        <div className="subscription-header">
          <h1 className="subscription-step2-title">
            Giới thiệu các gói Premium
          </h1>
          <p className="subscription-step2-subtitle">
            Từ phân tích và dự báo chuyên sâu từ Trợ lý AI, lưu trữ dữ liệu cho
            đến xuất báo cáo y khoa không giới hạn.
            <br />
            Hủy bất cứ lúc nào.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards">
          {/* Free Plan Card */}
          <div className="pricing-card free-card">
            <h2 className="plan-name">Miễn phí</h2>
            <div className="plan-price">
              <span className="price-number">0</span>
              <span className="price-unit">VND/tháng</span>
            </div>
            <p className="plan-description">
              Trải nghiệm các tính năng theo dõi sức khỏe cốt lõi hoàn toàn miễn
              phí
            </p>
            <button className="plan-button current-plan">
              Gói hiện tại của bạn
            </button>

            <ul className="features-list">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="feature-item">
                  <Check size={20} className="feature-icon" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <p className="plan-footer">
              Bạn đã đăng ký gói? Xem trợ giúp thanh toán{" "}
              <a href="#" className="link">
                tại đây
              </a>
            </p>
          </div>

          {/* Premium Plan Card */}
          <div className="pricing-card premium-card">
            <h2 className="plan-name">
              Premium <span className="premium-badge-inline">Popular</span>
            </h2>
            <p className="plan-subtitle">Chỉ với</p>
            <div className="plan-price premium-price">
              <span className="price-number">59.000</span>
              <span className="price-unit">VND/tháng</span>
            </div>
            <p className="premium-description">
              Giải pháp chăm sóc sức khỏe chuyên sâu và toàn diện.
            </p>
            <button className="plan-button premium-button">
              Tìm hiểu chi tiết
            </button>

            <ul className="features-list premium-features">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="feature-item">
                  <Check size={20} className="feature-icon premium-icon" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <p className="plan-footer">
              Luôn tuân thủ các quy định{" "}
              <a href="#" className="link">
                pháp lý và thoả thuận người dùng
              </a>
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-icon">
            <Users size={48} color="#000000" />
          </div>
          <h3 className="cta-title">
            Bạn cần tìm hiểu thêm về các gói dịch vụ nâng cao? <br />
            Xem{" "}
            <a href="#" className="cta-link">
              Các gói dịch vụ
            </a>
          </h3>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionStep2;
