import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import herdaysLogo from '../../assets/herdays-logo.png';
import './EnterOTP.scss';

const EnterOTP = () => {
  const [searchParams] = useSearchParams();
  const contact = searchParams.get('contact') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = useRef([]);

  const maskContact = (val) => {
    if (!val) return '';
    if (val.includes('@')) {
      const [local, domain] = val.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    }
    return val.slice(0, 3) + '****' + val.slice(-3);
  };

  function handleContinue(event) {
    event.preventDefault();
    if (otp.some((d) => d === '')) return;
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500);
  }

  function handleChange(index, value) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const digits = pasted.split('');
      setOtp((prev) => {
        const next = [...prev];
        digits.forEach((d, i) => { if (i < 6) next[i] = d; });
        return next;
      });
      const focusIndex = Math.min(pasted.length, 5);
      inputsRef.current[focusIndex]?.focus();
    }
  }

  function handleResend() {
    setOtp(['', '', '', '', '', '']);
    inputsRef.current[0]?.focus();
  }

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <main className="enter-otp-page">
      <div className="enter-otp-card">
        <img className="enter-otp-logo" src={herdaysLogo} alt="Herdays" />

        <div className="enter-otp-heading">
          <h1>Điền mã OTP</h1>
          <p>
            Chúng tôi đã gửi Email chứa mã OTP đến địa chỉ Email:{' '}
            <strong>{maskContact(contact)}</strong>
          </p>
          <p className="enter-otp-helper">
            Vui lòng điền mã 6 chữ số được gửi đến Email
          </p>
        </div>

        <form className="enter-otp-form" onSubmit={handleContinue}>
          <div className="enter-otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                className="enter-otp-cell"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                aria-label={`Ký tự thứ ${index + 1}`}
              />
            ))}
          </div>

          {isSubmitting && (
            <p className="enter-otp-status enter-otp-status--loading">
              Đang xác thực...
            </p>
          )}

          <p className="enter-otp-resend">
            Chưa nhận được mã?{' '}
            <button className="enter-otp-resend-btn" type="button" onClick={handleResend}>
              Gửi lại
            </button>
          </p>

          <button
            className="enter-otp-continue"
            type="submit"
            disabled={!isOtpComplete || isSubmitting}
          >
            {isSubmitting ? 'Đang xác thực...' : 'Tiếp tục'}
          </button>
        </form>

        <a className="enter-otp-back" href="/login">
          Quay về trang đăng nhập
        </a>
      </div>
    </main>
  );
};

export default EnterOTP;