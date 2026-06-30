import React, { useState } from "react";
import {
  FaStar,
  FaChevronRight,
  FaChevronLeft,
  FaPlus,
  FaEnvelope,
} from "react-icons/fa";
import "./HomePage.scss";
import logomau from "../../assets/home/logo_mau.png";
import expertBg from "../../assets/home/expert_background_card.png";

const HomePage = () => {
  const [subscriptionIndex, setSubscriptionIndex] = useState(0);
  const [expertsIndex, setExpertsIndex] = useState(0);

  const subscriptionBoxes = [
    { id: 1, name: "Box Đầu", category: "Theo dõi chu kỳ", price: "363.638 đ" },
    { id: 2, name: "Box Bầu 1", category: "Đặc mang thai", price: "363.638 đ" },
    { id: 3, name: "Box Bầu 2", category: "Đặc mang thai", price: "363.638 đ" },
    {
      id: 4,
      name: "Box Cá Nhân Hóa",
      category: "Marketplace",
      price: "363.638 đ",
    },
  ];

  const experts = [
    {
      id: 1,
      name: "ThS.BS Nguyễn Hộng Vũ",
      title: "Bác Sỹ",
      experience:
        "Thạc sĩ Sản Phụ khoa ĐH Y Dược TP.HCM. Bác sĩ thực hành sản phụ khoa tại Bệnh viện Từ Dũ với chuyên môn sâu về phẫu thuật nội soi và siêu âm.",
    },
    {
      id: 2,
      name: "BS. Trần Văn Minh",
      title: "Bác Sỹ",
      experience: "Có hơn 20 năm kinh nghiệm...",
    },
    {
      id: 3,
      name: "Phương Thúy Tâm",
      title: "Bác Sỹ",
      experience: "Có hơn 20 năm kinh nghiệm...",
    },
  ];

  const handleSubscriptionPrev = () => {
    setSubscriptionIndex((prev) =>
      prev === 0 ? subscriptionBoxes.length - 1 : prev - 1,
    );
  };

  const handleSubscriptionNext = () => {
    setSubscriptionIndex((prev) =>
      prev === subscriptionBoxes.length - 1 ? 0 : prev + 1,
    );
  };

  const handleExpertsPrev = () => {
    setExpertsIndex((prev) => (prev === 0 ? experts.length - 1 : prev - 1));
  };

  const handleExpertsNext = () => {
    setExpertsIndex((prev) => (prev === experts.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Đồng Hành Cùng Sức Khỏe Phụ Nữ Bằng Công Nghệ AI
          </h1>
          <p className="hero-description">
            Nền tảng ứng dụng AI giúp bạn thấu hiểu cơ thể, chủ động theo dõi
            chu kỳ, chuẩn bị mang thai và quản lý lộ trình thai kỳ hiệu quả.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-left">
            <div className="features-logo">
              <img src={logomau} alt="Logo" />
            </div>
            <h2 className="features-title">
              Lí do nên
              <br />
              chọn <span className="dancing-text">HerDays</span>
            </h2>
          </div>
          <div className="features-right">
            <div className="feature-card">
              <h3 className="feature-card-title">Cá nhân hóa bằng AI</h3>
              <p className="feature-card-description">
                Hệ thống tự động phân tích dữ liệu sức khỏe và đưa ra các gợi ý
                chăm sóc, thực đơn dinh dưỡng phù hợp riêng cho từng cá nhân.
              </p>
              <a href="#" className="feature-link">
                Tìm hiểu thêm <FaChevronRight className="feature-link-icon" />
              </a>
            </div>
            <div className="feature-card">
              <h3 className="feature-card-title">Dự đoán hành trình</h3>
              <p className="feature-card-description">
                Giải pháp toàn diện đáp ứng mọi nhu cầu từ theo dõi chu kỳ kinh
                nguyệt, lên kế hoạch thụ thai, quản lý thai kỳ cho đến lộ trình
                IVF chuyên sâu.
              </p>
              <a href="#" className="feature-link">
                Tìm hiểu thêm <FaChevronRight className="feature-link-icon" />
              </a>
            </div>
            <div className="feature-card">
              <h3 className="feature-card-title">Marketplace tiện ích</h3>
              <p className="feature-card-description">
                Cung cấp mô hình Subscription Box giúp người dùng chủ động lựa
                chọn sản phẩm wellness, vitamin và đồ self-care theo nhu cầu
                thực tế
              </p>
              <a href="#" className="feature-link">
                Tìm hiểu thêm <FaChevronRight className="feature-link-icon" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Box Section */}
      <section className="subscription-section">
        <div className="subscription-header">
          <h2 className="subscription-title">Herdays Subscription Box</h2>
          <p className="subscription-description">
            Các Subscription Box được cá nhân hóa dựa trên tính trạng sức khỏe
            của người dùng
          </p>
        </div>
        <div className="subscription-carousel">
          <button
            className="carousel-button prev"
            onClick={handleSubscriptionPrev}
          >
            <FaChevronLeft />
          </button>
          <div className="subscription-cards">
            {subscriptionBoxes.map((box, index) => (
              <div
                key={box.id}
                className={`subscription-card ${index === subscriptionIndex ? "active" : ""}`}
              >
                <div className="subscription-card-image">
                  <img
                    src={`https://placehold.co/200x200/ED77A5/FFFFFF?text=${box.name}`}
                    alt={box.name}
                  />
                </div>
                <div className="subscription-card-content">
                  <p className="subscription-card-category">{box.category}</p>
                  <h3 className="subscription-card-title">{box.name}</h3>
                  <div className="subscription-card-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="star-icon" />
                    ))}
                  </div>
                  <p className="subscription-card-price">{box.price}</p>
                  <button className="subscription-card-button">
                    <FaPlus />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            className="carousel-button next"
            onClick={handleSubscriptionNext}
          >
            <FaChevronRight />
          </button>
        </div>
        <div className="subscription-footer">
          <a href="#" className="subscription-link">
            Tìm hiểu thêm →
          </a>
        </div>
      </section>

      {/* Experts Section */}
      <section className="experts-section">
        <div className="experts-header">
          <p className="experts-label">KẾT NỐI VỚI CHUYÊN GIA</p>
          <h2 className="experts-title">
            Chuyên Gia Y Tế Hàng Đầu Tại HerDays
          </h2>
        </div>
        <div className="experts-carousel">
          <button className="carousel-button prev" onClick={handleExpertsPrev}>
            <FaChevronLeft />
          </button>
          <div className="experts-cards">
            {experts.map((expert, index) => (
              <div
                key={expert.id}
                className={`expert-card ${index === expertsIndex ? "active" : ""}`}
              >
                <div className="expert-card-background">
                  <img src={expertBg} alt="Expert Background" />
                </div>
                <div className="expert-card-avatar">
                  <img
                    src="https://placehold.co/100x100/ED77A5/FFFFFF?text=Avatar"
                    alt={expert.name}
                  />
                </div>
                <div className="expert-card-content">
                  <h3 className="expert-card-name">{expert.name}</h3>
                  <p className="expert-card-title">{expert.title}</p>
                  <p className="expert-card-experience">{expert.experience}</p>
                  <div className="expert-card-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="star-icon" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-button next" onClick={handleExpertsNext}>
            <FaChevronRight />
          </button>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="herbot-section">
        <div className="herbot-container">
          <div className="herbot-image">
            <img
              src="https://placehold.co/400x400/FFF5F8/ED77A5?text=HerbotAI+Robot"
              alt="HerbotAI Robot"
            />
          </div>
          <div className="herbot-content">
            <p className="herbot-label">HERBOTAI</p>
            <h2 className="herbot-title">
              TRỢ LÝ THÔNG MINH{" "}
              <span className="herbot-highlight">HERBOTAI</span>
            </h2>
            <p className="herbot-description">
              AI Chatbot của HerDays được phát triển nhằm hỗ trợ giải đáp các
              thắc mắc cơ bản về sức khỏe phụ nữ, chu kỳ kinh nguyệt, mang thai
              và chăm sóc bản thân. Không chỉ vậy, AI còn tự động phân tích dữ
              liệu cá nhân để đưa ra các gợi ý chăm sóc phù hợp và nhắc nhở
              những mốc thời gian quan trọng
            </p>
            <a href="#" className="herbot-link">
              Khám phá ngay
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter & App Download Section */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-box">
            <h3 className="newsletter-title">Luôn Cập Nhật</h3>
            <p className="newsletter-description">
              Nhận những tin tức mới nhất về sức khỏe, khuyến cáo từ chuyên gia,
              và các chương trình khuyến mãi từ HerDays
            </p>
            <div className="newsletter-input-wrapper">
              <FaEnvelope className="newsletter-icon" />
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                className="newsletter-input"
              />
              <button className="newsletter-button">Gửi</button>
            </div>
          </div>
          <div className="app-promo-box">
            <div className="app-promo-content">
              <h3 className="app-promo-title">
                Sức khỏe của bạn, ưu tiên của chúng tôi
              </h3>
              <p className="app-promo-description">
                Tải ứng dụng HerDays để trải nghiệm những tính năng tuyệt vời
              </p>
              <div className="app-store-buttons">
                <img
                  src="https://placehold.co/150x50/000000/FFFFFF?text=Google+Play"
                  alt="Google Play"
                  className="app-store-button"
                />
                <img
                  src="https://placehold.co/150x50/000000/FFFFFF?text=App+Store"
                  alt="App Store"
                  className="app-store-button"
                />
              </div>
            </div>
            <div className="app-promo-image">
              <img
                src="https://placehold.co/200x300/FFF5F8/ED77A5?text=Mobile+App"
                alt="Mobile App"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
