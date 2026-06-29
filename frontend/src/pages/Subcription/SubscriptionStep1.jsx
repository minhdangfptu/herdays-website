import React from "react";
import "./Subscription.scss";
import sub_bg from "../../assets/subcription_bg_1.png";

export default function SubscriptionStep1() {
  return (
    <>
      <div className="sub-container">
        <div className="sub-bg">
          <img src={sub_bg} alt="Subscription Background" />
        </div>

        <div className="sub-content">
          <div className="sub-card">
            <h1 className="sub-title">
              Mở khóa toàn bộ tính năng cao cấp trên ứng dụng.
            </h1>

            <p className="sub-subtitle">
              Từ phân tích và dự báo chuyên sâu từ Trợ lý AI, lưu trữ dữ liệu
              <br /> đến xuất báo cáo y khoa không giới hạn.
            </p>

            <p className="sub-hint">Huỷ bất cứ lúc nào</p>

            <button className="sub-btn-upgrade">Nâng cấp ngay</button>
          </div>
        </div>
      </div>
    </>
  );
}
