'use client';
import './AboutUs.scss';
import logo_mau from '../../assets/herdays-logo.png';
import heroImg from '../../assets/about-us/hero.png';
import mockupImg from '../../assets/about-us/ai.png';
import { Sparkles, Target, Bot, Package, ShoppingBag, Shield, Heart, Lightbulb, RefreshCw, Puzzle, Rocket, Brain, Flame, Wand2, CalendarClock, UserRound, TrendingUp, Search, Truck, Droplets, Baby, Pill, FlaskConical, Check, User, Users } from 'lucide-react';

const LUCIDE_ICONS = {
  sparkles: Sparkles,
  target: Target,
  bot: Bot,
  package: Package,
  shoppingBag: ShoppingBag,
  shield: Shield,
  heart: Heart,
  lightbulb: Lightbulb,
  refreshCw: RefreshCw,
  puzzle: Puzzle,
  rocket: Rocket,
  brain: Brain,
  flame: Flame,
  wand2: Wand2,
  calendarClock: CalendarClock,
  userRound: UserRound,
  trendingUp: TrendingUp,
  search: Search,
  truck: Truck,
  droplets: Droplets,
  baby: Baby,
  pill: Pill,
  flaskConical: FlaskConical,
  check: Check,
  user: User,
  users: Users,
};

const LucideIcon = ({ name, size = 20, ...props }) => {
  const IconComp = LUCIDE_ICONS[name];
  if (!IconComp) return null;
  return <IconComp size={size} {...props} />;
};

// Component dùng chung cho các cái Tag nhỏ xíu xíu ở đầu mỗi section
const SectionTag = ({ icon, text }) => (
  <div className="herdays-about-tag">
    <span className="herdays-about-tag-icon"><LucideIcon name={icon} size={18} /></span>
    <span className="herdays-about-tag-text">{text}</span>
  </div>
);

