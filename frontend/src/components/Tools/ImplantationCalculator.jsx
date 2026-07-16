import React, { useState } from "react";
import "./CalculatorUI.scss";
import { TriangleAlert } from "lucide-react";

export default function ImplantationCalculator({
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

    // Rụng trứng = Ngày bắt đầu + Độ dài chu kỳ - 14
    const ovulationDate = new Date(
      startDate.getTime() + (cycleLength - 14) * 24 * 60 * 60 * 1000,
    );

    // Cửa sổ làm tổ: Ngày rụng trứng + 6 ngày ĐẾN Ngày rụng trứng + 12 ngày
    const impStart = new Date(
      ovulationDate.getTime() + 6 * 24 * 60 * 60 * 1000,
    );
    const impEnd = new Date(ovulationDate.getTime() + 12 * 24 * 60 * 60 * 1000);

    const formatDate = (date) =>
      date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    const payload = {
      ovulation: formatDate(ovulationDate),
      implantationWindow: `${formatDate(impStart)} - ${formatDate(impEnd)}`,
    };

    setResult(payload);
    onResult?.(payload);
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Tính Ngày Phôi Làm Tổ</h2>
      <p className="calc-desc">
        Theo dõi sát sao hành trình di chuyển và tìm chỗ bám của phôi thai.
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
          <label>Độ dài chu kỳ kinh (Ngày)</label>
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
          Xem kết quả
        </button>
      </form>

      <div className="calc-note">
        <span className="note-icon">
          {" "}
          <TriangleAlert />
        </span>
        <p>
          <strong>Dấu hiệu nhận biết:</strong> Trong giai đoạn làm tổ, bạn có
          thể thấy xuất hiện một chút máu báo thai màu hồng nhạt hoặc nâu, kèm
          theo cảm giác châm chích nhẹ ở bụng dưới.
        </p>
      </div>

      {result && showInlineResult && (
        <div className="result-box">
          <h4>Giai đoạn làm tổ dự kiến</h4>
          <div className="result-item">
            <span className="label">Ngày rụng trứng:</span>
            <span className="value">{result.ovulation}</span>
          </div>
          <div className="result-item">
            <span className="label">Cửa sổ phôi làm tổ:</span>
            <span className="value">{result.implantationWindow}</span>
          </div>
        </div>
      )}
    </div>
  );
}
