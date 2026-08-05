import { useEffect } from 'react';

import herbotImage from '../../assets/home/herbot_ai.png';
import colorLogo from '../../assets/home/logo_mau.png';
import whiteLogo from '../../assets/home/logo_trang.png';
import { teamMembers } from './teamData.js';
import './BehindTheBloom.scss';

const PROFILE_POSITIONS = [
  'north-west',
  'north-east',
  'west',
  'east',
  'south-west',
  'south-east',
];

function usePrivatePageMetadata() {
  useEffect(() => {
    const previousTitle = document.title;
    const existingRobotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobotsContent = existingRobotsMeta?.getAttribute('content') ?? null;
    const robotsMeta = existingRobotsMeta ?? document.createElement('meta');
    const didCreateRobotsMeta = !existingRobotsMeta;

    if (didCreateRobotsMeta) {
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }

    robotsMeta.setAttribute('content', 'noindex, nofollow, noarchive');
    document.title = 'Behind the Bloom · HerDays';

    return () => {
      document.title = previousTitle;

      if (didCreateRobotsMeta) {
        robotsMeta.remove();
        return;
      }

      if (previousRobotsContent === null) {
        robotsMeta.removeAttribute('content');
      } else {
        robotsMeta.setAttribute('content', previousRobotsContent);
      }
    };
  }, []);
}

function TeamPortrait({ member }) {
  if (!member.avatar) {
    return (
      <div
        className="bloom-profile__portrait bloom-profile__portrait--placeholder"
        role="img"
        aria-label={`Ảnh của ${member.name} đang được cập nhật`}
      >
        <span aria-hidden="true">{member.slot}</span>
      </div>
    );
  }

  return (
    <div className="bloom-profile__portrait">
      <img
        src={member.avatar}
        alt={`Ảnh chân dung ${member.name}`}
        width="640"
        height="640"
        loading="lazy"
      />
    </div>
  );
}

function BehindTheBloom() {
  usePrivatePageMetadata();

  const hasPlaceholderProfiles = teamMembers.some((member) => !member.avatar);

  return (
    <main className="behind-bloom-page">
      <header className="bloom-hero">
        <div className="bloom-hero__copy">
          <p className="bloom-hero__secret">Psst…</p>
          <img
            className="bloom-hero__logo"
            src={colorLogo}
            alt="HerDays"
            width="360"
            height="70"
          />
          <h1>Bạn đã tìm thấy Phòng Hồng.</h1>
          <p className="bloom-hero__lede">
            Nơi những người đứng sau HerDays bước ra khỏi terminal một lát —
            để kể về phần việc họ chăm chút mỗi ngày.
          </p>
        </div>

        <figure className="bloom-host">
          <img
            src={herbotImage}
            alt="Herbot đang ngồi bên laptop và vẫy chào"
            width="679"
            height="525"
            fetchPriority="high"
          />
          <figcaption>
            “HerDays không tự nhiên mà biết lắng nghe. Những người này đã dạy mình.”
          </figcaption>
        </figure>
      </header>

      <section className="bloom-map" aria-labelledby="bloom-map-title">
        <div className="bloom-map__intro">
          <h2 id="bloom-map-title">Những người làm HerDays nở hoa.</h2>
          <div className="bloom-map__intro-copy">
            <p>
              Mỗi hồ sơ là một phần của sản phẩm — từ ý tưởng, giao diện và dữ liệu
              đến những lần kiểm thử âm thầm trước khi HerDays đến tay người dùng.
            </p>
            {hasPlaceholderProfiles && (
              <p className="bloom-map__notice">
                Hồ sơ mẫu đang chờ tên, chức vụ và ảnh đã được từng thành viên đồng ý công khai.
              </p>
            )}
          </div>
        </div>

        <div className="bloom-map__canvas">
          <span className="bloom-map__orbit bloom-map__orbit--outer" aria-hidden="true" />
          <span className="bloom-map__orbit bloom-map__orbit--inner" aria-hidden="true" />

          <aside className="bloom-map__core" aria-label="Điểm kết nối HerDays">
            <img src={colorLogo} alt="" width="360" height="70" aria-hidden="true" />
            <p>
              Mỗi phần việc gặp nhau ở một điểm: chăm sóc trải nghiệm của người dùng.
            </p>
          </aside>

          {teamMembers.map((member, index) => {
            const position = PROFILE_POSITIONS[index] ?? 'extra';

            return (
              <article
                className={`bloom-profile bloom-profile--${position}`}
                key={member.id}
              >
                <TeamPortrait member={member} />
                <div className="bloom-profile__copy">
                  <p className="bloom-profile__slot">{member.slot}</p>
                  <h3>{member.name}</h3>
                  <p className="bloom-profile__role">{member.role}</p>
                  <p className="bloom-profile__contribution">{member.contribution}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="bloom-closing">
        <p>Được tạo bằng logic, sự tử tế và hơi nhiều màu hồng.</p>
        <div className="bloom-closing__meta">
          <img src={whiteLogo} alt="HerDays" width="1039" height="203" loading="lazy" />
          <span>Behind the Bloom</span>
        </div>
      </footer>
    </main>
  );
}

export default BehindTheBloom;
