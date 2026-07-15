'use client';

import React from 'react';
import './Tools.scss';
import tool1 from '../../assets/tool/tioool-01.png';
import tool2 from '../../assets/tool/tioool-02.png';
import tool3 from '../../assets/tool/tioool-03.png';
import tool4 from '../../assets/tool/tioool-04.png';
import tool5 from '../../assets/tool/tioool-05.png';
import tool6 from '../../assets/tool/tioool-06.png';
import tool7 from '../../assets/tool/tioool-07.png';
import tool8 from '../../assets/tool/tioool-08.png';
import tool9 from '../../assets/tool/tioool-09.png';
import tool10 from '../../assets/tool/tioool-10.png';

export default function Tools() {
  const tools = [
    {
      id: 1,
      name: 'Tính ngày rụng trứng',
      description: 'Phân tích chu kỳ để tìm ra "cửa sổ thụ thai", giúp bạn chủ động kế hoạch đón bé yêu.',
      image: tool1,
    },
    {
      id: 2,
      name: 'Tính thời gian nhân đôi Beta hCG',
      description: 'Đánh giá tốc độ tăng trưởng nồng độ Beta hCG để theo dõi sức khỏe thai kỳ giai đoạn đầu.',
      image: tool2,
    },
    {
      id: 3,
      name: 'Tính ngày thử thai',
      description: 'Dự đoán thời điểm nồng độ hormone đủ cao để que thử thai hiện rõ 2 vạch chuẩn xác nhất.',
      image: tool3,
    },
    {
      id: 4,
      name: 'Tính chu kỳ kinh nguyệt',
      description: 'Ghi chép và phân tích chu kỳ, giúp thấu hiểu cơ thể và phát hiện sớm các dấu hiệu bất thường.',
      image: tool4,
    },
    {
      id: 5,
      name: 'Dự đoán kỳ kinh',
      description: 'Dựa trên dữ liệu cá nhân để dự báo ngày "rớt dâu" tiếp theo, giúp bạn luôn tự tin, chủ động.',
      image: tool5,
    },
    {
      id: 6,
      name: 'Tính ngày phôi làm tổ',
      description: 'Dự đoán thời gian phôi thai làm tổ, giúp bạn tối ưu chế độ nghỉ ngơi ở giai đoạn nhạy cảm này.',
      image: tool6,
    },
    {
      id: 7,
      name: 'Chuyển đổi tuần sang tháng thai kỳ',
      description: 'Quy đổi siêu tốc tuổi thai từ số tuần y khoa sang số tháng để dễ dàng theo dõi và chia sẻ.',
      image: tool7,
    },
    {
      id: 8,
      name: 'Tính ngày dự sinh',
      description: 'Chỉ cần nhập ngày đầu kỳ kinh cuối, công cụ sẽ tính ngay cột mốc dự kiến bé yêu chào đời.',
      image: tool8,
    },
    {
      id: 9,
      name: 'Tính ngày dự sinh IVF',
      description: 'Dự đoán ngày sinh chuẩn xác cho mẹ bầu IVF dựa trên ngày chuyển phôi và độ tuổi của phôi.',
      image: tool9,
    },
    {
      id: 10,
      name: 'Tính ngày dự sinh theo siêu âm',
      description: 'Cập nhật ngày dự sinh sát với thực tế phát triển của thai nhi dựa trên các chỉ số siêu âm.',
      image: tool10,
    }
  ];

  return (
    <div className="tools-page">
      <div className="tools-container">
        <h1 className="tools-title">Công cụ</h1>

        <div className="tools-grid">
          {tools.map((tool) => (
            <div key={tool.id} className="tools-card">
              <div className="tools-card-image">
                <img src={tool.image} alt={tool.name} />
              </div>
              <h3 className="tools-card-name">{tool.name}</h3>
              <p className="tools-card-description">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
