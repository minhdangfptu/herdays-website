"use client";

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Tools.scss";
import "./ToolsCalculate.scss";
import { TOOLS, getToolById } from "./toolsConfig";
import tool1 from "../../assets/tool/tioool-01.png";
import tool2 from "../../assets/tool/tioool-02.png";
import tool3 from "../../assets/tool/tioool-03.png";
import tool4 from "../../assets/tool/tioool-04.png";
import tool5 from "../../assets/tool/tioool-05.png";
import tool6 from "../../assets/tool/tioool-06.png";
import tool7 from "../../assets/tool/tioool-07.png";
import tool8 from "../../assets/tool/tioool-08.png";
import tool9 from "../../assets/tool/tioool-09.png";
import tool10 from "../../assets/tool/tioool-10.png";
import bannerImage from "../../assets/tools-calculate-banner.png";

const IMAGE_MAP = {
  tool1,
  tool2,
  tool3,
  tool4,
  tool5,
  tool6,
  tool7,
  tool8,
  tool9,
  tool10,
};

// ── Hero content per tool (Vietnamese) ──────────────────────────────────────
const HERO_CONTENT = {
  ovulation: {
    title: "Tính ngày rụng trứng",
    description: (
      <>
        Xác định chính xác <strong>"cửa sổ thụ thai"</strong> dựa trên chu kỳ
        kinh nguyệt của bạn, giúp tăng khả năng thụ thai tự nhiên một cách chủ
        động.
      </>
    ),
  },
  "beta-hcg": {
    title: "Tính thời gian nhân đôi Beta hCG",
    description: (
      <>
        Đánh giá tốc độ tăng trưởng nồng độ hormone <strong>Beta hCG</strong>{" "}
        giữa hai lần xét nghiệm để theo dõi sức khỏe thai kỳ giai đoạn đầu.
      </>
    ),
  },
  "pregnancy-test": {
    title: "Tính ngày thử thai",
    description: (
      <>
        Dự đoán thời điểm nồng độ hormone đủ cao để que thử thai hiện rõ{" "}
        <strong>2 vạch</strong>, giúp bạn chọn thời điểm thử chính xác nhất.
      </>
    ),
  },
  "menstrual-cycle": {
    title: "Tính chu kỳ kinh nguyệt",
    description: (
      <>
        Ghi chép và phân tích chu kỳ kinh nguyệt, giúp thấu hiểu cơ thể và phát
        hiện sớm các <strong>dấu hiệu bất thường</strong>.
      </>
    ),
  },
  period: {
    title: "Dự đoán kỳ kinh",
    description: (
      <>
        Dựa trên dữ liệu cá nhân để dự báo ngày <strong>"rớt dâu"</strong> tiếp
        theo, giúp bạn luôn tự tin và chủ động trong mọi kế hoạch.
      </>
    ),
  },
  implantation: {
    title: "Tính ngày phôi làm tổ",
    description: (
      <>
        Dự đoán thời gian phôi thai bám vào thành tử cung — giai đoạn nhạy cảm
        nhất của thai kỳ, giúp bạn <strong>tối ưu chế độ nghỉ ngơi</strong>.
      </>
    ),
  },
  "pregnancy-weeks-months": {
    title: "Chuyển đổi tuần sang tháng thai kỳ",
    description: (
      <>
        Quy đổi siêu tốc tuổi thai từ <strong>số tuần y khoa</strong> sang số
        tháng dân dã, giúp dễ dàng theo dõi và chia sẻ với người thân.
      </>
    ),
  },
  "due-date": {
    title: "Tính ngày dự sinh",
    description: (
      <>
        Chỉ cần nhập ngày đầu kỳ kinh cuối, HerDays sẽ tính ngay{" "}
        <strong>cột mốc dự kiến bé yêu chào đời</strong> — giúp bạn chuẩn bị chu
        đáo nhất.
      </>
    ),
  },
  ivf: {
    title: "Tính ngày dự sinh IVF",
    description: (
      <>
        Dự đoán ngày sinh chuẩn xác cho mẹ bầu{" "}
        <strong>thụ tinh ống nghiệm (IVF)</strong> dựa trên ngày chuyển phôi và
        độ tuổi phôi.
      </>
    ),
  },
  ultrasound: {
    title: "Tính ngày dự sinh theo siêu âm",
    description: (
      <>
        Cập nhật ngày dự sinh <strong>sát với thực tế</strong> phát triển của
        thai nhi, dựa trên các chỉ số sinh trắc học từ phiếu siêu âm.
      </>
    ),
  },
};

