import herdaysLogo from "../assets/herdays-logo.png";
import "./LogoutModal.scss";

const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Đăng xuất",
  description,
  cancelLabel = "Không, đùa chút thôi",
  confirmLabel = "Đúng, đăng xuất cho tôi",
  cardClassName = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div
        className={`logout-modal-card ${cardClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="logout-modal-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <img className="logout-modal-logo" src={herdaysLogo} alt="HerDays" />

        <h2 className="logout-modal-title">{title}</h2>

        <p className="logout-modal-desc">
          {description || (
            <>
              Bạn đang rời đi
              <br />
              Bạn chắc chắn chứ?
            </>
          )}
        </p>

        <div className="logout-modal-actions">
          <button className="logout-modal-cancel" onClick={onClose}>
            {cancelLabel}
          </button>
          <button className="logout-modal-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
