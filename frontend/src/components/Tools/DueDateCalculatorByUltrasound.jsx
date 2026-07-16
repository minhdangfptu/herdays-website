import React, { useState } from 'react';
import './CalculatorUI.scss';

export default function DueDateCalculatorByUltrasound() {
  const [usDate, setUsDate] = useState('');
  const [weeks, setWeeks] = useState('');
  const [days, setDays] = useState('0');
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!usDate || !weeks) return;

    const uDate = new Date(usDate);
    const w = parseInt(weeks, 10);
    const d = parseInt(days, 10);

    // Tổng số ngày thai đã phát triển tính đến ngày siêu âm
    const currentGestationalAgeInDays = (w * 7) + d;
    
    // Ngày dự sinh = Ngày siêu âm + (280 ngày - Số ngày tuổi thai hiện tại)
    const remainingDays = 280 - currentGestationalAgeInDays;
    const dueDate = new Date(uDate.getTime() + remainingDays * 24 * 60 * 60 * 1000);

    const formatDate = (date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setResult({
      dueDate: formatDate(dueDate),
    });
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Dự Sinh Theo Siêu Âm</h2>
      <p className="calc-desc">Cập nhật lại ngày dự sinh chuẩn xác nhất dựa trên các chỉ số sinh trắc học trên phiếu siêu âm.</p>
      
      <form onSubmit={handleCalculate}>
        <div className="form-group">
          <label>Ngày siêu âm</label>
          <input 
            type="date" 
            className="form-input" 
            value={usDate} 
            onChange={(e) => setUsDate(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Số tuần thai (Ghi trên phiếu)</label>
          <input 
            type="number" 
            className="form-input" 
            value={weeks} 
            onChange={(e) => setWeeks(e.target.value)} 
            min="1" max="42" 
            placeholder="Ví dụ: 12" 
            required 
          />
        </div>
        <div className="form-group">
          <label>Số ngày lẻ (Ghi trên phiếu)</label>
          <select className="form-input" value={days} onChange={(e) => setDays(e.target.value)}>
            {[0, 1, 2, 3, 4, 5, 6].map(d => (
              <option key={d} value={d}>{d} ngày</option>
            ))}
          </select>
        </div>

        <button type="submit" className="calc-btn">Xem ngày dự sinh</button>
      </form>

      <div className="calc-note">
        <span className="note-icon">💡</span>
        <p>
          <strong>Lưu ý:</strong> Ngày dự sinh theo siêu âm 3 tháng đầu (đặc biệt là tuần 11-13) thường được bác sĩ coi là độ chính xác cao nhất để chốt mốc sinh đẻ.
        </p>
      </div>

      {result && (
        <div className="result-box">
          <h4>Kết quả hiệu chỉnh</h4>
          <div className="result-item">
            <span className="label">Ngày dự sinh (EDD):</span>
            <span className="value">{result.dueDate}</span>
          </div>
        </div>
      )}
    </div>
  );
}