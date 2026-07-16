import React, { useState } from 'react';
import './CalculatorUI.scss';

export default function PregnancyDueDateCalculator() {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!lastPeriod || !cycleLength) return;

    const startDate = new Date(lastPeriod);
    
    // Quy tắc Naegele chuẩn: 280 ngày + chênh lệch chu kỳ so với 28 ngày
    const daysToAdd = 280 + (cycleLength - 28);
    const dueDate = new Date(startDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    const formatDate = (date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setResult({
      dueDate: formatDate(dueDate),
    });
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Tính Ngày Dự Sinh</h2>
      <p className="calc-desc">Chỉ cần ngày rớt dâu cuối cùng, HerDays sẽ tính ngay cột mốc bé yêu chào đời.</p>
      
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
            min="20" max="45" 
            required 
          />
        </div>

        <button type="submit" className="calc-btn">Xem ngày dự sinh</button>
      </form>

      <div className="calc-note">
        <span className="note-icon">💡</span>
        <p>
          <strong>Lưu ý:</strong> Ngày dự sinh chỉ là thời điểm dự kiến bé tròn 40 tuần thai. Thực tế, chỉ có khoảng 5% em bé chào đời đúng chóc vào ngày này, phần lớn sẽ sinh dao động trong khoảng từ tuần 37 đến tuần 41.
        </p>
      </div>

      {result && (
        <div className="result-box">
          <h4>Kết quả của bạn</h4>
          <div className="result-item">
            <span className="label">Ngày dự sinh (EDD):</span>
            <span className="value">{result.dueDate}</span>
          </div>
        </div>
      )}
    </div>
  );
}