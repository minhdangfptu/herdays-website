import React from "react";
import "./Subscription.scss";
import sub_bg from "../../assets/subcription_bg_1.png";

export default function SubscriptionStep1() {
  return (
    <>
      <div className="subscription-container">
        <div className="subscription-background">
          <img src={sub_bg} alt="Subscription Background" />
        </div>

        {/* Content Section */}
        <div className="subscription-content">
          {/* Main Card: Đã xóa div ngôi sao và vòng oval */}
          <div className="subscription-card">
            <h1 className="subscription-title">
              Mở khóa toàn bộ tính năng cao cấp trên ứng dụng.
            </h1>

            <p className="subscription-subtitle">
              Từ phân tích và dự báo chuyên sâu từ Trợ lý AI, lưu trữ dữ liệu
              <br /> đến xuất báo cáo y khoa không giới hạn.
            </p>

            <p className="subscription-hint">Huỷ bất cứ lúc nào</p>

            <button className="subscription-button">Nâng cấp ngay</button>
          </div>
        </div>
      </div>
    </>
  );
}
