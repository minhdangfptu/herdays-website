import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import herdaysLogo from '../../assets/herdays-logo.png';
import './EnterOTP.scss';
import { authApi } from '../../services/apiService.js';

const EnterOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contact = searchParams.get('contact') || '';
  const purpose = searchParams.get('purpose') || 'register';
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

  async function handleContinue(event) {
    event.preventDefault();
    if (otp.some((d) => d === '') || !contact) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Đang xác thực OTP...');

    try {
      const result = await authApi.confirmOtp({
        identifier: contact,
        otp: otp.join(''),
        purpose
      });

      if (purpose === 'reset-password') {
        toast.success('OTP hợp lệ. Vui lòng đặt mật khẩu mới.', { id: loadingToast });
        navigate(`/reset-password?resetToken=${encodeURIComponent(result.resetToken)}`);
        return;
      }

      toast.success('Xác thực tài khoản thành công. Vui lòng đăng nhập.', { id: loadingToast });
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Xác thực OTP thất bại.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
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

  async function handleResend() {
    setOtp(['', '', '', '', '', '']);
    inputsRef.current[0]?.focus();
    if (!contact) return;

    try {
      await authApi.forgotPassword({ identifier: contact });
      toast.success('Đã gửi lại mã OTP.');
    } catch (error) {
      toast.error(error.message || 'Không thể gửi lại OTP.');
    }
  }

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <main className="enter-otp-page">
      <div className="enter-otp-card">
        <img className="enter-otp-logo" src={herdaysLogo} alt="Herdays" />

        <div className="enter-otp-heading">
          <h1>Äiá»n mÃ£ OTP</h1>
          <p>
            ChÃºng tÃ´i Ä‘Ã£ gá»­i Email chá»©a mÃ£ OTP Ä‘áº¿n Ä‘á»‹a chá»‰ Email:{' '}
            <strong>{maskContact(contact)}</strong>
          </p>
          <p className="enter-otp-helper">
            Vui lÃ²ng Ä‘iá»n mÃ£ 6 chá»¯ sá»‘ Ä‘Æ°á»£c gá»­i Ä‘áº¿n Email
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
                aria-label={`KÃ½ tá»± thá»© ${index + 1}`}
              />
            ))}
          </div>

          {isSubmitting && (
            <p className="enter-otp-status enter-otp-status--loading">
              Äang xÃ¡c thá»±c...
            </p>
          )}

          <p className="enter-otp-resend">
            ChÆ°a nháº­n Ä‘Æ°á»£c mÃ£?{' '}
            <button className="enter-otp-resend-btn" type="button" onClick={handleResend}>
              Gá»­i láº¡i
            </button>
          </p>

          <button
            className="enter-otp-continue"
            type="submit"
            disabled={!isOtpComplete || isSubmitting}
          >
            {isSubmitting ? 'Äang xÃ¡c thá»±c...' : 'Tiáº¿p tá»¥c'}
          </button>
        </form>

        <a className="enter-otp-back" href="/login">
          Quay vá» trang Ä‘Äƒng nháº­p
        </a>
      </div>
    </main>
  );
};

export default EnterOTP;
