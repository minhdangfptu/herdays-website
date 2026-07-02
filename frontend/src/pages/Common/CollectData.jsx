import React from "react";
import "./CollectData.scss";

export default function CollectData() {
  const sections = [
    {
      title: "1. Dữ liệu chúng tôi thu thập",
      content: `HerDays cam kết minh bạch trong việc thu thập dữ liệu. Dưới đây là các loại dữ liệu mà ứng dụng có thể thu thập khi bạn sử dụng HerDays:

• Dữ liệu cá nhân cơ bản: Họ tên, địa chỉ email, ngày sinh, giới tính sinh học, ảnh đại diện (nếu bạn chọn tải lên).

• Dữ liệu sức khỏe: Chu kỳ kinh nguyệt, ngày rụng trứng, triệu chứng hàng ngày, nhiệt độ cơ thể, cân nặng, chiều cao, lịch sử thai kỳ, thông tin IVF, nhật ký mang thai.

• Dữ liệu thiết bị: Loại thiết bị, hệ điều hành, phiên bản ứng dụng, định danh thiết bị duy nhất (UUID).

• Dữ liệu sử dụng: Tính năng được truy cập, thời lượng sử dụng, tần suất mở ứng dụng, các tương tác trong ứng dụng.`,
    },
    {
      title: "2. Cách chúng tôi thu thập dữ liệu",
      content: `Chúng tôi thu thập dữ liệu của bạn qua nhiều phương thức:

• Nhập liệu trực tiếp: Bạn chủ động nhập thông tin sức khỏe, đặt lịch hẹn, hoặc gửi tin nhắn qua ứng dụng.

• Thiết bị thông minh: Nếu bạn đồng bộ với thiết bị đeo tay hoặc cân thông minh, dữ liệu nhịp tim, giấc ngủ, bước chân sẽ được truyền qua API tích hợp.

• Cookies & Công nghệ tương tự: Chúng tôi sử dụng cookies phiên và cookies vĩnh viễn để ghi nhớ sở thích, duy trì trạng thái đăng nhập và phân tích lưu lượng truy cập ẩn danh.

• Nhật ký máy chủ (Server Logs): Mỗi khi bạn truy cập, máy chủ HerDays ghi lại địa chỉ IP, thời gian truy cập và yêu cầu HTTP để phục vụ mục đích bảo mật và khắc phục sự cố.`,
    },
    {
      title: "3. Mục đích sử dụng dữ liệu",
      content: `Dữ liệu của bạn được sử dụng với các mục đích sau:

• Cung cấp phân tích sức khỏe cá nhân hóa (Health Insights): Dựa trên chu kỳ và triệu chứng, HerDays đưa ra dự đoán ngày rụng trứng, ngày có khả năng thụ thai cao, và cảnh báo thai kỳ sớm.

• Đồng bộ thiết bị: Hiển thị dữ liệu từ thiết bị đeo tay (nhịp tim, giấc ngủ, bước chân) trong ứng dụng.

• Tối ưu trải nghiệm người dùng: Ghi nhớ sở thích, cá nhân hóa giao diện và nội dung được hiển thị.

• Hỗ trợ khách hàng: Đội ngũ chăm sóc khách hàng có thể truy cập dữ liệu tài khoản để giải quyết khiếu nại hoặc hỗ trợ kỹ thuật.

• Phát triển sản phẩm: Phân tích dữ liệu ẩn danh tổng hợp để cải thiện tính năng hiện tại và phát triển tính năng mới.`,
    },
    {
      title: "4. Lưu trữ và Bảo mật dữ liệu",
      content: `Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt để bảo vệ dữ liệu của bạn:

• Mã hóa: Toàn bộ dữ liệu nhạy cảm (chu kỳ, triệu chứng, thai kỳ) được mã hóa AES-256 khi truyền qua mạng (TLS 1.3) và khi lưu trữ tại máy chủ.

• Lưu trữ: Dữ liệu được lưu trữ trên máy chủ có trung tâm dữ liệu đặt tại Việt Nam, tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.

• Thời gian lưu trữ: Chúng tôi lưu trữ dữ liệu tài khoản trong suốt thời gian bạn sử dụng ứng dụng. Khi bạn yêu cầu xóa tài khoản, toàn bộ dữ liệu cá nhân sẽ bị xóa trong vòng 30 ngày theo quy định.

• Quyền truy cập: Chỉ nhân viên được ủy quyền mới có quyền truy cập cơ sở dữ liệu người dùng, và mọi truy cập đều được ghi nhật ký (audit log).`,
    },
    {
      title: "5. Chia sẻ dữ liệu với bên thứ ba",
      content: `HerDays cam kết không bán dữ liệu sức khỏe nhạy cảm của bạn. Chúng tôi chỉ chia sẻ dữ liệu trong các trường hợp sau:

• Nhà cung cấp dịch vụ: Dữ liệu có thể được chia sẻ với các đối tác cung cấp dịch vụ đám mây (AWS/Vercel), xử lý thanh toán (VNPay, ZaloPay), và gửi thông báo đẩy (Firebase Cloud Messaging). Các đối tác này chỉ xử lý dữ liệu theo hướng dẫn của HerDays và bị ràng buộc bởi thỏa thuận bảo mật.

• Yêu cầu pháp lý: Chúng tôi có thể tiết lộ dữ liệu khi được yêu cầu bởi cơ quan có thẩm quyền theo quy định của pháp luật Việt Nam.

• Chuyển nhượng doanh nghiệp: Trong trường hợp sáp nhập, mua lại hoặc tái cơ cấu công ty, dữ liệu có thể được chuyển giao theo thỏa thuận bảo mật tương đương.`,
    },
    {
      title: "6. Quyền của bạn với dữ liệu cá nhân",
      content: `Bạn có toàn quyền kiểm soát dữ liệu của mình:

• Truy cập: Xem toàn bộ dữ liệu cá nhân và sức khỏe đã lưu trong tài khoản tại mục "Hồ sơ & Dữ liệu".

• Chỉnh sửa: Cập nhật thông tin cá nhân hoặc dữ liệu sức khỏe bất cứ lúc nào trong ứng dụng.

• Xóa: Yêu cầu xóa toàn bộ dữ liệu cá nhân bằng cách gửi yêu cầu qua mục "Liên hệ với chúng tôi" hoặc xóa trực tiếp từng mục dữ liệu trong ứng dụng.

• Phản đối xử lý: Từ chối việc sử dụng dữ liệu cho mục đích phân tích ẩn danh tổng hợp.

• Xuất dữ liệu: Tải xuống toàn bộ dữ liệu của bạn dưới định dạng JSON tại mục "Hồ sơ & Dữ liệu" > "Xuất dữ liệu".`,
    },
    {
      title: "7. Trẻ em và Thanh thiếu niên",
      content: `HerDays không dành cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập dữ liệu cá nhân của trẻ em dưới 13 tuổi mà không có sự đồng ý của cha mẹ hoặc người giám hộ hợp pháp.

Nếu chúng tôi phát hiện dữ liệu của trẻ dưới 13 tuổi đã được thu thập mà không có sự đồng ý, chúng tôi sẽ nỗ lực xóa dữ liệu đó trong thời gian sớm nhất có thể. Phụ huynh hoặc người giám hộ muốn yêu cầu xóa dữ liệu của trẻ vị thành niên có thể liên hệ qua email: support@herdays.vn.`,
    },
    {
      title: "8. Liên hệ với chúng tôi",
      content: `Nếu bạn có bất kỳ câu hỏi, yêu cầu hoặc khiếu nại nào liên quan đến Chính sách Thu thập & Sử dụng Dữ liệu, vui lòng liên hệ:

• Email hỗ trợ: support@herdays.vn
• Fanpage: Herdays
• Hoặc trực tiếp qua mục "Liên hệ với chúng tôi" trên ứng dụng.

Chúng tôi cam kết phản hồi mọi yêu cầu trong vòng 7 ngày làm việc.`,
    },
  ];

  return (
    <div className="collect-data">
      <div style={{marginTop: "60px"}}  className="term-header">
        <h1 className="term-title">Chính sách Thu thập & Sử dụng Dữ liệu</h1>
        <p className="term-subtitle">
          Dưới đây là chính sách thu thập và sử dụng dữ liệu của HerDays để bảo vệ quyền lợi của bạn
        </p>
      </div>

      <div className="term-card">
        <div className="term-content">
          {sections.map((section, index) => (
            <div key={index} className="term-section">
              <div className="section-heading">
                <h2 className="section-title">{section.title}</h2>
              </div>
              <p className="section-content">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="term-footer">
          <p>Cập nhật lần cuối: 01 tháng 07, 2026</p>
        </div>
      </div>
    </div>
  );
}
