import React, { useState } from "react";
import "./CalculatorUI.scss";
import { TriangleAlert } from "lucide-react";
export default function PregnancyTestCalculator({
  onResult,
  showInlineResult = true,
}) {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!lastPeriod || !cycleLength) return;

    const startDate = new Date(lastPeriod);

    // Ngày dự kiến bắt đầu chu kỳ mới (cũng là ngày tốt nhất để thử thai)
    const nextPeriodDate = new Date(
      startDate.getTime() + cycleLength * 24 * 60 * 60 * 1000,
    );

    // Khuyên dùng: test sau khi trễ kinh 2-3 ngày để kết quả nét căng
    const bestTestDate = new Date(
      nextPeriodDate.getTime() + 2 * 24 * 60 * 60 * 1000,
    );

    const formatDate = (date) =>
      date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    const payload = {
      earlyTest: formatDate(nextPeriodDate),
      bestTest: formatDate(bestTestDate),
    };

    setResult(payload);
    onResult?.(payload);
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Tính Ngày Thử Thai</h2>
      <p className="calc-desc">
        Xác định thời điểm nồng độ hCG đủ cao để que thử hiện 2 vạch chuẩn xác
        nhất.
      </p>

      <form onSubmit={handleCalculate}>
        <div className="form-group">
          <label>Ngày đầu kỳ kinh cuối</label>
          <input
            type="date"
            className="form-input"
            value={lastPeriod}
            onChange={(e) => setLastPeriod(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Độ dài chu kỳ trung bình (Ngày)</label>
          <input
            type="number"
            className="form-input"
            value={cycleLength}
            onChange={(e) => setCycleLength(Number(e.target.value))}
            min="20"
            max="45"
            required
          />
        </div>

        <button type="submit" className="calc-btn">
          Xem ngày thử thai
        </button>
      </form>

      <div className="calc-note">
        <span className="note-icon">
          {" "}
          <TriangleAlert />
        </span>
        <p>
          <strong>Lưu ý:</strong> Thử thai quá sớm có thể cho ra kết quả âm tính
          giả do nồng độ hCG chưa đủ. Nên thử vào buổi sáng sớm ngay sau khi
          thức dậy.
        </p>
      </div>

      {result && showInlineResult && (
        <div className="result-box">
          <h4>Thời điểm thử thai lý tưởng</h4>
          <div className="result-item">
            <span className="label">Có thể thử nghiệm sớm từ:</span>
            <span className="value">{result.earlyTest}</span>
          </div>
          <div className="result-item">
            <span className="label">Chính xác nhất (Trễ kinh 2 ngày):</span>
            <span className="value">{result.bestTest}</span>
          </div>
        </div>
      )}
    </div>
  );
}
