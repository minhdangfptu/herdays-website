import { useState } from "react";
import facebookLogo from "../../assets/facebook-logo.png";
import googleLogo from "../../assets/google-logo.png";
import herdaysLogo from "../../assets/herdays-logo.png";
import "./RegisterPage.scss";
import { Lock, Mail, Phone, User } from "lucide-react";

function PasswordToggleIcon({ isVisible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.3-5 9.5-5 9.5 5 9.5 5-3.3 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.5" />
      {!isVisible && <path d="m4 4 16 16" />}
    </svg>
  );
}

function MoodCard() {
  return (
    <div className="mood-card" aria-hidden="true">
      <div className="mood-card__heading">
        <span>Điểm tâm trạng</span>
        <span className="mood-card__key" />
      </div>
      <svg viewBox="0 0 118 88" role="presentation">
        <path
          className="mood-card__axis"
          d="M15 6v68h96M15 20h-4M15 38h-4M15 56h-4"
        />
        <path className="mood-card__grid" d="M43 28v46M72 28v46M101 14v60" />
        <path className="mood-card__line" d="m15 58 28-19h29l29-16" />
        <g className="mood-card__points">
          <circle cx="15" cy="58" r="4" />
          <circle cx="43" cy="39" r="4" />
          <circle cx="72" cy="39" r="4" />
          <circle cx="101" cy="23" r="4" />
        </g>
        <g className="mood-card__labels">
          <text x="4" y="61">1</text>
          <text x="4" y="42">2</text>
          <text x="4" y="24">3</text>
          <text x="4" y="8">4</text>
          <text x="10" y="86">T9</text>
          <text x="36" y="86">T10</text>
          <text x="65" y="86">T11</text>
          <text x="94" y="86">T12</text>
        </g>
      </svg>
    </div>
  );
}

function CycleChart() {
  const bars = [54, 76, 36, 54, 78];

  return (
    <div style={{marginBottom: "40px"}} className="cycle-visual" aria-hidden="true">
      <div className="cycle-card">
        <div className="cycle-card__header">
          <strong>Xu hướng độ dài kì kinh</strong>
          <span>
            <i />
            Số ngày hành kinh
          </span>
        </div>
        <img className="cycle-card__watermark" src={herdaysLogo} alt="" />
        <div className="cycle-card__y-labels">
          {[7, 6, 5, 4, 3, 2].map((value) => (
            <span key={value}>{value} ng</span>
          ))}
        </div>
        <div className="cycle-card__plot">
          <div className="cycle-card__bars">
            {bars.map((height, index) => (
              <span key={index} style={{ "--bar-height": `${height}%` }} />
            ))}
          </div>
          <div className="cycle-card__x-labels">
            {["T1", "T2", "T3", "T4", "T5", "T6"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
      <MoodCard />
      <div className="carousel-dots">
        <span className="is-active" />
        <span />
        <span />
      </div>
    </div>
  );
}

function RegisterForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500);
  }

  return (
    <section className="login-form-panel" aria-labelledby="register-title">
      <div  className="login-form-panel__content">
        <img className="brand-logo" src={herdaysLogo} alt="Herdays" />

        <div className="login-copy">
          <h1 id="register-title">Đăng ký</h1>
          <p style={{fontWeight: "400"}}>Bắt đầu hành trình HERDAYS ngay hôm nay</p>
        </div>

        <form
          style={{ marginTop: "20px" }}
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label className="form-field">
            <span style={{ fontWeight: "400" }}>Họ và tên</span>
            <span className="input-shell">
              <span className="field-icon">
                <User size={16} />
              </span>
              <input
                type="text"
                name="fullname"
                autoComplete="name"
                placeholder="Nhập họ và tên của bạn"
                required
              />
            </span>
          </label>

          <label className="form-field">
            <span style={{ fontWeight: "400" }}>Email</span>
            <span className="input-shell">
              <span className="field-icon">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Nhập địa chỉ Email"
                required
              />
            </span>
          </label>

          <label className="form-field">
            <span style={{ fontWeight: "400" }}>Số điện thoại</span>
            <span className="input-shell">
              <span className="field-icon">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="Nhập số điện thoại của bạn"
                required
              />
            </span>
          </label>

          <label className="form-field">
            <span style={{ fontWeight: "400" }}>Mật khẩu</span>
            <span className="input-shell">
              <span className="field-icon">
                <Lock size={16} />
              </span>
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder="Nhập mật khẩu của bạn"
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={isPasswordVisible}
                onClick={() => setIsPasswordVisible((v) => !v)}
              >
                <PasswordToggleIcon isVisible={isPasswordVisible} />
              </button>
            </span>
          </label>

          <label className="form-field">
            <span style={{ fontWeight: "400" }}>Xác nhận mật khẩu</span>
            <span className="input-shell">
              <span className="field-icon">
                <Lock size={16} />
              </span>
              <input
                type={isConfirmVisible ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu của bạn"
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={isConfirmVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={isConfirmVisible}
                onClick={() => setIsConfirmVisible((v) => !v)}
              >
                <PasswordToggleIcon isVisible={isConfirmVisible} />
              </button>
            </span>
          </label>

          <div className="form-options">
            <label className="remember-me">
              <input
                className="remember-me__checkbox"
                type="checkbox"
                name="terms"
                checked={isTermsChecked}
                onChange={(e) => setIsTermsChecked(e.target.checked)}
              />
              <span>
                Tôi đồng ý với{" "}
                <a href="/terms" style={{ color: "#ed77a5" }}>
                  Điều khoản sử dụng
                </a>{" "}
                &amp;{" "}
                <a href="/policy" style={{ color: "#ed77a5" }}>
                  Chính sách bảo mật
                </a>
              </span>
            </label>
          </div>

          <button
            className="submit-button"
            type="submit"
            disabled={isSubmitting || !isTermsChecked}
          >
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <div className="divider">
            <span>Hoặc</span>
          </div>

          <div className="social-login">
            <button type="button">
              <img src={googleLogo} alt="" />
              <span>Đăng ký với Google</span>
            </button>
            <button type="button">
              <img src={facebookLogo} alt="" />
              <span>Đăng ký với Facebook</span>
            </button>
          </div>

          <p className="register-prompt">
            Đã có tài khoản? <a href="/login">Đăng nhập</a>
          </p>
        </form>
      </div>
    </section>
  );
}

function WelcomePanel() {
  return (
    <aside className="welcome-panel">
      <div className="welcome-panel__content">
        <div style={{ marginTop: "20px" }} className="welcome-copy">
          <h2>CHÀO MỪNG BẠN!</h2>
          <p className="welcome-lead">
            Hãy đăng ký để sử dụng
            <br />
            toàn bộ tính năng của <u>Herdays</u>
          </p>
          <p className="welcome-description">
            HERDAYS - Nền tảng chăm sóc sức khoẻ nữ giới và
            <br />
            dịch vụ Subcription Box
          </p>
        </div>
        <CycleChart />
      </div>
    </aside>
  );
}

function RegisterPage() {
  return (
    <main className="login-page relative isolate grid min-h-svh place-items-center overflow-x-hidden overflow-y-auto bg-[#f9eef2] p-4">
      <div className="login-card grid w-full max-w-[1100px] overflow-hidden rounded-xl bg-white min-[961px]:min-h-[90vh]" style={{ zoom: 0.85 }}>
        
        <WelcomePanel />
        <RegisterForm />
      </div>
    </main>
  );
}

export default RegisterPage;
