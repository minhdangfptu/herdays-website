import React, { useState } from 'react';
import './CalculatorUI.scss';

export default function IVFDueDateCalculator() {
  const [transferDate, setTransferDate] = useState('');
  const [embryoAge, setEmbryoAge] = useState('5'); // Mặc định phôi ngày 5 (phổ biến nhất)
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!transferDate) return;

    const tDate = new Date(transferDate);
    
    // Nếu phôi ngày 3: Cộng 263 ngày. Phôi ngày 5: Cộng 261 ngày.
    const daysToAdd = embryoAge === '3' ? 263 : 261;
    const dueDate = new Date(tDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    const formatDate = (date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setResult({
      dueDate: formatDate(dueDate),
    });
  };

  return (
    <div className="calculator-widget">
      <h2 className="calc-title">Tính Ngày Dự Sinh IVF</h2>
      <p className="calc-desc">Công cụ được thiết kế chuyên biệt dành cho các mẹ bầu thụ tinh ống nghiệm.</p>
      
      <form onSubmit={handleCalculate}>
        <div className="form-group">
          <label>Ngày chuyển phôi</label>
          <input 
            type="date" 
            className="form-input" 
            value={transferDate} 
            onChange={(e) => setTransferDate(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Độ tuổi của phôi</label>
          <select 
            className="form-input" 
            value={embryoAge} 
            onChange={(e) => setEmbryoAge(e.target.value)}
          >
            <option value="3">Phôi ngày 3</option>
            <option value="5">Phôi ngày 5 (Phôi nang)</option>
          </select>
        </div>

        <button type="submit" className="calc-btn">Tính toán ngay</button>
      </form>

      <div className="calc-note">
        <span className="note-icon">💡</span>
        <p>
          <strong>Lưu ý:</strong> Cách tính qua IVF thường mang lại độ chuẩn xác rất cao về tuổi thai so với tính theo kỳ kinh nguyệt tự nhiên, giúp các bác sĩ theo dõi sát sao sự phát triển của thai nhi.
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