import { ArrowRight, Check, House, UserRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CompleteTransactionPage.scss';

const CompleteTransactionPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const orderId = state?.orderId || '';
  const orderCode = state?.orderCode || '';

  const handleGoToProfile = () => {
    const profilePath = orderId
      ? `/profile?orderId=${encodeURIComponent(orderId)}`
      : '/profile';

    navigate(profilePath);
  };

  return (
    <main className="herdays-complete-transaction" aria-labelledby="complete-transaction-title">
      <div className="herdays-complete-transaction__frame">
        <div className="herdays-complete-transaction__signal" aria-hidden="true">
          <span className="herdays-complete-transaction__signal-mark">
            <Check size={32} strokeWidth={2.8} />
          </span>
          <span className="herdays-complete-transaction__signal-line" />
          <span className="herdays-complete-transaction__signal-label">Đã ghi nhận</span>
        </div>

        <section className="herdays-complete-transaction__message">
          <p className="herdays-complete-transaction__eyebrow">Giao dịch hoàn tất</p>
          <h1 id="complete-transaction-title">
            Thanh toán
            <span>thành công</span>
          </h1>
          <p className="herdays-complete-transaction__description">
            Đơn hàng của bạn đã được xác nhận.
          </p>
          {orderCode && (
            <p className="herdays-complete-transaction__order-code">
              Mã đơn hàng <strong>{orderCode}</strong>
            </p>
          )}
        </section>

        <div className="herdays-complete-transaction__actions" aria-label="Điều hướng sau khi thanh toán">
          <button
            type="button"
            className="herdays-complete-transaction__button herdays-complete-transaction__button--primary"
            onClick={handleGoToProfile}
          >
            <UserRound size={18} aria-hidden="true" />
            <span>Về trang cá nhân</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="herdays-complete-transaction__button herdays-complete-transaction__button--secondary"
            onClick={() => navigate('/home')}
          >
            <House size={18} aria-hidden="true" />
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default CompleteTransactionPage;
