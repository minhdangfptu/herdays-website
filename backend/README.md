# HerDays Backend

Backend Node.js/Express cho HerDays, dùng MongoDB qua Mongoose.

## Chạy local

```bash
cd backend
npm install
npm run dev
```

Base URL local:

```text
http://localhost:8080/herdays-api
```

Health check:

```http
GET /status
```

## Auth API

Tat ca request JSON can header:

```http
Content-Type: application/json
```

### 1. Đăng ký bằng email

```http
POST /auth/register
```

```json
{
  "email": "test@example.com", # Mail thật nha mấy con vk 
  "otpChannel": "email",
  "password": "Password123",
  "fullName": "Test User"
}
```

Response:

```json
{
  "message": "Register successfully. Please confirm OTP.",
  "otpChannel": "email",
  "otpIdentifier": "test@example.com",
  "user": { #thông tin user }
}
```

### 2. Đăng ký bằng sđt (chưa có ssdt twilio)

```http
POST /auth/register
```

```json
{
  "phoneNumber": "+84901234567",
  "otpChannel": "phone",
  "password": "Password123",
  "fullName": "Test User"
}
```

FE Cho người dùng chọn nhập `gmail` hoặc `sđt` và gọi đến các api đăng ký tương ứng.

### 3. Xác thực OTP đăng ký

```http
POST /auth/confirm-otp
```

Dùng `otpIdentifier` nhận được từ response register.

```json
{
  "identifier": "test@example.com",
  "otp": "123456",
  "purpose": "register"
}
```

Với sđt:

```json
{
  "identifier": "+84901234567",
  "otp": "123456",
  "purpose": "register"
}
```

### 5. Đăng nhập

```http
POST /auth/login
```

```json
{
  "identifier": "test@example.com",
  "password": "Password123"
}
```

Hoặc đăng nhập bằng sđt:

```json
{
  "identifier": "+84901234567",
  "password": "Password123"
}
```

Response:

```json
{
  "user": {},
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Forgot password / Reset password

### 1. Gửi OTP quên password

Tự điền email hoặc sđt:

```http
POST /auth/forgot-password
```

```json
{
  "identifier": "test@example.com"
}
```

Endpoint rieng cho email:

```http
POST /auth/forgot-password/email
```

```json
{
  "email": "test@example.com"
}
```

Endpoint rieng cho sđt:

```http
POST /auth/forgot-password/phone-number
```

```json
{
  "phoneNumber": "+84901234567"
}
```

### 2. Xác thực OTP quên mật khẩu

```http
POST /auth/confirm-otp
```

```json
{
  "identifier": "test@example.com",
  "otp": "123456",
  "purpose": "reset-password" #Thay đổi purpose so với xác nhận email lúc đăng ký
}
```

Response:

```json
{
  "message": "OTP confirmed successfully",
  "resetToken": "..."
}
```

### 3. Đặt lại mật khẩu

```http
POST /auth/reset-password
```

```json
{
  "resetToken": "{{resetToken}}",
  "newPassword": "NewPassword123"
}
```

Sau khi reset thành công đăng nhập lại bằng mật khẩu mới

## Token API

### Refresh token

```http
POST /auth/refresh-token
```

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

Refresh token cũ sẽ bị revoke sau khi rotate thành công.

### Logout

```http
POST /auth/logout
```

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

Sau logout, refresh token trên sẽ không dùng được nữa.

## Change password

```http
PUT /auth/change-password
```

Header:

```http
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

Body:

```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123"
}
```

Sau khi đổi mật khẩu thành công, các refresh của user sẽ bị revoke.

## Google social login

```http
POST /auth/social-login
```

```json
{
  "provider": "google",
  "idToken": "{{googleIdToken}}"
}
```

Cần cấu hình `GOOGLE_CLIENT_ID` dùng trong `.env`.

## Ghi chu test Postman

- Password tối thiểu 8 ký tự.
- OTP gồm 6 số.
- OTP không trả trực tiếp trong API response; hãy kiểm tra email/SMS.
- `resetToken` đang lưu trong memory server, nên restart backend sẽ làm token reset hiện tại mất hiệu lực.
