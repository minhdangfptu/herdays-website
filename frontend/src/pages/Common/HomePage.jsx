import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaStar,
  FaChevronRight,
  FaChevronLeft,
  FaPlus,
  FaEnvelope,
} from "react-icons/fa";
import { Skeleton } from "../../components/Skeleton.jsx";
import "./HomePage.scss";
import logomau from "../../assets/home/logo_mau.png";
import custom from "../../assets/home/box/custom.png";
import expertBg from "../../assets/home/expert_background_card.png";
import nhv from "../../assets/home/nhv.png";
import pht from "../../assets/home/pht.png";
import tvm from "../../assets/home/tvm.png";
import nvt from "../../assets/home/nvt.jpg";
import herbotAi from "../../assets/home/herbot_ai.png";
import contactImg from "../../assets/home/contact.png";
import { hasAuthSession, marketplaceApi } from "../../services/apiService.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getBoxName = (box) => box.boxName || box.name || "Subscription Box";

const getBoxImage = (box) =>
  box.thumbnail ||
  box.image ||
  `https://placehold.co/480x480/f8c4d8/ffffff?text=${encodeURIComponent(getBoxName(box))}`;

const HomePage = () => {
  const navigate = useNavigate();
  const expertsRef = useRef(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscriptionBoxes, setSubscriptionBoxes] = useState([]);
  const [subscriptionBoxesLoading, setSubscriptionBoxesLoading] = useState(true);

  const requireAuth = (target) => {
    if (!hasAuthSession()) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return false;
    }
    if (target) navigate(target);
    return true;
  };

  const handleNewsletterSubmit = () => {
    if (!newsletterEmail.trim()) return;
    navigate(`/contact-us?email=${encodeURIComponent(newsletterEmail.trim())}`);
    setNewsletterEmail("");
  };

  useEffect(() => {
    let isMounted = true;

    marketplaceApi
      .listBoxes({ limit: 4 })
      .then((result) => {
        if (isMounted) setSubscriptionBoxes(result.items || []);
      })
      .catch(() => {
        if (isMounted) setSubscriptionBoxes([]);
      })
      .finally(() => {
        if (isMounted) setSubscriptionBoxesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const experts = [
    {
      id: 1,
      name: "ThS.BS.Nguyễn Hoàng Vũ",
      avatar: nhv,
      title: "Chuyên khoa Sản Phụ Khoa",
      experience:
        "Thạc sĩ Sản Phụ khoa ĐH Y Dược TP.HCM. Bác sĩ thực hành sản phụ khoa tại Bệnh viện Từ Dũ với chuyên môn chuyên sâu về phẫu thuật nội soi và siêu âm.",
    },
    {
      id: 2,
      name: "BS. Trần Văn Minh",
      avatar: tvm,
      title: "Chuyên khoa Sản Phụ Khoa",
      experience:
        "Công tác tại Bệnh viện Đa khoa Phương Đông. Phong cách làm việc nhẹ nhàng, tận tâm và luôn lắng nghe để mang đến sự yên tâm và thoải mái nhất cho người bệnh.",
    },
    {
      id: 3,
      name: "BS. Nguyễn Văn Tùng",
      avatar: nvt,
      title: "Chuyên khoa Sản Phụ Khoa",
      experience:
        "Với phong cách tư vấn nhẹ nhàng, hiện đại và cực kỳ tâm lý, bác sĩ Tùng luôn giúp chị em cảm thấy thoải mái, an tâm như đang trò chuyện với một người bạn thân.",
    },
    {
      id: 4,
      name: "BS. Phùng Huy Tuân",
      avatar: pht,
      title: "Chuyên gia Hỗ trợ sinh sản (IVF)",
      experience:
        "Hơn hai thập kỷ cống hiến hiện thực hóa giấc mơ làm cha mẹ. Luôn sẵn sàng lắng nghe, thấu hiểu, chia sẻ và nâng đỡ tinh thần cho các cặp vợ chồng hiếm muộn.",
    },
  ];

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Chăm sóc sức khoẻ <br /> phái đẹp bằng công nghệ AI
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
              chọn <span className="lamoric-text">HerDays</span>
            </h2>
          </div>
          <div className="features-right">
            <div className="feature-card">
              <h3 className="feature-card-title">Cá nhân hóa bằng AI</h3>
              <p className="feature-card-description">
                Hệ thống tự động phân tích dữ liệu sức khỏe và đưa ra các gợi ý
                chăm sóc, thực đơn dinh dưỡng phù hợp riêng cho từng cá nhân.
              </p>
              <button
                type="button"
                className="feature-link"
                onClick={() => requireAuth("/chat-with-herbot")}
              >
                Tìm hiểu thêm <FaChevronRight className="feature-link-icon" />
              </button>
            </div>
            <div className="feature-card">
              <h3 className="feature-card-title">Dự đoán hành trình</h3>
              <p className="feature-card-description">
                Giải pháp toàn diện đáp ứng mọi nhu cầu từ theo dõi chu kỳ kinh
                nguyệt, lên kế hoạch thụ thai, quản lý thai kỳ cho đến lộ trình
                IVF chuyên sâu.
              </p>
              <button
                type="button"
                className="feature-link"
                onClick={() => requireAuth("/tools")}
              >
                Tìm hiểu thêm <FaChevronRight className="feature-link-icon" />
              </button>
            </div>
            <div className="feature-card">
              <h3 className="feature-card-title">Marketplace tiện ích</h3>
              <p className="feature-card-description">
                Cung cấp mô hình Subscription Box giúp người dùng chủ động lựa
                chọn sản phẩm wellness, vitamin và đồ self-care theo nhu cầu
                thực tế
              </p>
              <button
                type="button"
                className="feature-link"
                onClick={() => requireAuth("/marketplace")}
              >
                Tìm hiểu thêm <FaChevronRight className="feature-link-icon" />
              </button>
            </div>
            <div className="feature-card">
              <h3 className="feature-card-title">Bài viết chuẩn y khoa</h3>
              <p className="feature-card-description">
                Cung cấp những kiến thức hữu ích, dễ hiểu và được chọn lọc về sức khỏe
                phụ nữ, giúp bạn chủ động cập nhật thông tin và đưa ra lựa chọn phù hợp
                cho hành trình của mình.
              </p>
              <button
                type="button"
                className="feature-link"
                onClick={() => navigate("/blog")}
              >
                Tìm hiểu thêm <FaChevronRight className="feature-link-icon" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Box Section */}
      <section className="subscription-section">
        <div className="subscription-header">
          <h2 className="subscription-title">
            <span className="brand-name">HerDays</span> Subscription Box
          </h2>
          <p className="subscription-description">
            Các Subscription Box được cá nhân hóa dựa trên tính trạng sức khỏe
            của người dùng
          </p>
        </div>
        <div className="subscription-cards-grid">
          {subscriptionBoxesLoading &&
            Array.from({ length: 4 }, (_, index) => (
              <div className="subscription-card subscription-card-skeleton" key={`subscription-skeleton-${index}`}>
                <Skeleton className="subscription-card-skeleton-image" />
                <div className="subscription-card-content">
                  <Skeleton className="subscription-card-skeleton-category" />
                  <Skeleton className="subscription-card-skeleton-title" />
                  <Skeleton className="subscription-card-skeleton-description" />
                  <Skeleton className="subscription-card-skeleton-price" />
                </div>
              </div>
            ))}
          {!subscriptionBoxesLoading && subscriptionBoxes.map((box) => (
            <div
              key={box.id}
              className="subscription-card"
            >
              <div className="subscription-card-image">
                <img src={getBoxImage(box)} alt={getBoxName(box)} />
              </div>
              <div className="subscription-card-content">
                <p className="subscription-card-category">{box.category || "Subscription Box"}</p>
                <h3 className="subscription-card-title">{getBoxName(box)}</h3>
                <p className="subscription-card-description">
                  {box.description || "Sản phẩm được tuyển chọn cho hành trình chăm sóc sức khỏe của bạn."}
                </p>
                <div className="subscription-card-stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="star-icon" />
                  ))}
                </div>
                <p className="subscription-card-price">{formatCurrency(box.price)}</p>
                <button
                  className="subscription-card-button"
                  onClick={() => requireAuth("/marketplace")}
                  aria-label={`Xem ${getBoxName(box)}`}
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          ))}
          {!subscriptionBoxesLoading && <div className="subscription-card subscription-card-custom">
            <div className="subscription-card-image">
              <img
                src={custom}
                alt="Tự tạo hộp chăm sóc sức khỏe của riêng bạn"
              />
            </div>
            <div className="subscription-card-content">
              <p className="subscription-card-category">
                Hộp chăm sóc sức khỏe cá nhân hóa
              </p>
              <h3 className="subscription-card-title">
                Tự tạo hộp chăm sóc sức khỏe của riêng bạn
              </h3>
              <div className="subscription-card-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="star-icon" />
                ))}
              </div>
              <button
                className="subscription-card-custom-btn"
                onClick={() => requireAuth("/box-customize/")}
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>}
        </div>
        <div className="subscription-footer">
          <button
            type="button"
            className="subscription-link"
            onClick={() => requireAuth("/marketplace")}
          >
            Tìm hiểu thêm →
          </button>
        </div>
      </section>

      {/* Experts Section */}
      <section className="experts-section">
        <div className="experts-header">
          <p className="experts-label">KẾT NỐI VỚI CHUYÊN GIA</p>
          <h2 className="experts-title">
            Chuyên Gia Y Tế Hàng Đầu Tại{" "}
            <span className="brand-name">HerDays</span>
          </h2>
        </div>
        <div className="experts-carousel">
          <button
            className="carousel-button prev"
            onClick={() => {
              const el = expertsRef.current;
              if (el.scrollLeft === 0) {
                const totalWidth = el.scrollWidth / 2;
                el.scrollLeft = totalWidth;
              }
              el.scrollBy({ left: -400, behavior: "smooth" });
            }}
          >
            <FaChevronLeft />
          </button>
          <div className="experts-cards" ref={expertsRef}>
            {[...experts, ...experts].map((expert, i) => (
              <div key={`exp-${i}`} className="expert-card">
                <div className="expert-card-background">
                  <img src={expertBg} alt="Expert Background" />
                </div>
                <div className="expert-card-avatar">
                  <img src={expert.avatar} alt={expert.name} />
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
          <button
            className="carousel-button next"
            onClick={() => {
              const el = expertsRef.current;
              const halfWidth = el.scrollWidth / 2;
              if (el.scrollLeft >= halfWidth - 10) {
                el.scrollLeft = 0;
              }
              el.scrollBy({ left: 400, behavior: "smooth" });
            }}
          >
            <FaChevronRight />
          </button>
        </div>
        {/* <div style={{ marginTop: "20px" }} className="subscription-footer">
          <button
            type="button"
            className="subscription-link"
            onClick={() => requireAuth("/home")}
          >
            Tìm hiểu thêm →
          </button>
        </div> */}
      </section>

      {/* AI Assistant Section */}
      <section className="herbot-section">
        <div className="herbot-container">
          <div className="herbot-image">
            <img src={herbotAi} alt="HerBotAI" />
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
            <button
              type="button"
              className="herbot-link"
              onClick={() => requireAuth("/chat-with-herbot")}
            >
              Khám phá ngay
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter & App Download Section */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-box">
            <p className="herbot-label">LIÊN HỆ</p>
            <h3 className="newsletter-title">Luôn Cập Nhật</h3>
            <p className="newsletter-description">
              Đăng ký để không bỏ lỡ các bài viết chia sẻ từ chuyên gia dành
              riêng cho giai đoạn của bạn
            </p>
            <div className="newsletter-input-wrapper">
              <FaEnvelope size={16} className="newsletter-icon" />
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                className="contact-control newsletter-input"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNewsletterSubmit()}
              />
              <button
                className="newsletter-button"
                onClick={handleNewsletterSubmit}
              >
                Gửi
              </button>
            </div>
          </div>
          <img src={contactImg} alt="HerDays App" className="app-promo-img" />
        </div>
      </section>
    </main>
  );
};

export default HomePage;
