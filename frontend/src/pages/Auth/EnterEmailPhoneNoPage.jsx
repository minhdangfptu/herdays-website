import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import herdaysLogo from '../../assets/herdays-logo.png';
import { Mail, Phone } from 'lucide-react';
import './EnterEmailPhoneNoPage.scss';
import { authApi } from '../../services/apiService.js';

const contentByMethod = {
  email: {
    heading: 'XÃ¡c nháº­n qua Email',
    subtext: 'Vui lÃ²ng nháº­p Ä‘á»‹a chá»‰ email cá»§a báº¡n Ä‘á»ƒ nháº­n mÃ£ xÃ¡c nháº­n',
    placeholder: 'Nháº­p Ä‘á»‹a chá»‰ Email',
    buttonText: 'Gá»­i mÃ£ xÃ¡c nháº­n',
    Icon: Mail,
  },
  phone: {
    heading: 'XÃ¡c nháº­n qua SMS',
    subtext: 'Vui lÃ²ng nháº­p sá»‘ Ä‘iá»‡n thoáº¡i cá»§a báº¡n Ä‘á»ƒ nháº­n mÃ£ xÃ¡c nháº­n',
    placeholder: 'Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i',
    buttonText: 'Gá»­i mÃ£ xÃ¡c nháº­n',
    Icon: Phone,
  },
};

const EnterEmailPhoneNoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method') || 'email';
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { heading, subtext, placeholder, buttonText, Icon } =
    contentByMethod[method] || contentByMethod.email;

  async function handleSubmit(e) {
    e.preventDefault();
    const contact = value.trim();
    if (!contact) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Đang gửi mã xác nhận...');

    try {
      if (method === 'phone') {
        await authApi.forgotPasswordByPhoneNumber({ phone: contact });
      } else {
        await authApi.forgotPasswordByEmail({ email: contact });
      }
      toast.success('Đã gửi mã xác nhận.', { id: loadingToast });
      navigate(`/confirmation-otp?contact=${encodeURIComponent(contact)}&purpose=reset-password`);
    } catch (error) {
      toast.error(error.message || 'Không thể gửi mã xác nhận.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="enter-contact-page">
      <div className="enter-contact-card">
        <img className="enter-contact-logo" src={herdaysLogo} alt="Herdays" />

        <div className="enter-contact-heading">
          <h1>{heading}</h1>
          <p>{subtext}</p>
        </div>

        <form className="enter-contact-form" onSubmit={handleSubmit}>
          <div className="enter-contact-field">
            <label className="enter-contact-label">
              <span>{method === 'phone' ? 'Sá»‘ Ä‘iá»‡n thoáº¡i' : 'Email'}</span>
            </label>
            <div className="enter-contact-input-shell">
              <span className="enter-contact-icon">
                <Icon />
              </span>
              <input
                className="enter-contact-input"
                type={method === 'phone' ? 'tel' : 'email'}
                name="contact"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                required
                autoComplete={method === 'phone' ? 'tel' : 'email'}
              />
            </div>
          </div>

          <button
            className="enter-contact-submit"
            type="submit"
            disabled={isSubmitting || !value.trim()}
          >
            {isSubmitting ? 'Äang gá»­i...' : buttonText}
          </button>
        </form>

        <a className="enter-contact-back" href="/choose-method">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Quay láº¡i
        </a>

        <p className="enter-contact-footer">
          Báº¡n Ä‘Ã£ cÃ³ tÃ i khoáº£n?{' '}
          <a href="/login">ÄÄƒng nháº­p</a>
        </p>
      </div>
    </main>
  );
};

export default EnterEmailPhoneNoPage;

