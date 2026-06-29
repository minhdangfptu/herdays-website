import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import herdaysLogo from "../../assets/herdays-logo.png";
import { authApi } from "../../services/apiService.js";
import "./ChangePassword.scss";

function PasswordToggleIcon({ isVisible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.3-5 9.5-5 9.5 5 9.5 5-3.3 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.5" />
      {!isVisible && <path d="m4 4 16 16" />}
    </svg>
  );
}

const STRENGTH_RULES = [
  { id: "length",    label: "Ít nhất 8 ký tự",               test: (v) => v.length >= 8 },
  { id: "uppercase", label: "Ít nhất 1 chữ hoa (A-Z)",         test: (v) => /[A-Z]/.test(v) },
  { id: "number",    label: "Ít nhất 1 chữ số (0-9)",          test: (v) => /\d/.test(v) },
  { id: "special",   label: "Ít nhất 1 ký tự đặc biệt (!@…)",  test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(v) },
];

function getStrength(pw) {
  const passed = STRENGTH_RULES.filter((r) => r.test(pw)).length;
  if (passed <= 1) return { level: 1, label: "Yếu",          color: "#ef4444" };
  if (passed === 2) return { level: 2, label: "Trung bình",  color: "#f59e0b" };
  if (passed === 3) return { level: 3, label: "Mạnh",         color: "#22c55e" };
  return            { level: 4, label: "Rất mạnh", color: "#16a34a" };
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword]         = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword]  = useState("");
  const [showOld, setShowOld]                 = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [isVerified, setIsVerified]           = useState(false);
  const [verifying, setVerifying]             = useState(false);
  const [touched, setTouched]                 = useState({ new: false, confirm: false });

  const strength   = getStrength(newPassword);
  const matched    = confirmPassword.length > 0 && newPassword === confirmPassword;
  const allPassed  = STRENGTH_RULES.every((r) => r.test(newPassword));

  const hasError = (field) => {
    if (!touched[field]) return false;
    if (field === "new")     return !allPassed && newPassword.length > 0;
    if (field === "confirm") return !matched;
    return false;
  };

  async function handleVerifyOld(e) {
    e.preventDefault();
    if (!oldPassword.trim()) return;

    setVerifying(true);
    try {
      await authApi.verifyCurrentPassword({ currentPassword: oldPassword });
      setIsVerified(true);
    } catch (err) {
      toast.error(err.message || "Mật khẩu cũ không chính xác.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ new: true, confirm: true });
    if (!allPassed || !matched) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Đang xử lý...");

    try {
      await authApi.changePassword({ currentPassword: oldPassword, newPassword });
      toast.success("Mật khẩu đã được cập nhật thành công!", { id: loadingToast });
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại. Vui lòng thử lại.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="cp-page">
      <div className="cp-card">
        {/* ── Header ── */}
        <div className="cp-card__header">
          <img className="cp-brand-logo" src={herdaysLogo} alt="Herdays" />
          <h1 className="cp-card__title">
            {isVerified ? "Nhập mật khẩu mới" : "Xác minh mật khẩu cũ"}
          </h1>
          <p className="cp-card__subtitle">
            {isVerified
              ? "Vui lòng nhập mật khẩu mới cho tài khoản của bạn"
              : "Để bảo mật tài khoản, vui lòng xác minh mật khẩu hiện tại trước"}
          </p>
        </div>

        {/* ── Step 1: Verify old password ── */}
        {!isVerified && (
          <form className="cp-form" onSubmit={handleVerifyOld} noValidate>
            <div className="cp-field">
              <label className="cp-field__label">Mật khẩu cũ</label>
              <div className="cp-input-shell">
                <span className="cp-input-shell__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showOld ? "text" : "password"}
                  name="oldPassword"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu cũ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button
                  className="cp-input-shell__toggle"
                  type="button"
                  aria-label={showOld ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowOld((v) => !v)}
                >
                  <PasswordToggleIcon isVisible={showOld} />
                </button>
              </div>
            </div>

            <p className="cp-change-forgot-hint">
              <a href="/forgot-password">Quên mật khẩu?</a>
            </p>

            <button
              className="cp-submit"
              type="submit"
              disabled={verifying || !oldPassword.trim()}
            >
              {verifying ? "Đang xác minh..." : "Tiếp tục"}
            </button>

            <p className="cp-back-link">
              <a href="/login">Quay lại đăng nhập</a>
            </p>
          </form>
        )}

        {/* ── Step 2: Set new password ── */}
        {isVerified && (
          <form className="cp-form" onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className={`cp-field${hasError("new") ? " is-error" : ""}`}>
              <label className="cp-field__label">Mật khẩu mới</label>
              <div className="cp-input-shell">
                <span className="cp-input-shell__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, new: true }))}
                />
                <button
                  className="cp-input-shell__toggle"
                  type="button"
                  aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowNew((v) => !v)}
                >
                  <PasswordToggleIcon isVisible={showNew} />
                </button>
              </div>
            </div>

            {/* Strength Meter */}
            {newPassword.length > 0 && (
              <>
                <div className="cp-strength">
                  <div className="cp-strength__bars">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className="cp-strength__bar"
                        style={{
                          background: n <= strength.level ? strength.color : "#e5e7eb",
                          transition: "background 300ms ease",
                        }}
                      />
                    ))}
                  </div>
                  <p className="cp-strength__label" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>

                <ul className="cp-rules">
                  {STRENGTH_RULES.map((rule) => {
                    const ok = rule.test(newPassword);
                    return (
                      <li key={rule.id} className={`cp-rules__item${ok ? " is-ok" : ""}`}>
                        <span className="cp-rules__dot" />
                        <span>{rule.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {/* Confirm Password */}
            <div className={`cp-field${hasError("confirm") ? " is-error" : ""}`}>
              <label className="cp-field__label">Xác nhận mật khẩu mới</label>
              <div className="cp-input-shell">
                <span className="cp-input-shell__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
                />
                <button
                  className="cp-input-shell__toggle"
                  type="button"
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  <PasswordToggleIcon isVisible={showConfirm} />
                </button>
              </div>
              {hasError("confirm") && (
                <p className="cp-field__error">Mật khẩu xác nhận không khớp</p>
              )}
            </div>

            <button
              className="cp-submit"
              type="submit"
              disabled={isSubmitting || !allPassed || !matched}
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </button>

            <p className="cp-back-link">
              <button
                type="button"
                className="cp-back-btn"
                onClick={() => {
                  setIsVerified(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setTouched({ new: false, confirm: false });
                }}
              >
                Quay lại
              </button>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
