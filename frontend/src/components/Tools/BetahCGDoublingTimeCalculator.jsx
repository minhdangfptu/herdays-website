import React, { useState } from "react";
import toast from "react-hot-toast";
import "./CalculatorUI.scss";
import { TriangleAlert } from "lucide-react";
export default function BetahCGDoublingTimeCalculator({
  onResult,
  showInlineResult = true,
}) {
  const [hcg1, setHcg1] = useState("");
  const [date1, setDate1] = useState("");
  const [hcg2, setHcg2] = useState("");
  const [date2, setDate2] = useState("");
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!hcg1 || !hcg2 || !date1 || !date2) return;

    const val1 = parseFloat(hcg1);
    const val2 = parseFloat(hcg2);
    const time1 = new Date(date1).getTime();
    const time2 = new Date(date2).getTime();

    if (val2 <= val1) {
      toast.error("Nồng độ Beta hCG lần 2 phải lớn hơn lần 1.");
      return;
    }
    if (time2 <= time1) {
      toast.error("Thời điểm xét nghiệm lần 2 phải diễn ra sau lần 1.");
      return;
    }

    // Tính chênh lệch thời gian ra giờ
    const hoursDiff = (time2 - time1) / (1000 * 60 * 60);

    // Công thức tính thời gian nhân đôi: T = (t2 - t1) * log(2) / log(hCG2 / hCG1)
    const doublingTimeHours = (hoursDiff * Math.log(2)) / Math.log(val2 / val1);
    const doublingTimeDays = doublingTimeHours / 24;

    // Tính % tăng trưởng trong 2 ngày (48 giờ)
    const twoDayIncrease = (Math.pow(2, 48 / doublingTimeHours) - 1) * 100;

    const payload = {
      hours: doublingTimeHours.toFixed(1),
      days: doublingTimeDays.toFixed(1),
      increase: twoDayIncrease.toFixed(1),
    };

    setResult(payload);
    onResult?.(payload);
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Tính Thời Gian Nhân Đôi Beta hCG</h2>
      <p className="calc-desc">
        Theo dõi sự phát triển của thai kỳ giai đoạn đầu thông qua chỉ số máu.
      </p>

      <form onSubmit={handleCalculate}>
        <div className="form-group">
          <label>Nồng độ Beta hCG lần 1 (mIU/mL)</label>
          <input
            type="number"
            className="form-input"
            value={hcg1}
            onChange={(e) => setHcg1(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Thời điểm xét nghiệm lần 1</label>
          <input
            type="datetime-local"
            className="form-input"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Nồng độ Beta hCG lần 2 (mIU/mL)</label>
          <input
            type="number"
            className="form-input"
            value={hcg2}
            onChange={(e) => setHcg2(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Thời điểm xét nghiệm lần 2</label>
          <input
            type="datetime-local"
            className="form-input"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="calc-btn">
          Phân tích chỉ số
        </button>
      </form>
      <div className="calc-note">
        <span className="note-icon">
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
          <h4>Kết quả đánh giá</h4>
          <div className="result-item">
            <span className="label">Thời gian nhân đôi:</span>
            <span className="value">
              {result.hours} giờ ({result.days} ngày)
            </span>
          </div>
          <div className="result-item">
            <span className="label">Tốc độ tăng mỗi 48h:</span>
            <span className="value">{result.increase}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
