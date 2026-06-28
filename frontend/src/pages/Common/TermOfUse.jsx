import React from "react";
import "./TermOfUse.scss";

export default function TermOfUse() {
  const terms = [
    {
      title: "1. Lời chào từ HerDays",
      content: `Chào mừng bạn gia nhập cộng đồng HerDays! Bằng việc tải xuống, đăng ký tài khoản, truy cập hoặc sử dụng ứng dụng HerDays, bạn đồng ý tuân thủ và bị ràng buộc bởi các Điều khoản dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, xin bạn vui lòng ngừng sử dụng ứng dụng.`,
    },
    {
      title: "2. Bản chất dịch vụ & Tuyên bố miễn trừ trách nhiệm y tế",
      content: `HerDays là một ứng dụng đồng hành, cung cấp công cụ theo dõi chu kỳ kinh nguyệt, thai kỳ, hành trình IVF, mua sắm tiện ích và chia sẻ kiến thức chăm sóc sức khỏe nữ giới. Tuy nhiên, bạn cần đặc biệt lưu ý:\n\n• HerDays không phải là cơ sở y tế hay bác sĩ: Mọi thông tin, dữ liệu, bài báo cáo sức khỏe, hoặc lời khuyên từ Trợ lý AI trên ứng dụng chỉ mang tính chất tham khảo và hỗ trợ giáo dục. Chúng KHÔNG thay thế cho chẩn đoán, tư vấn, hoặc điều trị y tế chuyên nghiệp.\n\n• Luôn lắng nghe chuyên gia: Trong các trường hợp khẩn cấp, có dấu hiệu bất thường về sức khỏe thai nhi, hoặc phản ứng phụ với thuốc bổ sung, bạn cần liên hệ ngay với cơ sở y tế hoặc bác sĩ chuyên khoa đang điều trị trực tiếp.`,
    },
    {
      title: "3. Quyền riêng tư và Dữ liệu cá nhân",
      content: `Bảo vệ dữ liệu cá nhân của bạn là ưu tiên hàng đầu của chúng tôi.\n\n• HerDays thu thập dữ liệu (như chu kỳ, nhiệt độ cơ thể, triệu chứng, lịch sử IVF...) để cung cấp các phân tích (Health Insights) chính xác nhất cho riêng bạn.\n\n• Chúng tôi cam kết KHÔNG bán dữ liệu sức khỏe nhạy cảm của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo. Để hiểu rõ hơn về cách chúng tôi mã hóa và bảo vệ dữ liệu, bạn vui lòng đọc thêm tại trang [Chính sách bảo mật].`,
    },
    {
      title: "4. Đăng ký và Bảo mật tài khoản",
      content: `Để trải nghiệm đầy đủ tính năng, bạn cần tạo tài khoản với thông tin chính xác (Họ tên, Email, Giới tính...).\n\n• Bạn hoàn toàn chịu trách nhiệm bảo mật mật khẩu và mã OTP của mình. Nếu bạn nghi ngờ có ai đó đang sử dụng trái phép tài khoản của mình, hãy báo ngay cho HerDays thông qua mục "Liên hệ với chúng tôi".`,
    },
    {
      title: "5. Giao dịch Cửa hàng & Gói Premium",
      content: `• Sản phẩm & Subscription Box: Khi bạn đặt hàng các sản phẩm cá nhân hóa trên HerDays, thanh toán sẽ được xử lý qua mã QR hoặc cổng thanh toán tích hợp. Trạng thái "Chờ duyệt" sẽ chuyển sang "Thành công" sau khi hệ thống xác nhận thanh toán.\n\n• Gói Premium: Dịch vụ nâng cấp tài khoản sẽ tự động gia hạn theo chu kỳ bạn đã chọn (hàng tháng/hàng năm). Bạn có thể hủy gia hạn bất cứ lúc nào trong mục "Cài đặt tài khoản". Việc hủy gia hạn sẽ có hiệu lực vào cuối chu kỳ thanh toán hiện tại.`,
    },
    {
      title: "6. Quyền sở hữu trí tuệ",
      content: `Mọi thiết kế, logo "HerDays", đồ họa minh họa, giao diện người dùng, mã nguồn và nội dung bài viết Blog đều thuộc quyền sở hữu trí tuệ hợp pháp của dự án HerDays.\n\n• Chúng tôi cấp cho bạn quyền sử dụng ứng dụng hữu hạn, phi độc quyền cho mục đích cá nhân. Bạn không được phép sao chép, chỉnh sửa, hoặc mang tài sản trí tuệ của HerDays đi phân phối lại khi chưa có sự đồng ý bằng văn bản.`,
    },
    {
      title: "7. Giới hạn trách nhiệm",
      content: `HerDays sẽ nỗ lực hết sức để hệ thống hoạt động ổn định 24/7. Tuy nhiên, chúng tôi không chịu trách nhiệm pháp lý cho các gián đoạn dịch vụ do lỗi máy chủ, đường truyền mạng, bảo trì định kỳ hoặc các sự cố bất khả kháng nằm ngoài tầm kiểm soát.`,
    },
    {
      title: "8. Cập nhật và Thay đổi điều khoản",
      content: `Chúng tôi có quyền điều chỉnh, thay đổi hoặc cập nhật các điều khoản này bất cứ lúc nào để phù hợp với sự phát triển của ứng dụng và các quy định pháp luật. Khi có những thay đổi lớn, HerDays sẽ chủ động gửi Push Notification (Thông báo đẩy) để bạn nắm bắt kịp thời. Việc bạn tiếp tục sử dụng ứng dụng sau khi điều khoản mới có hiệu lực đồng nghĩa với việc bạn chấp nhận những thay đổi đó.`,
    },
    {
      title: "9. Kết nối với chúng tôi",
      content: `Nếu bạn có bất kỳ thắc mắc, băn khoăn hay góp ý nào về Điều khoản dịch vụ này, vui lòng liên hệ với chúng tôi qua:\n\n• Email hỗ trợ: support@herdays.vn\n• Fanpage: Herdays\n• Hoặc trực tiếp qua mục Liên hệ với chúng tôi ngay trên ứng dụng.`,
    },
  ];

  return (
    <div className="term-of-use">
      <div className="term-header">
        <h1 className="term-title">Điều khoản dịch vụ HerDays</h1>
        <p className="term-subtitle">
          Dưới đây là các điều khoản dịch vụ của chúng tôi khi sử dụng HerDays
        </p>
      </div>

      <div className="term-card">
        <div className="term-content">
          {terms.map((term, index) => (
            <div key={index} className="term-section">
              <div className="section-heading">
                <h2 className="section-title">{term.title}</h2>
              </div>
              <p className="section-content">{term.content}</p>
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
