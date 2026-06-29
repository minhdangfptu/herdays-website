import herdaysLogo from '../../assets/herdays-logo.png';
import './ChooseMethodPage.scss';

const methods = [
  {
    id: 'email',
    title: 'Xác nhận qua Email',
    description: 'Mã xác nhận sẽ được gửi đến email đã đăng ký',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 7 10 7 10-7" />
      </svg>
    ),
  },
  {
    id: 'phone',
    title: 'Xác nhận qua SMS',
    description: 'Sử dụng tin nhắn SMS để xác minh tài khoản (có thể áp dụng phí nhà mạng)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const ChooseMethodPage = () => {
  return (
    <main className="choose-method-page">
      <div className="choose-method-card">
        <img className="brand-logo" src={herdaysLogo} alt="Herdays" />

        <div className="choose-method-copy">
          <h1>Xác nhận tài khoản</h1>
          <p>Vui lòng chọn phương thức xác nhận tài khoản của bạn</p>
        </div>

        <div className="method-list">
          {methods.map((method) => (
            <a
              key={method.id}
              className="method-card"
              href={`/confirmation-data?method=${method.id}`}
            >
              <span className="method-card__icon">{method.icon}</span>
              <span className="method-card__text">
                <strong>{method.title}</strong>
                <span>{method.description}</span>
              </span>
              <span className="method-card__arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </a>
          ))}
        </div>

        <a className="back-link" href="/register">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Quay lại
        </a>
      </div>
    </main>
  );
};

export default ChooseMethodPage;
