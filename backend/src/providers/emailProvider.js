import { Resend } from 'resend';
import env from '../config/environment.js';

// Khởi tạo Resend bằng API Key của bồ
// ⚠️ Lưu ý nhỏ: Tạm thời mình hardcode key ở đây để bồ test chạy ngay.
// Sau khi test thành công, bồ nhớ đưa key này vào file .env (VD: process.env.RESEND_API_KEY) để bảo mật nha!
const resend = new Resend('re_idsQiwKw_5pgzBy9iKpWaLSautZjVnUek');

const getEmailTitle = (purpose) => (
  purpose === 'register'
    ? 'Xác minh tài khoản của bạn'
    : 'Đặt lại mật khẩu của bạn'
);

const getEmailDescription = (purpose) => (
  purpose === 'register'
    ? 'Sử dụng mã này để xác minh tài khoản và hoàn thành việc tham gia HerDays.'
    : 'Sử dụng mã này để đặt lại mật khẩu của bạn.'
);

const buildOtpEmailHtml = (otp, purpose) => {
  const title = getEmailTitle(purpose);
  const description = getEmailDescription(purpose);
  const logoHtml = env.smtp?.logoUrl
    ? `<img src="${env.smtp.logoUrl}" alt="HerDays" width="92" style="display:block;margin:0 auto 16px;border:0;outline:none;text-decoration:none;">`
    : '<div style="font-size:28px;line-height:34px;font-weight:700;letter-spacing:2px;color:#ffffff;margin-bottom:16px;">HERDAYS</div>';

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FFE8F3;font-family:Arial,Helvetica,sans-serif;color:#1A1A1A;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFE8F3;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #F176A9;">
            <tr>
              <td style="background:#F176A9;padding:34px 28px;text-align:center;">
                ${logoHtml}
                <div style="font-size:22px;line-height:30px;font-weight:700;color:#ffffff;">${title}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;text-align:center;">
                <p style="margin:0 0 22px;font-size:15px;line-height:24px;color:#1A1A1A;">${description}</p>
                <div style="display:inline-block;background:#FFE8F3;border:1px solid #F176A9;border-radius:14px;padding:16px 26px;font-size:34px;line-height:40px;font-weight:700;letter-spacing:8px;color:#F176A9;">
                  ${otp}
                </div>
                <p style="margin:22px 0 0;font-size:13px;line-height:20px;color:#1A1A1A;">Mã này sẽ hết hạn trong ${env.otpExpiresInMinutes} phút. Nếu bạn không yêu cầu, bạn có thể bỏ qua email này.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;text-align:center;background:#FFE8F3;color:#1A1A1A;font-size:12px;line-height:18px;">
                HerDays - Đồng Hành Cùng Sức Khỏe Phụ Nữ Bằng Công Nghệ AI
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
</body>
</html>`;
};

export const sendOtpEmail = async (email, otp, purpose) => {
  const subject = getEmailTitle(purpose);
  const htmlContent = buildOtpEmailHtml(otp, purpose);

  try {
    const data = await resend.emails.send({
      from: 'HerDays <noreply@herdays.io.vn>',
      to: email,
      subject: subject,
      html: htmlContent
    });
    console.log('Gửi email OTP xịn xò thành công:', data);
    return data;
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw error;
  }
};