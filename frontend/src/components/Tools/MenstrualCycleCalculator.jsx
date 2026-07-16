import React, { useState } from 'react';
import './CalculatorUI.scss';

export default function MenstrualCycleCalculator() {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [result, setResult] = useState([]);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!lastPeriod || !cycleLength) return;

    let currentDate = new Date(lastPeriod);
    const forecast = [];

    const formatDate = (date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Dự đoán 3 tháng tiếp theo
    for (let i = 1; i <= 3; i++) {
      const nextStart = new Date(currentDate.getTime() + cycleLength * 24 * 60 * 60 * 1000);
      const nextEnd = new Date(nextStart.getTime() + (periodDuration - 1) * 24 * 60 * 60 * 1000);
      
      forecast.push({
        month: i,
        dateString: `${formatDate(nextStart)} - ${formatDate(nextEnd)}`
      });
      
      currentDate = nextStart;
    }

    setResult(forecast);
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Dự Đoán Chu Kỳ Kinh Nguyệt</h2>
      <p className="calc-desc">Theo dõi và dự báo ngày "rớt dâu" cho 3 tháng tiếp theo để luôn tự tin.</p>
      
      <form onSubmit={handleCalculate}>
        <div className="form-group">
          <label>Ngày đầu của kỳ kinh gần nhất</label>
          <input 
            type="date" 
            className="form-input" 
            value={lastPeriod} 
            onChange={(e) => setLastPeriod(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Khoảng cách giữa các chu kỳ (Ngày)</label>
          <input 
            type="number" 
            className="form-input" 
            value={cycleLength} 
            onChange={(e) => setCycleLength(Number(e.target.value))} 
            min="20" max="45" 
            required 
          />
        </div>
        <div className="form-group">
          <label>Số ngày hành kinh trung bình</label>
          <input 
            type="number" 
            className="form-input" 
            value={periodDuration} 
            onChange={(e) => setPeriodDuration(Number(e.target.value))} 
            min="2" max="10" 
            required 
          />
        </div>

        <button type="submit" className="calc-btn">Xem dự báo</button>
      </form>
      <div className="calc-note">
        <span className="note-icon">💡</span>
        <p>
          <strong>Lưu ý quan trọng:</strong> Kết quả dự đoán dựa trên chu kỳ sinh học trung bình, chỉ mang tính chất tham khảo. Vui lòng tham vấn bác sĩ chuyên khoa để có chẩn đoán y khoa chính xác nhất.
        </p>
      </div>
      {result.length > 0 && (
        <div className="result-box">
          <h4>Dự báo 3 chu kỳ tới</h4>
          {result.map((item) => (
            <div className="result-item" key={item.month}>
              <span className="label">Chu kỳ lần {item.month}:</span>
              <span className="value">{item.dateString}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}