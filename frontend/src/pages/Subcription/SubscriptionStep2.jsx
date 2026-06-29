import { Check, Users } from "lucide-react";
import "./Subscription.scss";
import { useNavigate } from "react-router-dom";
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
  "Đề xuất thông minh",
  "Cá nhân hoá hồ sơ người dùng",
];

const SubscriptionStep2 = () => {
  const navigate = useNavigate();
  const handleUpgrade = () => {
    navigate("/upgrade-account/complete");
  };
  return (
    <section className="sub-step2">
      <div className="sub-step2-container">
        {/* Header */}
        <div className="sub-step2-header">
          <h1 className="sub-step2-title">Giới thiệu các gói Premium</h1>
          <p className="sub-step2-subtitle">
            Từ phân tích và dự báo chuyên sâu từ Trợ lý AI, lưu trữ dữ liệu cho
            đến xuất báo cáo y khoa không giới hạn.
            <br />
            Hủy bất cứ lúc nào.
          </p>
        </div>

        {/* Pricing Cards — horizontal layout */}
        <div className="sub-pricing-cards">

          {/* Free Plan Card */}
          <div className="sub-plan-card sub-plan-card--free">
            {/* Left: plan info */}
            <div className="sub-plan-card__info">
              <h2 className="sub-plan-name">Miễn phí</h2>
              <div className="sub-plan-price">
                <span className="sub-plan-price__number">0</span>
                <span className="sub-plan-price__unit">VND/tháng</span>
              </div>
              <p className="sub-plan-desc">
                Trải nghiệm các tính năng sức khoẻ hoàn toàn miễn phí
              </p>
              <button className="sub-plan-btn sub-plan-btn--current">
                Gói hiện tại
              </button>
            </div>

            {/* Right: features */}
            <ul className="sub-features">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="sub-features__item">
                  <Check size={20} className="sub-features__icon" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <p className="sub-plan-footer">
              Bạn đã đăng ký gói? Xem trợ giúp thanh toán{" "}
              <a href="#" className="sub-plan-footer__link">tại đây</a>
            </p>
          </div>

          {/* Premium Plan Card */}
          <div className="sub-plan-card sub-plan-card--premium">
            {/* Left: plan info */}
            <div className="sub-plan-card__info">
              <h2 className="sub-plan-name">
                Premium <span className="sub-plan-badge">Popular</span>
              </h2>
              <p className="sub-plan-subtitle">Chỉ với</p>
              <div className="sub-plan-price">
                <span className="sub-plan-price__number">59.000</span>
                <span className="sub-plan-price__unit">VND/tháng</span>
              </div>
              <p className="sub-plan-desc">
                Giải pháp chăm sóc sức khỏe chuyên sâu và toàn diện.
              </p>
              <button className="sub-plan-btn sub-plan-btn--premium" onClick={handleUpgrade}>
                Tìm hiểu chi tiết
              </button>
            </div>

            {/* Right: features */}
            <ul className="sub-features sub-features--premium">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="sub-features__item">
                  <Check size={20} className="sub-features__icon sub-features__icon--premium" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <p className="sub-plan-footer">
              Luôn tuân thủ các quy định{" "}
              <a href="#" className="sub-plan-footer__link">pháp lý và thoả thuận người dùng</a>
            </p>
          </div>

        </div>

        {/* CTA Section */}
        <div className="sub-cta">
          <div className="sub-cta__icon">
            <Users size={48} color="#000000" />
          </div>
          <h3 className="sub-cta__title">
            Bạn cần tìm hiểu thêm về các gói dịch vụ nâng cao?{" "}
            <br />
            Xem <a href="#" className="sub-cta__link">Các gói dịch vụ</a>
          </h3>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionStep2;
