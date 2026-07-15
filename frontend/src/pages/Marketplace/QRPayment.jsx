import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Building2,
  CheckCircle,
  CreditCard,
  Edit3,
  Headphones,
  Loader2,
  MapPin,
  QrCode,
  Save,
  Smartphone,
  User,
  XCircle
} from 'lucide-react';
import { orderApi, profileApi } from '../../services/apiService.js';
import './QRPayment.scss';

const QR_EXPIRES_SECONDS = 10 * 60;
const POLL_INTERVAL_MS = 4000;

const BANK_CODE = 'MB';
const BANK_NAME = 'MB Bank';
const BANK_ACCOUNT_NUMBER = '1886925122004';
const BANK_ACCOUNT_DISPLAY = '1886 9251 22004';
const BANK_ACCOUNT_NAME = 'NGUYEN QUY HOANG';

const SUCCESS_STATUSES = ['confirmed', 'delivering', 'delivered', 'deleted'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')} : ${String(remainingSeconds).padStart(2, '0')}`;
};

export default function QRPayment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [secondsRemaining, setSecondsRemaining] = useState(QR_EXPIRES_SECONDS);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  const amount = Number(state?.amount) || 0;
  const orderId = state?.orderId || '';
  const orderCode = state?.orderCode || 'HD000000';
  const isExpired = secondsRemaining <= 0;
  const isPaymentSuccess = SUCCESS_STATUSES.includes(orderStatus);
  const isCancelled = orderStatus === 'cancelled';

  const transferContent = useMemo(
    () => `${orderCode} - Thanh toán đơn hàng`,
    [orderCode]
  );

  const qrImageUrl = useMemo(() => {
    const searchParams = new URLSearchParams({
      addInfo: transferContent,
      accountName: BANK_ACCOUNT_NAME
    });

    if (amount > 0) searchParams.set('amount', String(Math.round(amount)));

    return `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACCOUNT_NUMBER}-compact2.png?${searchParams.toString()}`;
  }, [amount, transferContent]);

  useEffect(() => {
    let isActive = true;

    profileApi.getProfile()
      .then((profile) => {
        if (!isActive) return;
        const nextAddress = profile?.address || '';
        setShippingAddress(nextAddress);
        setIsAddressEditing(!nextAddress.trim());
        setAddressError('');
      })
      .catch((error) => {
        if (!isActive) return;
        setAddressError(error.message || 'Không thể tải địa chỉ giao hàng.');
        setIsAddressEditing(true);
      })
      .finally(() => {
        if (isActive) setIsAddressLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (isPaymentSuccess || isCancelled) return undefined;

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isCancelled, isPaymentSuccess]);

  useEffect(() => {
    if (!orderId || isPaymentSuccess || isCancelled) return undefined;

    let isActive = true;

    const fetchOrderStatus = async () => {
      try {
        const order = await orderApi.getById(orderId);
        if (!isActive) return;
        setOrderStatus(order.orderStatus || 'pending');
        setStatusError('');
      } catch (error) {
        if (isActive) setStatusError(error.message || 'Không thể kiểm tra trạng thái đơn hàng.');
      }
    };

    fetchOrderStatus();
    const intervalId = window.setInterval(fetchOrderStatus, POLL_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [isCancelled, isPaymentSuccess, orderId]);

  const handleBackToShop = () => {
    navigate('/marketplace');
  };

  const handleViewOrderDetail = () => {
    navigate(orderId ? `/profile?orderId=${encodeURIComponent(orderId)}` : '/profile');
  };

  const handleCancelOrder = () => {
    if (!orderId) {
      navigate('/marketplace');
      return;
    }

    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (isCancelling) return;
    setIsCancelModalOpen(false);
  };

  const handleSaveAddress = async () => {
    const trimmedAddress = shippingAddress.trim();
    if (!trimmedAddress) {
      toast.error('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }

    setIsSavingAddress(true);
    try {
      const result = await profileApi.updateProfile({ address: trimmedAddress });
      const nextAddress = result.profile?.address || trimmedAddress;
      setShippingAddress(nextAddress);
      setIsAddressEditing(false);
      setAddressError('');
      toast.success('Đã lưu địa chỉ giao hàng.');
    } catch (error) {
      toast.error(error.message || 'Không thể lưu địa chỉ giao hàng.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleConfirmCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const order = await orderApi.cancel(orderId);
      setOrderStatus(order.orderStatus || 'cancelled');
      setIsCancelModalOpen(false);
      toast.success('Đã hủy giao dịch.');
    } catch (error) {
      const message = error.message === 'Only pending orders can be cancelled'
        ? 'Chỉ có thể hủy đơn hàng đang chờ thanh toán.'
        : error.message || 'Không thể hủy giao dịch.';
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isPaymentSuccess) {
    return (
      <div className="herdays-qrpayment-wrapper">
        <div className="herdays-qrpayment-result-card">
          <div className="herdays-qrpayment-result-icon success">
            <CheckCircle size={42} />
          </div>
          <h1>Thanh toán thành công</h1>
          <p>Đơn hàng {orderCode} đã được duyệt. HerDays sẽ tiếp tục xử lý và giao hàng cho bạn.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" className="herdays-qrpayment-primary-btn" onClick={handleViewOrderDetail}>
              Chi tiết đơn hàng
            </button>
            <button
              type="button"
              className="min-h-11 rounded-[10px] border border-[#ed77a5] bg-white px-7 text-[15px] font-bold text-[#ed77a5] transition hover:bg-[#fff5f8]"
              onClick={handleBackToShop}
            >
              Về shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="herdays-qrpayment-wrapper">
        <div className="herdays-qrpayment-result-card">
          <div className="herdays-qrpayment-result-icon cancelled">
            <XCircle size={42} />
          </div>
          <h1>Giao dịch đã hủy</h1>
          <p>Đơn hàng {orderCode} đã được chuyển sang trạng thái hủy. Các sản phẩm đã được hoàn lại vào kho.</p>
          <button type="button" className="herdays-qrpayment-primary-btn" onClick={handleBackToShop}>
            Về shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="herdays-qrpayment-wrapper">
      <div className="herdays-qrpayment-container">
        <div className="herdays-qrpayment-main">
          <div className="herdays-qrpayment-left">
            <div className="herdays-qrpayment-header">
              <h1 className="herdays-qrpayment-title">Thanh toán đơn hàng</h1>
              <p className="herdays-qrpayment-subtitle">Quét mã QR để thanh toán đơn hàng của bạn</p>
            </div>

            <div className="herdays-qrpayment-amount-card">
              <p className="herdays-qrpayment-amount-label">Số tiền thanh toán</p>
              <h2 className="herdays-qrpayment-amount-value">{formatCurrency(amount)}</h2>
              <div className="herdays-qrpayment-content-box">
                <p>Nội dung chuyển khoản</p>
                <strong>{transferContent}</strong>
              </div>
            </div>

            <div className="herdays-qrpayment-details">
              <div className="herdays-qrpayment-detail-row">
                <span className="icon"><Building2 size={16} /></span>
                <span className="label">Ngân hàng</span>
                <span className="value"><strong>{BANK_NAME}</strong></span>
              </div>
              <div className="herdays-qrpayment-detail-row">
                <span className="icon"><CreditCard size={16} /></span>
                <span className="label">Số tài khoản</span>
                <span className="value"><strong>{BANK_ACCOUNT_DISPLAY}</strong></span>
              </div>
              <div className="herdays-qrpayment-detail-row">
                <span className="icon"><User size={16} /></span>
                <span className="label">Chủ tài khoản</span>
                <span className="value"><strong>{BANK_ACCOUNT_NAME}</strong></span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-[#ed77a5]">
                    <MapPin size={17} />
                  </span>
                  <div>
                    <p className="m-0 text-sm font-bold text-slate-800">Địa chỉ giao hàng</p>
                    <p className="m-0 text-xs font-medium text-slate-400">Dùng địa chỉ trong hồ sơ của bạn</p>
                  </div>
                </div>
                {isAddressEditing ? (
                  <button
                    type="button"
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#ed77a5] px-3 text-xs font-bold text-white transition hover:bg-[#d95f91] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSavingAddress || isAddressLoading}
                    onClick={handleSaveAddress}
                  >
                    {isSavingAddress ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    Lưu
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-pink-200 bg-white px-3 text-xs font-bold text-[#ed77a5] transition hover:bg-pink-50"
                    disabled={isAddressLoading}
                    onClick={() => setIsAddressEditing(true)}
                  >
                    <Edit3 size={14} />
                    Sửa
                  </button>
                )}
              </div>

              <textarea
                className="min-h-[82px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-50 disabled:bg-slate-50 disabled:text-slate-500"
                value={shippingAddress}
                disabled={!isAddressEditing || isAddressLoading || isSavingAddress}
                maxLength={255}
                placeholder={isAddressLoading ? 'Đang tải địa chỉ...' : 'Nhập địa chỉ nhận hàng của bạn'}
                onChange={(event) => setShippingAddress(event.target.value)}
              />
              {addressError && <p className="mt-2 text-xs font-semibold text-red-500">{addressError}</p>}
            </div>
          </div>

          <div className="herdays-qrpayment-right">
            <div className="herdays-qrpayment-qr-card">
              <p className="herdays-qrpayment-qr-instruction">
                Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử
              </p>

              <div className="herdays-qrpayment-qr-image-wrapper">
                <img
                  src={qrImageUrl}
                  alt={`QR thanh toán ${BANK_NAME} ${BANK_ACCOUNT_DISPLAY}`}
                  className="herdays-qrpayment-qr-img"
                />
              </div>

              <div className={`herdays-qrpayment-timer-section ${isExpired ? 'is-expired' : ''}`}>
                <p>{isExpired ? 'Mã QR đã hết hạn' : 'Mã QR sẽ hết hạn sau'}</p>
                <div className="herdays-qrpayment-timer-countdown">
                  {formatCountdown(secondsRemaining)}
                </div>
              </div>

              {statusError && <p className="herdays-qrpayment-status-error">{statusError}</p>}

              <button
                type="button"
                className="herdays-qrpayment-cancel-btn"
                disabled={isCancelling}
                onClick={handleCancelOrder}
              >
                {isCancelling ? 'Đang hủy...' : 'Hủy giao dịch'}
              </button>
            </div>
          </div>
        </div>

        <div className="herdays-qrpayment-instructions">
          <h3 className="herdays-qrpayment-inst-title">Hướng dẫn thanh toán</h3>

          <div className="herdays-qrpayment-steps">
            <div className="herdays-qrpayment-step-item">
              <div className="step-icon"><Smartphone size={20} /></div>
              <div className="step-text">
                <strong>Bước 1</strong>
                <p>Mở ứng dụng ngân hàng hoặc ví điện tử</p>
              </div>
            </div>

            <div className="herdays-qrpayment-step-item">
              <div className="step-icon"><QrCode size={20} /></div>
              <div className="step-text">
                <strong>Bước 2</strong>
                <p>Quét mã QR và kiểm tra nội dung thanh toán trên màn hình</p>
              </div>
            </div>

            <div className="herdays-qrpayment-step-item">
              <div className="step-icon"><CheckCircle size={20} /></div>
              <div className="step-text">
                <strong>Bước 3</strong>
                <p>Chờ admin duyệt giao dịch, màn hình sẽ tự chuyển sang thanh toán thành công</p>
              </div>
            </div>

            <div className="herdays-qrpayment-step-item warning-step">
              <div className="step-icon"><Headphones size={20} /></div>
              <div className="step-text">
                <strong>Bạn chưa thanh toán?</strong>
                <p>Bấm Hủy giao dịch để hủy đơn hàng đang chờ thanh toán.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {isCancelModalOpen && (
        <div className="herdays-qrpayment-modal-overlay" onClick={handleCloseCancelModal}>
          <div
            className="herdays-qrpayment-cancel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qrpayment-cancel-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="herdays-qrpayment-cancel-modal__icon">
              <XCircle size={32} />
            </div>
            <h2 id="qrpayment-cancel-modal-title">Hủy giao dịch?</h2>
            <p>
              Bạn có chắc muốn hủy giao dịch cho đơn hàng <strong>{orderCode}</strong> không?
              Đơn hàng đang chờ thanh toán sẽ được chuyển sang trạng thái hủy.
            </p>
            <div className="herdays-qrpayment-cancel-modal__actions">
              <button
                type="button"
                className="herdays-qrpayment-cancel-modal__btn herdays-qrpayment-cancel-modal__btn--secondary"
                disabled={isCancelling}
                onClick={handleCloseCancelModal}
              >
                Không
              </button>
              <button
                type="button"
                className="herdays-qrpayment-cancel-modal__btn herdays-qrpayment-cancel-modal__btn--danger"
                disabled={isCancelling}
                onClick={handleConfirmCancelOrder}
              >
                {isCancelling ? 'Đang hủy...' : 'Có, hủy giao dịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
