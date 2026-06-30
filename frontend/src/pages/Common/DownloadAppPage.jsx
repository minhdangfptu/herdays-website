'use client';

import React, { useState } from 'react';
import { FaApple, FaGooglePlay, FaHeart, FaChartLine, FaUsers, FaShieldAlt } from 'react-icons/fa';
import './DownloadAppPage.scss';

export default function DownLoadAppPage() {
  const [activeTab, setActiveTab] = useState(0);

  const featureSections = [
    {
      id: 1,
      title: 'Khám phá tính năng của Herdays',
      subtitle: 'Tất cả các tính năng được thiết kế để hỗ trợ hành trình của bạn',
      features: [
        { icon: '📅', title: 'Theo dõi chu kỳ', desc: 'Quản lý chu kỳ của bạn một cách dễ dàng' },
        { icon: '🧠', title: 'Hỗ trợ IVF', desc: 'Hỗ trợ toàn diện cho quá trình IVF' },
        { icon: '🌸', title: 'Công khai Thai kỳ', desc: 'Theo dõi quá trình mang thai' },
        { icon: '💬', title: 'Tư vấn AI là đó', desc: 'Nhân tạo thông minh hỗ trợ 24/7' },
      ],
      mockupPosition: 'left',
    },
    {
      id: 2,
      title: 'HerbotAI',
      subtitle: 'Trợ lý ảo thông minh của bạn',
      description: 'Tận dụng công nghệ AI để nhận lời khuyên y tế được cá nhân hóa mà không cần chờ đợi',
      features: [
        { icon: '🤖', title: 'Tư vấn sức khỏe thông minh', desc: 'Nhận các lời khuyên được tùy chỉnh' },
        { icon: '📊', title: 'Phân tích dữ liệu', desc: 'Dữ liệu được xử lý cập nhật' },
      ],
      mockupPosition: 'right',
    },
    {
      id: 3,
      title: 'Thống kê trực quan, quản lý suất để đúng',
      subtitle: 'Theo dõi sức khỏe của bạn với hình ảnh động',
      features: [
        { icon: '📈', title: 'Biểu đồ chi tiết', desc: 'Theo dõi xu hướng sức khỏe' },
        { icon: '🔔', title: 'Thông báo thông minh', desc: 'Nhận thông báo khi cần thiết' },
      ],
      mockupPosition: 'left',
    },
    {
      id: 4,
      title: 'Tư vấn trực tuyến cùng đội ngũ y bác sĩ',
      subtitle: 'Kết nối với các chuyên gia y tế',
      features: [
        { icon: '👨‍⚕️', title: 'Tư vấn với bác sĩ', desc: 'Tương tác với các chuyên gia' },
        { icon: '💌', title: 'Hỗ trợ cộng đồng', desc: 'Kết nối với những người khác' },
        { icon: '📱', title: 'Chat video', desc: 'Tư vấn trực tuyến an toàn' },
      ],
      mockupPosition: 'right',
    },
    {
      id: 5,
      title: 'Cẩm nang y khoa đăng ký cấp',
      subtitle: 'Kiến thức y khoa toàn diện',
      features: [
        { icon: '📖', title: 'Bài viết có tổ chức', desc: 'Thông tin y khoa được tổ chức' },
        { icon: '🔍', title: 'Tìm kiếm dễ dàng', desc: 'Tìm thông tin bạn cần nhanh chóng' },
        { icon: '⭐', title: 'Nội dung được xác minh', desc: 'Tất cả nội dung được xác minh' },
        { icon: '💡', title: 'Cập nhật thường xuyên', desc: 'Thông tin mới nhất liên tục' },
      ],
      mockupPosition: 'left',
    },
    {
      id: 6,
      title: 'Giải pháp mua sắm và chăm sóc sức khỏe',
      subtitle: 'Mua sắm các sản phẩm chăm sóc sức khỏe',
      description: 'Kết nối với các nhà cung cấp dịch vụ sức khỏe hàng đầu',
      mockupPosition: 'right',
    },
  ];

  return (
    <div className="download-app-page">
      {/* Hero Section */}
      <section className="download-app-hero">
        <div className="download-app-container">
          <h1 className="download-app-hero-title">
            Đồng hành cùng sức khỏe phụ nữ bằng công nghệ AI. Tải Herdays ngay!
          </h1>
          <p className="download-app-hero-subtitle">
            Một ứng dụng toàn diện giúp bạn quan tâm đến sức khỏe phụ nữ và sẵn sàng hỗ trợ trên từng bước
          </p>

          <div className="download-app-buttons">
            <a href="#" className="download-app-btn download-app-btn-google">
              <FaGooglePlay /> Google Play
            </a>
            <a href="#" className="download-app-btn download-app-btn-apple">
              <FaApple /> App Store
            </a>
          </div>

          <div className="download-app-mockups-preview">
            <div className="download-app-phone download-app-phone-1"></div>
            <div className="download-app-phone download-app-phone-2"></div>
            <div className="download-app-phone download-app-phone-3"></div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {featureSections.map((section, index) => (
        <section key={section.id} className={`download-app-feature-section ${index % 2 === 0 ? 'download-app-feature-left' : 'download-app-feature-right'}`}>
          <div className="download-app-container">
            <div className="download-app-feature-content">
              <h2 className="download-app-feature-title">{section.title}</h2>
              <p className="download-app-feature-subtitle">{section.subtitle}</p>
              {section.description && <p className="download-app-feature-description">{section.description}</p>}

              {section.features && (
                <div className={`download-app-features-grid download-app-features-grid-${section.features.length <= 2 ? '2' : '4'}`}>
                  {section.features.map((feature, idx) => (
                    <div key={idx} className="download-app-feature-card">
                      <div className="download-app-feature-icon">{feature.icon}</div>
                      <h4 className="download-app-feature-name">{feature.title}</h4>
                      <p className="download-app-feature-desc">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="download-app-mockup-container">
              <div className="download-app-phone-mockup"></div>
            </div>
          </div>
        </section>
      ))}

      {/* Call to Action Section */}
      <section className="download-app-cta-section">
        <div className="download-app-container">
          <h2 className="download-app-cta-title">Trải nghiệm Herdays ngay hôm nay</h2>
          <p className="download-app-cta-subtitle">
            Hành trình chăm sóc sức khỏe phụ nữ bắt đầu từ đây. Tải ứng dụng ngay để được hỗ trợ tối đa
          </p>

          <div className="download-app-cta-buttons">
            <a href="#" className="download-app-btn download-app-btn-google">
              <FaGooglePlay /> Google Play
            </a>
            <a href="#" className="download-app-btn download-app-btn-apple">
              <FaApple /> App Store
            </a>
          </div>

          <div className="download-app-phone-large"></div>
        </div>
      </section>
    </div>
  );
}
