import React from "react";
import "./TermOfUse.scss"; // Sử dụng chung file style theo yêu cầu của bạn

export default function PrivacyPolicy() {
  const policies = [
    {
      title: "Lời ngỏ từ HerDays",
      content: `Chào bạn, HerDays hiểu rằng những thông tin bạn cung cấp là những dữ liệu cá nhân quan trọng. Chúng tôi xây dựng nền tảng này dựa trên sự tôn trọng tuyệt đối đối với quyền riêng tư của người dùng. Chính sách này được lập ra để bạn nắm rõ chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn như thế nào.`,
    },
    {
      title: "1. Thông tin chúng tôi thu thập",
      content: `Để HerDays có thể hỗ trợ bạn tốt nhất, chúng tôi cần bạn cung cấp một số thông tin sau:\n\n• Thông tin tài khoản: Họ tên, Email, Tên đăng nhập, Mật khẩu (đã được mã hóa an toàn).\n\n• Dữ liệu sức khỏe & Thể chất: Ngày hành kinh, chu kỳ kinh nguyệt, nhiệt độ cơ thể (BBT), kết quả siêu âm, lịch sử IVF, tiến trình thai kỳ, và các triệu chứng sức khỏe bạn ghi nhận mỗi ngày.\n\n• Dữ liệu mua sắm: Địa chỉ nhận hàng, số điện thoại liên hệ và lịch sử các sản phẩm chăm sóc sức khỏe bạn đã đặt.\n\n• Dữ liệu tương tác: Nội dung bạn trao đổi với Trợ lý AI hoặc chuyên gia để chúng tôi có thể đưa ra tư vấn sát nhất với tình trạng của bạn.`,
    },
    {
      title: "2. Mục đích sử dụng dữ liệu",
      content: `Mọi dữ liệu thu thập đều nhằm mục đích cải thiện trải nghiệm của bạn trên HerDays. Cụ thể:\n\n• Dự đoán chính xác chu kỳ tiếp theo, ngày rụng trứng và cửa sổ thụ thai.\n\n• Cá nhân hóa các bài viết Blog, tư vấn sức khỏe và các tính năng hỗ trợ (từ chu kỳ kinh nguyệt đến mang thai và IVF).\n\n• Hỗ trợ Trợ lý AI hiểu rõ cơ địa của bạn để đưa ra những phân tích chuẩn xác.\n\n• Gợi ý các sản phẩm và gói dịch vụ (Subscription Box) phù hợp nhất với tình trạng cơ thể của bạn.\n\n• Gửi thông báo nhắc nhở y tế, lịch khám hoặc các hoạt động chăm sóc cá nhân đúng giờ.`,
    },
    {
      title: "3. Chia sẻ dữ liệu",
      content: `Chúng tôi cam kết TUYỆT ĐỐI KHÔNG bán dữ liệu sức khỏe hay thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo. Dữ liệu của bạn chỉ được chia sẻ trong các trường hợp bắt buộc sau:\n\n• Đối tác vận chuyển: Chia sẻ Tên, Số điện thoại và Địa chỉ để giao hàng đến cho bạn.\n\n• Chuyên gia y tế: Thông tin sức khỏe chỉ được chia sẻ cho chuyên gia/bác sĩ trên ứng dụng CHỈ KHI bạn chủ động cho phép và yêu cầu tư vấn.`,
    },
    {
      title: "4. Bảo mật dữ liệu",
      content: `HerDays sử dụng các tiêu chuẩn mã hóa dữ liệu hiện đại. Các thông tin nhạy cảm của bạn được lưu trữ trên các máy chủ bảo mật cao, hạn chế tối đa quyền truy cập trái phép. Mật khẩu của bạn được mã hóa một chiều, đảm bảo tính bảo mật tuyệt đối ngay cả với đội ngũ kỹ thuật nội bộ của HerDays.`,
    },
    {
      title: "5. Quyền kiểm soát của người dùng",
      content: `Bạn có toàn quyền quyết định đối với dữ liệu cá nhân của mình:\n\n• Chỉnh sửa & Cập nhật: Bạn có thể thay đổi thông tin cá nhân và dữ liệu sức khỏe bất cứ lúc nào trong mục Cài đặt tài khoản.\n\n• Xóa dữ liệu: Nếu không muốn tiếp tục sử dụng, bạn có quyền yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu lịch sử khỏi hệ thống của HerDays. Quá trình này không thể hoàn tác.\n\n• Tùy chỉnh thông báo: Bạn có thể bật/tắt quyền truy cập vị trí, máy ảnh, hoặc thông báo đẩy (Push Notification) ngay trong phần Cài đặt của thiết bị.`,
    },
    {
      title: "6. Cập nhật Chính sách",
      content: `Chính sách này có thể được cập nhật để phù hợp với các tính năng mới của ứng dụng hoặc quy định pháp luật. Nếu có bất kỳ thay đổi lớn nào ảnh hưởng đến quyền lợi dữ liệu của bạn, chúng tôi sẽ chủ động gửi thông báo trên ứng dụng trước khi áp dụng.`,
    },
    {
      title: "7. Liên hệ với chúng tôi",
      content: `Nếu bạn có bất kỳ câu hỏi nào về việc dữ liệu của mình đang được bảo vệ như thế nào, vui lòng liên hệ với chúng tôi qua:\n\n• Email hỗ trợ: support@herdays.vn\n• Fanpage: Herdays\n• Hoặc trực tiếp qua mục Liên hệ với chúng tôi ngay trên ứng dụng.`,
    },
  ];

  return (
    <div className="term-of-use">
      <div className="term-header">
        <h1 className="term-title">Chính sách bảo mật HerDays</h1>
        <p className="term-subtitle">
          Dưới đây là chính sách bảo mật dữ liệu của chúng tôi khi bạn sử dụng
          HerDays
        </p>
      </div>

      <div className="term-card">
        <div className="term-content">
          {policies.map((policy, index) => (
            <div key={index} className="term-section">
              <div className="section-heading">
                <h2 className="section-title">{policy.title}</h2>
              </div>
              <p className="section-content">{policy.content}</p>
            </div>
          ))}
        </div>

        <div className="term-footer">
          <p>Cập nhật lần cuối: 08 tháng 10, 2025</p>
        </div>
      </div>
    </div>
  );
}