export default function AboutUs() {
  // Dữ liệu cho phần "HerDays dành cho ai?"
  const targetAudiences = [
    { title: 'Theo dõi chu kỳ', subtitle: 'Kinh nguyệt & sức khỏe hàng ngày', features: ['Ghi lại chu kỳ', 'Theo dõi triệu chứng', 'Nhận thông báo nhắc lịch', 'Chủ động hơn trong việc chăm sóc bản thân.'] },
    { title: 'Kế hoạch mang thai', subtitle: 'Người đang có kế hoạch mang thai', features: ['Theo dõi thời điểm rụng trứng', 'Dự đoán thời gian dễ thụ thai', 'Cung cấp những gợi ý phù hợp', 'Chủ động hơn trong việc chăm sóc bản thân.'] },
    { title: 'Đang mang thai', subtitle: 'Người đang trong thai kỳ', features: ['Theo dõi thai kỳ', 'Ghi nhận những thay đổi của cơ thể', 'Tiếp cận các thông tin phù hợp theo từng giai đoạn phát triển của thai nhi'] },
    { title: 'Hỗ trợ sinh sản (IVF)', subtitle: 'Người đang trong hành trình hỗ trợ sinh sản (IVF)', features: ['Theo dõi quá trình điều trị', 'Tiếp cận kiến thức chuyên môn', 'Nhận được sự đồng hành phù hợp trong từng giai đoạn của hành trình'] },
  ];

  // Dữ liệu cho phần Giá trị cốt lõi
  const coreValues = [
    { title: 'Cá nhân hoá', desc: 'Mỗi người phụ nữ là một hành trình riêng biệt, vì vậy HerDays luôn hướng đến những trải nghiệm được thiết kế phù hợp với từng người dùng.' },
    { title: 'Đồng hành', desc: 'Không chỉ cung cấp công cụ theo dõi sức khỏe, HerDays mong muốn trở thành người bạn đồng hành đáng tin cậy trong những giai đoạn quan trọng của cuộc sống.' },
    { title: 'Thấu hiểu', desc: 'Lắng nghe nhu cầu, cảm xúc và những thay đổi của cơ thể để mang đến các giải pháp phù hợp hơn.' },
    { title: 'Đổi mới', desc: 'Ứng dụng công nghệ và AI nhằm nâng cao trải nghiệm chăm sóc sức khỏe phụ nữ trong thời đại số.' },
  ];

  // Dữ liệu cho phần Vì sao chọn HerDays
  const whyChooseUs = [
    { num: '01', title: 'Cá nhân hóa trải nghiệm bằng AI', desc: 'Phù hợp với từng giai đoạn sức khỏe và nhu cầu của mỗi người dùng.' },
    { num: '02', title: 'Hỗ trợ nhiều hành trình sức khỏe', desc: 'Dù bạn đang theo dõi chu kỳ, chuẩn bị mang thai hay đang mang thai - HerDays đều có giải pháp phù hợp.' },
    { num: '03', title: 'AI Chatbot hỗ trợ 24/7', desc: 'Sẵn sàng giải đáp các thắc mắc cơ bản, hỗ trợ theo dõi sức khỏe và đưa ra những gợi ý chăm sóc phù hợp mọi lúc, mọi nơi.' },
    { num: '04', title: 'Kết nối với chuyên gia sức khỏe', desc: 'Tiếp cận nguồn dữ liệu tin cậy từ các chuyên gia và đội ngũ y tế, giúp người dùng đưa ra những quyết định phù hợp hơn.' },
    { num: '05', title: 'Giải pháp chăm sóc cá nhân hóa', desc: 'Các sản phẩm và gói chăm sóc được đề xuất dựa trên dữ liệu sức khỏe, nhu cầu và từng giai đoạn của người dùng.' },
    { num: '06', title: 'Marketplace theo nhu cầu', desc: 'Cho phép người dùng lựa chọn các sản phẩm và giải pháp chăm sóc phù hợp với bản thân trên cùng 1 nền tảng.' },
    { num: '07', title: 'Hệ thống blog và cộng đồng chia sẻ kiến thức', desc: 'Giúp nâng cao nhận thức về sức khỏe phụ nữ và tạo môi trường kết nối, học hỏi.' },
  ];

  return (
    <div className="herdays-about-page">
      
      {/* =========================================
          SECTION 1: HERO & BELIEF (Bg: Light Pink -> White) 
          ========================================= */}
      <section className="herdays-about-section herdays-about-hero-bg">
        <div className="herdays-about-container">
          <div className="herdays-about-hero">
            <div className="herdays-about-hero-content">
              <SectionTag icon="sparkles" text="Powered by AI - Dành riêng cho phụ nữ" />
              {/* Thay ảnh logo thật vào đây */}
              <img style={{width: '500px', height: 'auto', marginBottom: '20px', marginTop: '20px'}} src={logo_mau} alt="Herdays Logo" className="herdays-about-hero-logo-img" />
              <h2 className="herdays-about-hero-title">Đồng hành cùng sức khỏe phụ nữ bằng công nghệ AI.</h2>
              <p className="herdays-about-hero-desc">
                HerDays là nền tảng chăm sóc sức khỏe phụ nữ ứng dụng AI, được phát triển nhằm hỗ trợ phụ nữ trong các giai đoạn quan trọng của hành trình sức khỏe sinh sản, từ theo dõi chu kỳ kinh nguyệt, chuẩn bị mang thai đến mang thai.
              </p>
            </div>
            <div className="herdays-about-hero-visual">
              {/* Thay ảnh Hero thật vào đây */}
              <img src={heroImg} alt="" />
            </div>
          </div>
        </div>
      </section>

      <section className="herdays-about-section herdays-about-white-bg herdays-about-belief">
        <div className="herdays-about-container herdays-about-text-center">
          <h2 className="herdays-about-cursive-title">Chúng tôi tin rằng</h2>
          <p className="herdays-about-belief-text">
            Mỗi người phụ nữ đều có một cơ thể, một chu kỳ và một hành trình riêng. Tuy nhiên, việc theo dõi sức khỏe, ghi nhớ chu kỳ hay tìm kiếm những thông tin phù hợp vẫn còn nhiều khó khăn và tốn thời gian.
          </p>
          <p className="herdays-about-belief-highlight">Đó là lúc Herdays ra đời</p>
          <p className="herdays-about-belief-subtext">
            HerDays ra đời với mong muốn giúp phụ nữ hiểu cơ thể mình hơn, chủ động hơn trong việc chăm sóc sức khỏe và đưa ra những quyết định phù hợp cho bản thân.<br/><br/>
            Thông qua công nghệ AI, HerDays không chỉ giúp người dùng theo dõi sức khỏe mà còn mang đến những gợi ý được cá nhân hóa dựa trên nhu cầu và từng giai đoạn của mỗi người.
          </p>
        </div>
      </section>

      {/* =========================================
          SECTION 2: STORY (Bg: White) 
          ========================================= */}
      <section className="herdays-about-section herdays-about-white-bg">
        <div className="herdays-about-container">
          <div className="herdays-about-header-center">
            <SectionTag icon="target" text="Câu chuyện" />
            <h2 className="herdays-about-section-title">Câu chuyện của <span style={{fontSize: '48px', fontWeight: '1000'}} className="herdays-about-cursive-text">HerDays</span></h2>
            <p className="herdays-about-section-subtitle">Bắt nguồn từ sự thấu hiểu những khó khăn, HerDays ra đời để trở thành người bạn đồng hành số đáng tin cậy của mọi phụ nữ.</p>
          </div>

          <div className="herdays-about-story-layout">
            <div className="herdays-about-story-timeline">
              <div className="herdays-about-timeline-line"></div>
              
              <div className="herdays-about-timeline-item">
                <div className="herdays-about-timeline-icon"><Puzzle size={20} /></div>
                <div  className="herdays-about-timeline-content">
                  <h4 style={{fontSize: '18px', fontWeight: '700'}}>Nhận ra khoảng trống</h4>
                  <p>Nhiều phụ nữ vẫn gặp khó khăn trong việc theo dõi chu kỳ và ghi nhớ những thay đổi của cơ thể</p>
                </div>
              </div>
              <div className="herdays-about-timeline-item">
                <div className="herdays-about-timeline-icon"><Target size={20} /></div>
                <div className="herdays-about-timeline-content">
                  <h4 style={{fontSize: '18px', fontWeight: '700'}}>Ý tưởng nảy sinh</h4>
                  <p>Herdays được tạo ra với mong muốn giúp phụ nữ hiểu cơ thể mình hơn, chủ động hơn trong việc chăm sóc sức khoẻ</p>
                </div>
              </div>
              <div className="herdays-about-timeline-item">
                <div className="herdays-about-timeline-icon"><Brain size={20} /></div>
                <div className="herdays-about-timeline-content">
                  <h4 style={{fontSize: '18px', fontWeight: '700'}}>Công nghệ AI tích hợp</h4>
                  <p>Ứng dụng AI để cá nhân hoá trải nghiệm, mang lại giải pháp phù hợp với từng giai đoạn sức khoẻ sinh sản</p>
                </div>
              </div>
              <div className="herdays-about-timeline-item">
                <div className="herdays-about-timeline-icon"><Rocket size={20} /></div>
                <div className="herdays-about-timeline-content">
                  <h4 style={{fontSize: '18px', fontWeight: '700'}}>Herdays ra đời</h4>
                  <p>Một nền tảng toàn diện đồng hành cùng phụ nữ Việt Nam trong từng hành trình sức khoẻ của bản thân mình</p>
                </div>
              </div>
            </div>

            <div className="herdays-about-story-quote">
              <div style={{color: 'white', fontWeight: '1000'}} className="herdays-about-quote-mark">”</div>
              <p>“Trong cuộc sống hiện đại, phụ nữ thường phải tự ghi nhớ chu kỳ kinh nguyệt, theo dõi sức khỏe sinh sản hoặc tìm kiếm thông tin từ nhiều nguồn khác nhau. Điều này khiến việc chăm sóc sức khỏe trở nên phức tạp và thiếu tính cá nhân hóa.</p>
              <p>Chúng tôi nhận ra rằng phụ nữ cần nhiều hơn một ứng dụng ghi chú chu kỳ. Họ cần một nền tảng có thể đồng hành, thấu hiểu và hỗ trợ trong những giai đoạn quan trọng của cuộc sống.</p>
              <p>Từ đó, HerDays được xây dựng như một người bạn đồng hành số, kết hợp giữa công nghệ AI, dữ liệu cá nhân và các giải pháp chăm sóc thực tế để giúp phụ nữ chủ động hơn trong hành trình chăm sóc sức khỏe của mình.”</p>
              <div className="herdays-about-quote-author">
                <div className="herdays-about-author-avatar"><UserRound size={36} /></div>
                <div>
                  <h4>Đội ngũ Herdays</h4>
                  <span>Nhà sáng lập & Đội ngũ phát triển</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3: GOALS & TARGETS (Bg: Light Grey -> White) 
          ========================================= */}
      <section className="herdays-about-section herdays-about-grey-bg">
        <div className="herdays-about-container">
          <div className="herdays-about-header-center">
            <SectionTag icon="target" text="Mục tiêu" />
            <h2 className="herdays-about-section-title">Mục tiêu <span style={{fontSize: '48px', fontWeight: '1000'}}  className="herdays-about-cursive-text">HerDays</span> hướng tới</h2>
            <p className="herdays-about-section-subtitle">Mục tiêu của chúng tôi là mang đến một nền tảng thông minh, giúp bạn tự tin làm chủ hành trình sức khỏe của riêng mình</p>
          </div>
          
          <div className="herdays-about-goals-grid">
            <div className="herdays-about-goal-card">
              <div className="herdays-about-goal-icon"><Rocket size={32} /></div>
              <h3>Sứ mệnh</h3>
              <p>Giúp phụ nữ chủ động theo dõi, thấu hiểu và chăm sóc sức khỏe của bản thân thông qua công nghệ AI, dữ liệu và trải nghiệm cá nhân hóa.</p>
            </div>
            <div className="herdays-about-goal-card">
              <div className="herdays-about-goal-icon"><Lightbulb size={32} /></div>
              <h3>Tầm nhìn</h3>
              <p>Trở thành nền tảng chăm sóc sức khỏe phụ nữ ứng dụng AI hàng đầu tại Việt Nam, góp phần xây dựng một thế hệ phụ nữ khỏe mạnh, tự tin và chủ động hơn trong việc chăm sóc sức khỏe sinh sản.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="herdays-about-section herdays-about-white-bg">
        <div className="herdays-about-container">
          <div className="herdays-about-header-center">
            <SectionTag icon="users" text="Đối tượng" />
            <h2 className="herdays-about-section-title"><span style={{fontSize: '48px', fontWeight: '1000'}} className="herdays-about-cursive-text">HerDays</span> dành cho ai?</h2>
            <p className="herdays-about-section-subtitle">Nền tảng được thiết kế đặc biệt để đồng hành cùng phụ nữ qua từng giai đoạn quan trọng của cuộc sống</p>
          </div>

          <div className="herdays-about-targets-grid">
            {targetAudiences.map((item, index) => (
              <div key={index} className="herdays-about-target-card">
                <div className="herdays-about-target-card-header">
                  <div className="herdays-about-target-icon"><Target size={20} /></div>
                  <div>
                    <h4>{item.title}</h4>
                    <span>{item.subtitle}</span>
                  </div>
                </div>
                <ul className="herdays-about-target-list">
                  {item.features.map((feature, idx) => (
                    <li key={idx}><span className="check-icon">✓</span> {feature}</li>
                  ))}
                </ul>
                <a href="#" className="herdays-about-target-link">Bắt đầu theo dõi <span className="arrow">→</span></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 4: HERBOT AI (Bg: Dark Navy) 
          ========================================= */}
      <section className="herdays-about-section herdays-about-dark-bg">
        <div className="herdays-about-container herdays-about-ai-layout">
          <div className="herdays-about-ai-mockup">
            {/* Thay ảnh mockup chat UI vào đây */}
            <img src={mockupImg} alt="HerbotAI" />
          </div>
          <div className="herdays-about-ai-content">
            <div className="herdays-about-ai-title-row">
              <h2 className="herdays-about-cursive-text-large">HerbotAI</h2>
              <SectionTag icon="bot" text="HerbotAI" />
            </div>
            <h3 className="herdays-about-ai-heading">Trợ lý AI đồng hành cùng bạn</h3>
            <p className="herdays-about-ai-desc">
              AI Chatbot của HerDays được phát triển nhằm hỗ trợ người dùng giải đáp các thắc mắc cơ bản liên quan đến sức khỏe phụ nữ, chu kỳ kinh nguyệt, mang thai và chăm sóc bản thân.
            </p>
            <div className="herdays-about-ai-features">
              <div className="herdays-about-ai-feature">
                <span className="icon"><Flame size={20} /></span>
                <div>
                  <h4>Phân tích dữ liệu sức khỏe cá nhân.</h4>
                  <p>Đọc hiểu xu hướng sức khỏe của bạn</p>
                </div>
              </div>
              <div className="herdays-about-ai-feature">
                <span className="icon"><Wand2 size={20} /></span>
                <div>
                  <h4>Đưa ra các gợi ý chăm sóc phù hợp.</h4>
                  <p>Đọc hiểu xu hướng sức khỏe của bạn</p>
                </div>
              </div>
              <div className="herdays-about-ai-feature">
                <span className="icon"><CalendarClock size={20} /></span>
                <div>
                  <h4>Nhắc nhở các mốc thời gian quan trọng.</h4>
                  <p>Đọc hiểu xu hướng sức khỏe của bạn</p>
                </div>
              </div>
              <div className="herdays-about-ai-feature">
                <span className="icon"><UserRound size={20} /></span>
                <div>
                  <h4>Cá nhân hóa trải nghiệm theo từng người dùng.</h4>
                  <p>Đọc hiểu xu hướng sức khỏe của bạn</p>
                </div>
              </div>
            </div>
            <p className="herdays-about-ai-footer-text">
              Mục tiêu của chúng tôi là biến HerDays trở thành một trợ lý sức khỏe đáng tin cậy và dễ tiếp cận đối với mọi phụ nữ.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 5: SUBSCRIPTION BOX (Bg: White) 
          ========================================= */}
      <section className="herdays-about-section herdays-about-white-bg">
        <div className="herdays-about-container">
          <div className="herdays-about-header-center">
            <SectionTag icon="package" text="Subscription Box" />
            <h2 className="herdays-about-section-title">Từ dữ liệu đến chăm sóc thực tế</h2>
            <p className="herdays-about-section-subtitle">Bên cạnh nền tảng công nghệ, HerDays còn phát triển các Subscription Box được cá nhân hóa dựa trên từng giai đoạn sức khỏe của người dùng.</p>
          </div>

          <div className="herdays-about-process-flow">
             <div className="herdays-about-process-step">
                <div className="icon"><TrendingUp size={32} /></div>
                <span>Theo dõi</span>
             </div>
             <span className="arrow">→</span>
             <div className="herdays-about-process-step">
                <div className="icon"><Bot size={32} /></div>
                <span>AI Phân tích</span>
             </div>
             <span className="arrow">→</span>
             <div className="herdays-about-process-step">
                <div className="icon"><Search size={32} /></div>
                <span>Gợi ý Box</span>
             </div>
             <span className="arrow">→</span>
             <div className="herdays-about-process-step">
                <div className="icon"><Truck size={32} /></div>
                <span>Giao hàng định kì</span>
             </div>
          </div>

          <div className="herdays-about-pricing-grid">
            {/* Cột 1 */}
              <div className="herdays-about-price-card">
              <span className="herdays-about-price-tag">Box Dâu</span>
              <div className="herdays-about-price-flower"><Droplets size={28} /></div>
              <h3>Chu kỳ kinh nguyệt</h3>
              <p className="desc">Dành cho người theo dõi chu kỳ kinh nguyệt.</p>
              <ul>
                <li><span className="check">✓</span> Sản phẩm vệ sinh cao cấp</li>
                <li><span className="check">✓</span> Viên uống hỗ trợ chu kỳ</li>
                <li><span className="check">✓</span> Dầu massage thư giãn</li>
                <li><span className="check">✓</span> Patch giảm đau bụng</li>
                <li><span className="check">✓</span> Trà thảo mộc cân bằng nội tiết</li>
              </ul>
              <div className="herdays-about-price-footer">
                <div className="price-info">
                  <span>Giá / Tháng</span>
                  <strong>399K</strong>
                </div>
                <button className="herdays-about-btn-pink">Đăng ký ngay</button>
              </div>
            </div>

            {/* Cột 2 */}
              <div className="herdays-about-price-card">
              <span className="herdays-about-price-tag">Box Bầu 1</span>
              <div className="herdays-about-price-flower"><Baby size={28} /></div>
              <h3>Kế hoạch mang thai</h3>
              <p className="desc">Dành cho người đang có kế hoạch mang thai.</p>
              <ul>
                <li><span className="check">✓</span> Que thử rụng trứng QPK</li>
                <li><span className="check">✓</span> Vitamin tổng hợp tiền sản</li>
                <li><span className="check">✓</span> Axit folic cao cấp</li>
                <li><span className="check">✓</span> CoQ10 hỗ trợ sinh sản</li>
                <li><span className="check">✓</span> Sách hướng dẫn fertility</li>
              </ul>
              <div className="herdays-about-price-footer">
                <div className="price-info">
                  <span>Giá / Tháng</span>
                  <strong>599K</strong>
                </div>
                <button className="herdays-about-btn-pink">Đăng ký ngay</button>
              </div>
            </div>

            {/* Cột 3 */}
              <div className="herdays-about-price-card">
              <span className="herdays-about-price-tag">Box Bầu 2</span>
              <div className="herdays-about-price-flower"><Heart size={28} /></div>
              <h3>Đang mang thai</h3>
              <p className="desc">Dành cho người đang mang thai.</p>
              <ul>
                <li><span className="check">✓</span> Vitamin bầu đặc chế</li>
                <li><span className="check">✓</span> Kem dưỡng da chống rạn</li>
                <li><span className="check">✓</span> Gối hỗ trợ thai kỳ</li>
                <li><span className="check">✓</span> Trà gừng giảm nghén</li>
                <li><span className="check">✓</span> Nhật ký thai kỳ</li>
              </ul>
              <div className="herdays-about-price-footer">
                <div className="price-info">
                  <span>Giá / Tháng</span>
                  <strong>699K</strong>
                </div>
                <button className="herdays-about-btn-pink">Đăng ký ngay</button>
              </div>
            </div>
          </div>

          <p className="herdays-about-pricing-note">
            Thông qua dữ liệu được ghi nhận trên nền tảng, HerDays có thể đưa ra các gợi ý sản phẩm phù hợp hơn với nhu cầu thực tế của từng người dùng, giúp tiết kiệm thời gian chuẩn bị và nâng cao trải nghiệm chăm sóc bản thân.
          </p>
        </div>
      </section>

      {/* =========================================
          SECTION 6: MARKETPLACE & CORE VALUES (Bg: Grey -> White) 
          ========================================= */}
      <section className="herdays-about-section herdays-about-grey-bg">
        <div className="herdays-about-container">
          <div className="herdays-about-header-center">
            <SectionTag icon="shoppingBag" text="Marketplace" />
            <h2 className="herdays-about-section-title">Marketplace cá nhân hóa</h2>
            <p className="herdays-about-section-subtitle">HerDays cung cấp một marketplace nơi người dùng có thể tự lựa chọn và xây dựng box theo nhu cầu riêng thay vì sử dụng một mẫu cố định.</p>
          </div>

          <div className="herdays-about-market-grid">
             <div className="herdays-about-market-card"><span className="icon"><Target size={16} /></span> Sản phẩm chăm sóc chu kỳ kinh nguyệt.</div>
             <div className="herdays-about-market-card"><span className="icon"><Target size={16} /></span> Sản phẩm hỗ trợ mang thai.</div>
             <div className="herdays-about-market-card"><span className="icon"><Heart size={16} /></span> Các sản phẩm wellness và self-care.</div>
             <div className="herdays-about-market-card"><span className="icon"><Pill size={16} /></span> Vitamin và thực phẩm bổ sung.</div>
             <div className="herdays-about-market-card"><span className="icon"><FlaskConical size={16} /></span> Que thử rụng trứng và que thử thai.</div>
             <div className="herdays-about-market-card"><span className="icon"><Package size={16} /></span> Tự tạo box cá nhân hoá của riêng bạn</div>
          </div>
          <p className="herdays-about-market-note">Điều này giúp mỗi người dùng có thể tạo ra một giải pháp chăm sóc phù hợp nhất với bản thân.</p>
        </div>
      </section>

      <section className="herdays-about-section herdays-about-white-bg">
        <div className="herdays-about-container">
           <div className="herdays-about-header-center">
            <SectionTag icon="shield" text="Giá trị" />
            <h2 className="herdays-about-section-title">Giá trị cốt lõi của <span className="herdays-about-cursive-text">HerDays</span></h2>
            <p className="herdays-about-section-subtitle">Giá trị cốt lõi của nền tảng Herdays gồm 4 trụ cột chiến lược: Cá nhân hoá, Đồng hành, Thấu hiểu và Đổi mới</p>
          </div>

          <div className="herdays-about-values-grid">
             {coreValues.map((val, idx) => (
                <div key={idx} className="herdays-about-value-card">
                   <div className="herdays-about-value-icon"><Heart size={32} /></div>
                   <h3>{val.title}</h3>
                   <p>{val.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 7: WHY CHOOSE (Bg: Light Grey) 
          ========================================= */}
      <section className="herdays-about-section herdays-about-grey-bg">
         <div className="herdays-about-container">
           <div className="herdays-about-header-center">
              <SectionTag icon="sparkles" text="So sánh" />
              <h2 className="herdays-about-section-title">Vì sao chọn <span className="herdays-about-cursive-text">HerDays?</span></h2>
              <p className="herdays-about-section-subtitle">Nhiều hơn 1 ứng dụng theo dõi chu kỳ - HerDays là hệ sinh thái sức khỏe toàn diện cho phụ nữ</p>
           </div>

           <div className="herdays-about-why-grid">
              {whyChooseUs.map((item, idx) => (
                <div key={idx} className={`herdays-about-why-card ${idx === 6 ? 'card-centered' : ''}`}>
                   <div className="num">{item.num}</div>
                   <div>
                     <h3>{item.title}</h3>
                     <p>{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* =========================================
          SECTION 8: CTA (Bg: Light Pink) 
          ========================================= */}
      <section className="herdays-about-section herdays-about-hero-bg">
         <div className="herdays-about-container herdays-about-text-center herdays-about-cta">
            <SectionTag icon="sparkles" text="So sánh" />
            <h2 className="herdays-about-cursive-title-huge">HerDays đồng hành cùng mọi giai đoạn trong hành trình của phụ nữ</h2>
            <p className="herdays-about-cta-subtext">
              HerDays không chỉ là một ứng dụng theo dõi sức khỏe, mà còn là người bạn đồng hành giúp phụ nữ hiểu cơ thể mình hơn, chăm sóc bản thân tốt hơn và tự tin hơn trong từng giai đoạn của cuộc sống.
            </p>
            <button className="herdays-about-btn-pink-large">Bắt đầu hành trình cùng HerDays</button>
         </div>
      </section>

    </div>
  );
}