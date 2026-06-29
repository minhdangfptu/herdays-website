import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import "./DeleteAccountModal.scss";

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="delete-account-overlay" onClick={onClose}>
      <div
        className="delete-account-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Icon */}
        <div className="delete-account-modal__icon">
          <AlertTriangle size={28} color="#ED77A5" strokeWidth={2} />
        </div>

        {/* Body */}
        <div className="delete-account-modal__body">
          <h2 id="delete-modal-title" className="delete-account-modal__title">
            Xóa tài khoản
          </h2>
          <p className="delete-account-modal__desc">
            Bạn có chắc chắn muốn xóa tài khoản không? Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Footer */}
        <div className="delete-account-modal__footer">
          <button
            className="delete-account-modal__btn delete-account-modal__btn--cancel"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="delete-account-modal__btn delete-account-modal__btn--confirm"
            onClick={onConfirm}
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}
