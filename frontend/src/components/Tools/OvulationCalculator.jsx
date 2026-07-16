import React, { useState } from "react";
import "./CalculatorUI.scss";
import { TriangleAlert } from "lucide-react";
export default function OvulationCalculator({
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

    // Ngày rụng trứng = Ngày bắt đầu + Độ dài chu kỳ - 14 ngày (Pha hoàng thể)
    const ovulationDate = new Date(
      startDate.getTime() + (cycleLength - 14) * 24 * 60 * 60 * 1000,
    );

    // Cửa sổ thụ thai: Từ 5 ngày trước khi rụng trứng đến 1 ngày sau
    const fertileStart = new Date(
      ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000,
    );
    const fertileEnd = new Date(
      ovulationDate.getTime() + 1 * 24 * 60 * 60 * 1000,
    );

    // Ngày dự kiến có kinh tiếp theo
    const nextPeriod = new Date(
      startDate.getTime() + cycleLength * 24 * 60 * 60 * 1000,
    );

    const formatDate = (date) =>
      date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    const payload = {
      ovulation: formatDate(ovulationDate),
      fertileWindow: `${formatDate(fertileStart)} - ${formatDate(fertileEnd)}`,
      nextPeriod: formatDate(nextPeriod),
    };

    setResult(payload);
    onResult?.(payload);
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Tính Ngày Rụng Trứng</h2>
      <p className="calc-desc">
        Xác định "cửa sổ thụ thai" để chủ động lên kế hoạch đón bé yêu.
      </p>

      <form onSubmit={handleCalculate}>
        <div className="form-group">
          <label>Ngày đầu tiên của kỳ kinh cuối</label>
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
          Tính toán ngay
        </button>
      </form>
      <div className="calc-note">
        <span className="note-icon">
          {" "}
          <TriangleAlert />
        </span>
        <p>
          <strong>Lưu ý quan trọng:</strong> Kết quả dự đoán dựa trên chu kỳ
          sinh học trung bình, chỉ mang tính chất tham khảo. Vui lòng tham vấn
          bác sĩ chuyên khoa để có chẩn đoán y khoa chính xác nhất.
        </p>
      </div>
      {result && showInlineResult && (
        <div className="result-box">
          <h4>Kết quả của bạn</h4>
          <div className="result-item">
            <span className="label">Cửa sổ dễ thụ thai nhất:</span>
            <span className="value">{result.fertileWindow}</span>
          </div>
          <div className="result-item">
            <span className="label">Ngày rụng trứng (dự kiến):</span>
            <span className="value">{result.ovulation}</span>
          </div>
          <div className="result-item">
            <span className="label">Kỳ kinh tiếp theo:</span>
            <span className="value">{result.nextPeriod}</span>
          </div>
        </div>
      )}
    </div>
  );
}
