import { useNavigate } from 'react-router-dom';
import './RegisterSuccessModal.scss';

const RegisterSuccessModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLoginClick = () => {
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <div className="register-success-overlay" onClick={onClose}>
      <div className="register-success-card" onClick={(e) => e.stopPropagation()}>
        <button className="register-success-close" onClick={onClose} aria-label="Đóng">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="register-success-icon-wrap">
          <img
            className="register-success-icon"
            src=""
            alt="Thành công"
          />
        </div>

        <h2 className="register-success-title">
          Chúc mừng bạn!
          <br />
          Đăng ký thành công
        </h2>

        <p className="register-success-desc">
          Tài khoản của bạn đã được tạo thành công.
          <br />
          Hãy đăng nhập để bắt đầu hành trình của bạn.
        </p>

        <button
          className="register-success-cta"
          type="button"
          onClick={handleLoginClick}
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
};

export default RegisterSuccessModal;