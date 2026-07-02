'use client';

import chPlay from '../../assets/ch_play.png';
import appStoreImg from '../../assets/app_store.png';
import downloadPhone1 from '../../assets/download-app/download-1.png';
import downloadPhone3 from '../../assets/download-app/download-3.png';
import downloadPhone4 from '../../assets/download-app/download-4.png';
import downloadPhone5 from '../../assets/download-app/download-5.png';
import downloadPhone6 from '../../assets/download-app/download-6.png';
import downloadPhone7 from '../../assets/download-app/download-7.png';
import downloadPhone8 from '../../assets/download-app/download-8.png';
import featureImg1 from '../../assets/download-app/features/1.png';
import featureImg2 from '../../assets/download-app/features/2.png';
import featureImg3 from '../../assets/download-app/features/3.png';
import featureImg4 from '../../assets/download-app/features/4.png';
import { CalendarDays, Brain, MessageSquare, Stethoscope, Activity, Bell, Users, BookOpen, HeartPulse, TrendingUp, ClipboardList, RefreshCw, FileText, Sparkles, ClipboardCheck, Video } from 'lucide-react';
import './DownloadAppPage.scss';

export default function DownLoadAppPage() {
  return (
    <div className="download-app-page">

      {/* ============================================ */}
      {/* Hero Section */}
      {/* ============================================ */}
      <section className="download-app-hero">
        <div className="download-app-container">
          <h1 className="download-app-hero-title">
            Đồng hành cùng sức khỏe phụ nữ bằng công nghệ AI. Tải Herdays ngay!
          </h1>
          <p className="download-app-hero-subtitle">
          Nền tảng chăm sóc sức khỏe sinh sản toàn diện, giúp bạn thấu hiểu cơ thể và chủ động trong từng giai đoạn quan trọng của cuộc sống
          </p>

          <div className="download-app-buttons">
            <a href="#" className="download-app-btn download-app-btn-google">
              <img src={chPlay} alt="Google Play" />
            </a>
            <a href="#" className="download-app-btn download-app-btn-apple">
              <img src={appStoreImg} alt="App Store" />
            </a>
          </div>

          <div className="download-app-mockups-wrapper">
            <img src={downloadPhone1} alt="Herdays App Preview" className="download-app-mockups-img" />

            <div className="download-app-mockups-overlay">
            <div className="overlay-text-container">
              <h2 className="overlay-heading">Khám phá tính năng của Herdays</h2>
              <p className="overlay-subheading">Những tính năng cốt lõi của ứng dụng Herdays giúp bạn chăm sóc bản thân tốt hơn</p>
            </div>
              <div className="download-app-mockups-cards">
                <div className="download-app-mockups-card">
                  <img src={featureImg1} alt="Feature 1" className="download-app-mockups-card-img" />
                  <div className="download-app-mockups-card-text">
                    <h3 className="download-app-mockups-card-title">Theo dõi chu kỳ</h3>
                    <p className="download-app-mockups-card-subtitle">Tự động dự báo 4 giai đoạn sinh lý và ghi nhận triệu chứng cơ thể bằng AI.</p>
                  </div>
                </div>
                <div className="download-app-mockups-card">
                  <img src={featureImg2} alt="Feature 2" className="download-app-mockups-card-img" />
                  <div className="download-app-mockups-card-text">
                    <h3 className="download-app-mockups-card-title">Hỗ trợ IVF</h3>
                    <p className="download-app-mockups-card-subtitle">Số hóa phác đồ điều trị và lưu trữ các chỉ số xét nghiệm sinh sản quan trọng.</p>
                  </div>
                </div>
                <div className="download-app-mockups-card">
                  <img src={featureImg3} alt="Feature 3" className="download-app-mockups-card-img" />
                  <div className="download-app-mockups-card-text">
                    <h3 className="download-app-mockups-card-title">Đồng hành thai kỳ</h3>
                    <p className="download-app-mockups-card-subtitle">Trực quan hóa dữ liệu thai nhi và theo dõi sức khỏe mẹ bầu suốt 40 tuần.</p>
                  </div>
                </div>
                <div className="download-app-mockups-card">
                  <img src={featureImg4} alt="Feature 4" className="download-app-mockups-card-img" />
                  <div className="download-app-mockups-card-text">
                    <h3 className="download-app-mockups-card-title">Trợ lý AI y tế</h3>
                    <p className="download-app-mockups-card-subtitle">Phân tích dữ liệu sức khỏe cá nhân, đưa ra lời khuyên và bài viết chuyên môn.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Feature Section 1 — Herbot AI */}
      {/* ============================================ */}
      <section className="feature-section-1">
        <div className="download-app-container">
          <div className="feature-section-1__content">
            <h2 className="feature-section-1__title">Herbot AI</h2>
            <p className="feature-section-1__subtitle">Ứng dụng công nghệ AI tiên tiến để thấu hiểu dữ liệu sức khỏe của riêng bạn, từ đó tự động đưa ra các dự báo và đề xuất y khoa chuẩn xác theo từng giai đoạn sức khoẻ.</p>
            <div className="feature-section-1__cards">
              <div className="feature-section-1__card">
                <div className="feature-section-1__card-icon"><CalendarDays size={32} /></div>
                <h4 className="feature-section-1__card-name">Dự báo thông minh</h4>
                <p className="feature-section-1__card-desc">Dự báo chính xác các mốc thời gian quan trọng trong chu kỳ và thai kỳ.</p>
              </div>
              <div className="feature-section-1__card">
                <div className="feature-section-1__card-icon"><Brain size={32} /></div>
                <h4 className="feature-section-1__card-name">Đề xuất cá nhân hóa</h4>
                <p className="feature-section-1__card-desc">Tự động gợi ý chế độ dinh dưỡng, vận động dựa trên thể trạng thực tế.</p>
              </div>
              <div className="feature-section-1__card">
                <div className="feature-section-1__card-icon"><MessageSquare size={32} /></div>
                <h4 className="feature-section-1__card-name">Phân tích triệu chứng</h4>
                <p className="feature-section-1__card-desc">Đánh giá các dấu hiệu bất thường và đưa ra cảnh báo sức khỏe kịp thời.</p>
              </div>
              <div className="feature-section-1__card">
                <div className="feature-section-1__card-icon"><Sparkles size={32} /></div>
                <h4 className="feature-section-1__card-name">Tự động học hỏi</h4>
                <p className="feature-section-1__card-desc">Thuật toán AI liên tục tối ưu hóa độ chính xác dựa trên thói quen.</p>
              </div>
            </div>
          </div>
          <div className="feature-section-1__mockup">
            <img src={downloadPhone3} alt="Herdays App" className="feature-section-1__phone" />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Feature Section 2 — HerbotAI Assistant */}
      {/* ============================================ */}
      <section className="feature-section-2">
        <div className="download-app-container">
          <div className="feature-section-2__mockup">
            <img src={downloadPhone4} alt="Herdays App" className="feature-section-2__phone" />
          </div>
          <div className="feature-section-2__content">
            <h2 className="feature-section-2__title">Thống kê trực quan, kiểm soát dễ dàng</h2>
            <p className="feature-section-2__subtitle">Hệ thống hóa toàn bộ dữ liệu thể trạng thành các biểu đồ
              và báo cáo chi tiết, giúp bạn và bác sĩ chuyên khoa
              dễ dàng theo dõi tiến trình sức khỏe.</p>
            <div className="feature-section-2__cards">
              <div className="feature-section-2__card">
                <div className="feature-section-2__card-icon"><TrendingUp size={24} /></div>
                <h4 className="feature-section-2__card-name">Biểu đồ trực quan</h4>
                <p className="feature-section-2__card-desc">Theo dõi sự biến động của cân nặng, nhiệt độ cơ thể và các triệu chứng hàng ngày..</p>
              </div>
              <div className="feature-section-2__card">
                <div className="feature-section-2__card-icon"><ClipboardList size={24} /></div>
                <h4 className="feature-section-2__card-name">Quản lý chỉ số y khoa</h4>
                <p className="feature-section-2__card-desc">Lưu trữ an toàn các kết quả xét nghiệm quan trọng như nồng độ AMH và Beta HCG..</p>
              </div>
              <div className="feature-section-2__card">
                <div className="feature-section-2__card-icon"><RefreshCw size={24} /></div>
                <h4 className="feature-section-2__card-name">Tổng hợp chu kỳ</h4>
                <p className="feature-section-2__card-desc">Xuất báo cáo tổng quan về chu kỳ kinh nguyệt để phục vụ cho các buổi thăm khám y tế.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Feature Section 3 — Statistics */}
      {/* ============================================ */}
      <section className="feature-section-3">
        <div className="download-app-container">
          <div className="feature-section-3__content">
            <h2 className="feature-section-3__title">Tư vấn trực tuyến cùng đội ngũ y bác sĩ</h2>
            <p className="feature-section-3__subtitle">Xóa bỏ rào cản thời gian và khoảng cách với tính năng đặt lịch khám, giúp bạn nhận tư vấn chuyên sâu từ các chuyên gia sản phụ khoa hàng đầu ngay trên ứng dụng.</p>
            <div className="feature-section-3__cards">
              <div className="feature-section-3__card">
                <div className="feature-section-3__card-icon"><Activity size={32} /></div>
                <h4 className="feature-section-3__card-name">Tư vấn 1:1 bảo mật</h4>
                <p className="feature-section-3__card-desc">Trao đổi trực tiếp qua video hoặc hệ thống tin nhắn riêng tư với bác sĩ để giải đáp kịp thời các vấn đề sức khỏe..</p>
              </div>
              <div className="feature-section-3__card">
                <div className="feature-section-3__card-icon"><ClipboardCheck size={32} /></div>
                <h4 className="feature-section-3__card-name">Quản lý chỉ số y khoa</h4>
                <p className="feature-section-3__card-desc">Dễ dàng tra cứu thông tin chuyên gia và lựa chọn khung giờ tư vấn phù hợp với lịch trình cá nhân mà không cần chờ đợi.</p>
              </div>
              <div className="feature-section-3__card">
                <div className="feature-section-3__card-icon"><Users size={32} /></div>
                <h4 className="feature-section-3__card-name">Đồng bộ hồ sơ y khoa</h4>
                <p className="feature-section-3__card-desc">Các bác sĩ có thể trực tiếp tham khảo dữ liệu và các chỉ số xét nghiệm trên ứng dụng để đưa ra phác đồ chính xác nhất..</p>
              </div>
            </div>
          </div>
          <div className="feature-section-3__mockup">
            <img src={downloadPhone5} alt="Herdays App" className="feature-section-3__phone" />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Feature Section 4 — Online Consultation */}
      {/* ============================================ */}
      <section className="feature-section-4">
        <div className="download-app-container">
          <div className="feature-section-4__mockup">
            <img src={downloadPhone6} alt="Herdays App" className="feature-section-4__phone" />
          </div>
          <div className="feature-section-4__content">
            <h2 className="feature-section-4__title">Cẩm nang y khoa đáng tin cậy</h2>
            <p className="feature-section-4__subtitle">Cung cấp hệ thống bài viết chuyên sâu, được xây dựng và kiểm chứng bởi các chuyên gia, giúp bạn trang bị đầy đủ kiến thức khoa học để tự tin chăm sóc bản thân.</p>
            <div className="feature-section-4__cards">
              <div className="feature-section-4__card">
                <div className="feature-section-4__card-icon"><FileText size={32} /></div>
                <h4 className="feature-section-4__card-name">Nội dung theo sát lộ trình</h4>
                <p className="feature-section-4__card-desc">Bài viết hiển thị tương ứng với đúng giai đoạn sức khỏe hiện tại của bạn..</p>
              </div>
              <div className="feature-section-4__card">
                <div className="feature-section-4__card-icon"><BookOpen size={32} /></div>
                <h4 className="feature-section-4__card-name">Đa dạng chủ đề</h4>
                <p className="feature-section-4__card-desc">Kiến thức bao quát từ tâm lý, sinh hoạt đến thai giáo và hỗ trợ IVF..</p>
              </div>
              <div className="feature-section-4__card">
                <div className="feature-section-4__card-icon"><HeartPulse size={32} /></div>
                <h4 className="feature-section-4__card-name">Phân tích triệu chứng</h4>
                <p className="feature-section-4__card-desc">Đánh giá các dấu hiệu bất thường & đưa ra cảnh báo sức khỏe kịp thời..</p>
              </div>
              <div className="feature-section-4__card">
                <div className="feature-section-4__card-icon"><Sparkles size={32} /></div>
                <h4 className="feature-section-4__card-name">Tự động học hỏi</h4>
                <p className="feature-section-4__card-desc">AI liên tục tối ưu hóa độ chính xác dựa trên thói quen ghi chép.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Feature Section 6 — Shopping & Care */}
      {/* ============================================ */}
      <section className="feature-section-6">
        <div className="download-app-container">
          
          {/* Phần Header nằm riêng ở trên */}
          <div className="feature-section-6__header">
            <h2 className="feature-section-6__title">Giải pháp mua sắm và chăm sóc sức khỏe</h2>
            <p className="feature-section-6__subtitle">
              Tích hợp không gian mua sắm tiện lợi với các sản phẩm box subscription chọn lọc kỹ lưỡng, đáp ứng nhu cầu chuyên biệt cho phụ nữ từ giai đoạn chuẩn bị mang thai đến khi sinh nở.
            </p>
          </div>

          {/* Phần ảnh và Tip box nằm ở dưới */}
          <div className="feature-section-6__visuals">
            {/* Ảnh 1 điện thoại bên trái */}
            <div className="feature-section-6__single-phone">
              <img src={downloadPhone7} alt="Herdays Single Phone" />
            </div>

            {/* Ảnh 4 điện thoại bên phải */}
            <div className="feature-section-6__group-phones">
              <img src={downloadPhone8} alt="Herdays Group Phones" />
              
              {/* Khối "Bật mí nhỏ" góc dưới bên phải */}
              <div className="feature-section-6__tip-box">
                <h4>Bật mí nhỏ</h4>
                <p>
                  Giao diện và biểu tượng được thiết kế để tự động điều chỉnh linh hoạt, bám sát theo từng mốc thời gian trong chu kỳ thực tế của bạn.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================ */}
      {/* Call to Action Section */}
      {/* ============================================ */}
      <section className="download-app-cta-section">
        <div className="download-app-container">
          {/* Bọc nội dung vào 1 div để dễ căn trái và giới hạn chiều rộng */}
          <div className="download-app-cta-content">
            <h2 className="download-app-cta-title">Trải nghiệm HerDays ngay hôm nay</h2>
            <p className="download-app-cta-subtitle">
              Bắt đầu hành trình chăm sóc sức khỏe sinh sản cá nhân hóa với sự hỗ trợ từ hệ thống trí tuệ nhân tạo
            </p>

            <div className="download-app-cta-buttons">
            <a href="#" className="download-app-btn download-app-btn-google">
              <img src={chPlay} alt="Google Play" />
            </a>
            <a href="#" className="download-app-btn download-app-btn-apple">
              <img src={appStoreImg} alt="App Store" />
            </a>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
