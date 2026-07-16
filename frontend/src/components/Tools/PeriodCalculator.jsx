import React, { useState } from "react";
import "./CalculatorUI.scss";
import { TriangleAlert } from "lucide-react";
export default function PeriodCalculator({
  onResult,
  showInlineResult = true,
}) {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!lastPeriod || !cycleLength || !periodDuration) return;

    const startDate = new Date(lastPeriod);
    const nextStart = new Date(
      startDate.getTime() + cycleLength * 24 * 60 * 60 * 1000,
    );
    const nextEnd = new Date(
      nextStart.getTime() + (periodDuration - 1) * 24 * 60 * 60 * 1000,
    );

    const formatDate = (date) =>
      date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    const payload = {
      start: formatDate(nextStart),
      end: formatDate(nextEnd),
      window: `${formatDate(nextStart)} đến ${formatDate(nextEnd)}`,
    };

    setResult(payload);
    onResult?.(payload);
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Dự Đoán Kỳ Kinh</h2>
      <p className="calc-desc">
        Chuẩn bị sẵn sàng "vũ khí" cho ngày rụng dâu tiếp theo của bạn.
      </p>

      <form onSubmit={handleCalculate}>
        <div className="form-group">
          <label>Ngày rớt dâu gần nhất</label>
          <input
            type="date"
            className="form-input"
            value={lastPeriod}
            onChange={(e) => setLastPeriod(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Vòng kinh dài khoảng (Ngày)</label>
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
        <div className="form-group">
          <label>Kéo dài trong (Ngày)</label>
          <input
            type="number"
            className="form-input"
            value={periodDuration}
            onChange={(e) => setPeriodDuration(Number(e.target.value))}
            min="2"
            max="10"
            required
          />
        </div>

        <button type="submit" className="calc-btn">
          Dự đoán ngay
        </button>
      </form>

      <div className="calc-note">
        <span className="note-icon">
          {" "}
          <TriangleAlert />
        </span>
        <p>
          <strong>Lưu ý:</strong> Căng thẳng, chế độ ăn uống và giấc ngủ có thể
          làm chu kỳ thực tế xê dịch từ 1-3 ngày so với dự đoán máy tính.
        </p>
      </div>

      {result && showInlineResult && (
        <div className="result-box">
          <h4>Kỳ kinh tiếp theo của bạn</h4>
          <div className="result-item">
            <span className="label">Dự kiến bắt đầu:</span>
            <span className="value">{result.start}</span>
          </div>
          <div className="result-item">
            <span className="label">Thời gian hành kinh:</span>
            <span className="value">{result.window}</span>
          </div>
        </div>
      )}
    </div>
  );
}
