import React, { useState } from "react";
import toast from "react-hot-toast";
import "./CalculatorUI.scss";
import { TriangleAlert } from "lucide-react";
export default function PregnancyWeeksToMonths({
  onResult,
  showInlineResult = true,
}) {
  const [weeks, setWeeks] = useState("");
  const [days, setDays] = useState("0");
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!weeks) return;

    const totalWeeks = parseInt(weeks, 10);
    const totalDays = parseInt(days, 10);

    if (totalWeeks < 1 || totalWeeks > 42) {
      toast.error("Số tuần thai thường dao động từ 1 đến 42 tuần nha bồ!");
      return;
    }

    // Logic quy đổi tháng và quý chuẩn y khoa
    let month = 1;
    let trimester = 1;

    if (totalWeeks >= 1 && totalWeeks <= 4) month = 1;
    else if (totalWeeks >= 5 && totalWeeks <= 8) month = 2;
    else if (totalWeeks >= 9 && totalWeeks <= 13) month = 3;
    else if (totalWeeks >= 14 && totalWeeks <= 17) {
      month = 4;
      trimester = 2;
    } else if (totalWeeks >= 18 && totalWeeks <= 22) {
      month = 5;
      trimester = 2;
    } else if (totalWeeks >= 23 && totalWeeks <= 27) {
      month = 6;
      trimester = 2;
    } else if (totalWeeks >= 28 && totalWeeks <= 31) {
      month = 7;
      trimester = 3;
    } else if (totalWeeks >= 32 && totalWeeks <= 35) {
      month = 8;
      trimester = 3;
    } else if (totalWeeks >= 36) {
      month = 9;
      trimester = 3;
    }

    const payload = {
      ageText: `${totalWeeks} tuần ${totalDays > 0 ? `${totalDays} ngày` : ""}`,
      month,
      trimester,
    };

    setResult(payload);
    onResult?.(payload);
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Đổi Tuần Sang Tháng Thai Kỳ</h2>
      <p className="calc-desc">
        Quy đổi siêu tốc tuổi thai khoa học sang số tháng dân dã.
      </p>

      <form onSubmit={handleCalculate}>
        <div className="form-group">
          <label>Số tuần thai</label>
          <input
            type="number"
            className="form-input"
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
            placeholder="Ví dụ: 12"
            required
          />
        </div>
        <div className="form-group">
          <label>Số ngày lẻ (nếu có)</label>
          <select
            className="form-input"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d}>
                {d} ngày
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="calc-btn">
          Quy đổi ngay
        </button>
      </form>

      <div className="calc-note">
        <span className="note-icon">
          {" "}
          <TriangleAlert />
        </span>
        <p>
          <strong>Lưu ý:</strong> Một tháng thai kỳ thường dài hơn 4 tuần một
          chút (khoảng 4.3 tuần). Do đó, cách chia tháng này được tính theo các
          mốc phát triển sinh lý của em bé.
        </p>
      </div>

      {result && showInlineResult && (
        <div className="result-box">
          <h4>Tuổi thai của bạn đang là:</h4>
          <div className="result-item">
            <span className="label">Quy đổi ra tháng:</span>
            <span className="value">Tháng thứ {result.month}</span>
          </div>
          <div className="result-item">
            <span className="label">Tam cá nguyệt (Quý):</span>
            <span className="value">Quý {result.trimester}</span>
          </div>
        </div>
      )}
    </div>
  );
}
