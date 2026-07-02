import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import herdaysLogo from "../../assets/herdays-logo.png";
import { authApi } from "../../services/apiService.js";
import "./ResetPassword.scss";

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
  { id: "length",    label: "Ãt nháº¥t 8 kÃ½ tá»±",            test: (v) => v.length >= 8 },
  { id: "uppercase", label: "Ãt nháº¥t 1 chá»¯ hoa (A-Z)",      test: (v) => /[A-Z]/.test(v) },
  { id: "number",    label: "Ãt nháº¥t 1 chá»¯ sá»‘ (0-9)",       test: (v) => /\d/.test(v) },
  { id: "special",   label: "Ãt nháº¥t 1 kÃ½ tá»± Ä‘áº·c biá»‡t (!@â€¦)", test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(v) },
];

function getStrength(newPassword) {
  const passed = STRENGTH_RULES.filter((r) => r.test(newPassword)).length;
  if (passed <= 1) return { level: 1, label: "Yáº¿u",  color: "#ef4444" };
  if (passed === 2) return { level: 2, label: "Trung bÃ¬nh", color: "#f59e0b" };
  if (passed === 3) return { level: 3, label: "Máº¡nh",  color: "#22c55e" };
  return            { level: 4, label: "Ráº¥t máº¡nh", color: "#16a34a" };
}

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("resetToken") || "";
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [touched, setTouched]                 = useState({ new: false, confirm: false });

  const strength    = getStrength(newPassword);
  const matched     = confirmPassword.length > 0 && newPassword === confirmPassword;
  const allPassed  = STRENGTH_RULES.every((r) => r.test(newPassword));

  const hasError = (field) => {
    if (!touched[field]) return false;
    if (field === "new")    return !allPassed && newPassword.length > 0;
    if (field === "confirm") return !matched;
    return false;
  };

  const isFormValid = allPassed && matched;

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ new: true, confirm: true });
    if (!resetToken) {
      toast.error("Thiếu mã đặt lại mật khẩu. Vui lòng xác thực OTP lại.");
      return;
    }
    if (!isFormValid) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Äang xá»­ lÃ½...");

    try {
      await authApi.resetPassword({ resetToken, newPassword });
      toast.success("Mật khẩu đã được đặt lại thành công!", { id: loadingToast });
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Cáº­p nháº­t tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="cp-page">
      <div className="cp-card">
        {/* â”€â”€ Header â”€â”€ */}
        <div className="cp-card__header">
          <img className="cp-brand-logo" src={herdaysLogo} alt="Herdays" />
          <h1 className="cp-card__title">Nháº­p máº­t kháº©u má»›i</h1>
          <p className="cp-card__subtitle">
            Vui lÃ²ng nháº­p máº­t kháº©u má»›i cho tÃ i khoáº£n cá»§a báº¡n
          </p>
        </div>

        {/* â”€â”€ Form â”€â”€ */}
        <form className="cp-form" onSubmit={handleSubmit} noValidate>

          {/* New Password */}
          <div className={`cp-field${hasError("new") ? " is-error" : ""}`}>
            <label className="cp-field__label">Máº­t kháº©u má»›i</label>
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
                placeholder="Nháº­p máº­t kháº©u má»›i"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={() => handleBlur("new")}
              />
              <button
                className="cp-input-shell__toggle"
                type="button"
                aria-label={showNew ? "áº¨n máº­t kháº©u" : "Hiá»‡n máº­t kháº©u"}
                onClick={() => setShowNew((v) => !v)}
              >
                <PasswordToggleIcon isVisible={showNew} />
              </button>
            </div>
          </div>

          {/* Strength Meter */}
          {newPassword.length > 0 && (
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
              <p
                className="cp-strength__label"
                style={{ color: strength.color }}
              >
                {strength.label}
              </p>
            </div>
          )}

          {/* Rules Checklist */}
          {newPassword.length > 0 && (
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
          )}

          {/* Confirm Password */}
          <div className={`cp-field${hasError("confirm") ? " is-error" : ""}`}>
            <label className="cp-field__label">XÃ¡c nháº­n máº­t kháº©u má»›i</label>
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
                placeholder="Nháº­p láº¡i máº­t kháº©u má»›i"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur("confirm")}
              />
              <button
                className="cp-input-shell__toggle"
                type="button"
                aria-label={showConfirm ? "áº¨n máº­t kháº©u" : "Hiá»‡n máº­t kháº©u"}
                onClick={() => setShowConfirm((v) => !v)}
              >
                <PasswordToggleIcon isVisible={showConfirm} />
              </button>
            </div>
            {hasError("confirm") && (
              <p className="cp-field__error">Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p</p>
            )}
          </div>

          {/* Submit */}
          <button
            className="cp-reset-submit"
            type="submit"
            disabled={isSubmitting || (!touched.new && !touched.confirm && newPassword.length === 0)}
          >
            {isSubmitting ? "Äang xá»­ lÃ½..." : "XÃ¡c nháº­n"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default ChangePasswordPage;