const renderToolResult = (toolId, resultData) => {
  if (!resultData) return null;

  switch (toolId) {
    case "ovulation":
      return (
        <>
          <h4 className="tools-calculate-result-title">Kết quả của bạn</h4>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Cửa sổ dễ thụ thai nhất:
            </span>
            <span className="tools-calculate-result-value">
              {resultData.fertileWindow}
            </span>
          </div>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Ngày rụng trứng (dự kiến):
            </span>
            <span className="tools-calculate-result-value">
              {resultData.ovulation}
            </span>
          </div>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Kỳ kinh tiếp theo:
            </span>
            <span className="tools-calculate-result-value">
              {resultData.nextPeriod}
            </span>
          </div>
        </>
      );
    case "beta-hcg":
      return (
        <>
          <h4 className="tools-calculate-result-title">Kết quả đánh giá</h4>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Thời gian nhân đôi:
            </span>
            <span className="tools-calculate-result-value">
              {resultData.hours} giờ ({resultData.days} ngày)
            </span>
          </div>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Tốc độ tăng mỗi 48h:
            </span>
            <span className="tools-calculate-result-value">
              {resultData.increase}%
            </span>
          </div>
        </>
      );
    case "pregnancy-test":
      return (
        <>
          <h4 className="tools-calculate-result-title">
            Thời điểm thử thai lý tưởng
          </h4>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Có thể thử nghiệm sớm từ:
            </span>
            <span className="tools-calculate-result-value">
              {resultData.earlyTest}
            </span>
          </div>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Chính xác nhất (Trễ kinh 2 ngày):
            </span>
            <span className="tools-calculate-result-value">
              {resultData.bestTest}
            </span>
          </div>
        </>
      );
    case "menstrual-cycle":
      return (
        <>
          <h4 className="tools-calculate-result-title">Dự báo 3 chu kỳ tới</h4>
          <div className="tools-calculate-result-list">
            {resultData.map((item) => (
              <div className="tools-calculate-result-item" key={item.month}>
                <span className="tools-calculate-result-label">
                  Chu kỳ lần {item.month}:
                </span>
                <span className="tools-calculate-result-value">
                  {item.dateString}
                </span>
              </div>
            ))}
          </div>
        </>
      );
    case "period":
      return (
        <>
          <h4 className="tools-calculate-result-title">
            Kỳ kinh tiếp theo của bạn
          </h4>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Dự kiến bắt đầu:
            </span>
            <span className="tools-calculate-result-value">
              {resultData.start}
            </span>
          </div>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Thời gian hành kinh:
            </span>
            <span className="tools-calculate-result-value">
              {resultData.window}
            </span>
          </div>
        </>
      );
    case "implantation":
      return (
        <>
          <h4 className="tools-calculate-result-title">
            Giai đoạn làm tổ dự kiến
          </h4>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Ngày rụng trứng:
            </span>
            <span className="tools-calculate-result-value">
              {resultData.ovulation}
            </span>
          </div>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Cửa sổ phôi làm tổ:
            </span>
            <span className="tools-calculate-result-value">
              {resultData.implantationWindow}
            </span>
          </div>
        </>
      );
    case "pregnancy-weeks-months":
      return (
        <>
          <h4 className="tools-calculate-result-title">
            Tuổi thai của bạn đang là:
          </h4>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Quy đổi ra tháng:
            </span>
            <span className="tools-calculate-result-value">
              Tháng thứ {resultData.month}
            </span>
          </div>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Tam cá nguyệt (Quý):
            </span>
            <span className="tools-calculate-result-value">
              Quý {resultData.trimester}
            </span>
          </div>
        </>
      );
    case "due-date":
    case "ivf":
    case "ultrasound":
      return (
        <>
          <h4 className="tools-calculate-result-title">Kết quả của bạn</h4>
          <div className="tools-calculate-result-item">
            <span className="tools-calculate-result-label">
              Ngày dự sinh (EDD):
            </span>
            <span className="tools-calculate-result-value">
              {resultData.dueDate}
            </span>
          </div>
        </>
      );
    default:
      return null;
  }
};

