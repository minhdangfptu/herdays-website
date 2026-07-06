import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import herdaysLogo from '../../assets/herdays-logo.png';
import { Mail, Phone } from 'lucide-react';
import './EnterEmailPhoneNoPage.scss';
import { authApi } from '../../services/apiService.js';

const contentByMethod = {
  email: {
    heading: 'Xác nhận qua Email',
    subtext: 'Vui lòng nhập địa chỉ email của bạn để nhận mã xác nhận',
    placeholder: 'Nhập địa chỉ Email',
    buttonText: 'Gửi mã xác nhận',
    Icon: Mail,
  },
  phone: {
    heading: 'Xác nhận qua SMS',
    subtext: 'Vui lòng nhập số điện thoại của bạn để nhận mã xác nhận',
    placeholder: 'Nhập số điện thoại',
    buttonText: 'Gửi mã xác nhận',
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
              <span>{method === 'phone' ? 'Số điện thoại' : 'Email'}</span>
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
            {isSubmitting ? 'Đang gửi...' : buttonText}
          </button>
        </form>

        <a className="enter-contact-back" href="/choose-method">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Quay lại
        </a>

        <p className="enter-contact-footer">
          Bạn đã có tài khoản?{' '}
          <a href="/login">Đăng nhập</a>
        </p>
      </div>
    </main>
  );
};

export default EnterEmailPhoneNoPage;