function CalculatorContent({ tool, toolId }) {
  const Component = tool?.component;
  const [toolResult, setToolResult] = useState(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  const handleToolResult = (result) => {
    setIsLoadingResult(true);
    setToolResult(null);

    window.setTimeout(() => {
      setToolResult(result);
      setIsLoadingResult(false);
    }, 2000);
  };

  return (
    <div className="tools-calculate-calculator-row">
      <div className="tools-calculate-calculator-col">
        {Component && (
          <Component onResult={handleToolResult} showInlineResult={false} />
        )}
      </div>
      <div className="tools-calculate-results-col">
        <h3 className="tools-calculate-results-title">Kết quả</h3>
        {isLoadingResult ? (
          <div className="tools-calculate-results-card tools-calculate-results-loading">
            <div className="tools-calculate-loading-spinner" />
            <p className="tools-calculate-loading-text">
              Đang tính toán kết quả của bạn...
            </p>
          </div>
        ) : toolResult ? (
          <div className="tools-calculate-results-card">
            {renderToolResult(toolId, toolResult)}
          </div>
        ) : (
          <div className="tools-calculate-results-placeholder">
            Điền thông tin bên trái và nhấn <strong>"Tính toán"</strong> để xem
            kết quả của bạn
          </div>
        )}
      </div>
    </div>
  );
}

// ── Calculator Page View ─────────────────────────────────────────────────────
function CalculatorView() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const tool = getToolById(toolId);
  const hero = HERO_CONTENT[toolId] || {
    title: tool?.name || "",
    description: tool?.description || "",
  };

  const handleBack = () => navigate("/tools");

  if (!tool) {
    return (
      <div className="tools-calculate-page">
        <div
          className="tools-calculate-container"
          style={{ textAlign: "center", padding: "60px 0" }}
        >
          <p>Không tìm thấy công cụ.</p>
          <button onClick={handleBack}>Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tools-calculate-page">
      <div
        className="tools-calculate-hero"
        style={{
          backgroundImage: ` url(${bannerImage})`,
        }}
      >
        {/* <div className="tools-calculate-breadcrumb">
          <div className="tools-calculate-breadcrumb-inner">
            <a href="/" className="tools-calculate-breadcrumb-link">
              Trang chủ
            </a>
            <span className="tools-calculate-breadcrumb-separator">›</span>
            <a href="/tools" className="tools-calculate-breadcrumb-link">
              Công cụ
            </a>
            <span className="tools-calculate-breadcrumb-separator">›</span>
            <button
              className="tools-calculate-breadcrumb-back"
              onClick={handleBack}
            >
              {tool.name}
            </button>
          </div>
        </div> */}

        <div className="tools-calculate-hero-inner">
          <div className="tools-calculate-hero-content">
            <p className="tools-calculate-hero-eyebrow">HerDays Tools</p>
            <h1 className="tools-calculate-hero-title">{hero.title}</h1>
            <p className="tools-calculate-hero-description">
              {hero.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="tools-calculate-container">
        <div className="tools-calculate-main">
          {/* <div className="tools-calculate-article-info">
            <p className="tools-calculate-update-date">
              Cập nhật: Tháng 7 năm 2026
            </p>
            <div className="tools-calculate-reviewer">
              <div className="tools-calculate-reviewer-avatar" />
              <div>
                <p className="tools-calculate-reviewer-text">
                  Được tham vấn y khoa bởi{" "}
                  <a href="#" className="tools-calculate-reviewer-link">
                    Bác sĩ Jenna Flanagan
                  </a>
                  , Trợ lý Giáo sư Sản phụ khoa, Đại học Utah, Hoa Kỳ
                </p>
              </div>
            </div>
            <p className="tools-calculate-written-by">
              Viết bởi{" "}
              <a href="#" className="tools-calculate-reviewer-link">
                Natalie Healey
              </a>
            </p>
          </div> */}

          <CalculatorContent key={toolId} tool={tool} toolId={toolId} />
        </div>
      </div>
    </div>
  );
}

// ── Tools Listing Page View ──────────────────────────────────────────────────
function ToolsListing() {
  const navigate = useNavigate();

  return (
    <div className="tools-page">
      <div className="tools-container">
        <h1 className="tools-title">Công cụ</h1>
        <div className="tools-grid">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="tools-card"
              onClick={() => navigate(`/tools/${tool.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/tools/${tool.id}`)
              }
            >
              <div className="tools-card-image">
                <img src={IMAGE_MAP[tool.image]} alt={tool.name} />
              </div>
              <h3 className="tools-card-name">{tool.name}</h3>
              <p className="tools-card-description">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────
export default function Tools() {
  const { toolId } = useParams();
  return toolId ? <CalculatorView /> : <ToolsListing />;
}
