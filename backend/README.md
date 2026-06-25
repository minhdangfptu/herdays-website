# HerDays Backend

Backend Node.js/Express for HerDays, using MongoDB through Mongoose.

## Run Local

```bash
cd backend
npm install
npm run dev
```

Base URL:

```text
http://localhost:8080/herdays-api
```

Health check:

```http
GET /status
```

## Email OTP Config

To show HerDays as the sender display name and render the pink/white OTP template:

```env
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=HerDays
EMAIL_LOGO_URL=https://your-public-logo-url.png
```

When using Gmail SMTP, `EMAIL_FROM` still has to be the authenticated Gmail address or an allowed alias. `EMAIL_FROM_NAME` only changes the display name.

## Cloudinary Image Config

Create a Cloudinary account and add these values to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=herdays/blog
```

`CLOUDINARY_API_SECRET` must remain on the backend. Admin users request a short-lived signed upload payload from `POST /admin/uploads/signature`; the frontend then uploads the image directly to Cloudinary and stores the returned HTTPS URL in MongoDB.

## Auth API

All JSON requests need:

```http
Content-Type: application/json
```

### Register, OTP By Email

```http
POST /auth/register
```

```json
{
  "email": "test@example.com",
  "phone": "+84901234567",
  "otpChannel": "email",
  "password": "Password123",
  "fullName": "Test User",
  "role": "user_free"
}
```

### Register, OTP By Phone

```http
POST /auth/register
```

```json
{
  "email": "test@example.com",
  "phone": "+84901234567",
  "otpChannel": "phone",
  "password": "Password123",
  "fullName": "Test User",
  "role": "user_free"
}
```

Register response includes:

```json
{
  "message": "Register successfully. Please confirm OTP.",
  "otpChannel": "email",
  "otpIdentifier": "test@example.com",
  "user": {}
}
```

### Confirm Register OTP

```http
POST /auth/confirm-otp
```

Use the `otpIdentifier` returned by register.

```json
{
  "identifier": "test@example.com",
  "otp": "123456",
  "purpose": "register"
}
```

For phone OTP:

```json
{
  "identifier": "+84901234567",
  "otp": "123456",
  "purpose": "register"
}
```

### Login

```http
POST /auth/login
```

By email:

```json
{
  "identifier": "test@example.com",
  "password": "Password123"
}
```

By phone:

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

### Forgot Password

Auto-detect email or phone:

```http
POST /auth/forgot-password
```

```json
{
  "identifier": "test@example.com"
}
```

Email-specific:

```http
POST /auth/forgot-password/email
```

```json
{
  "email": "test@example.com"
}
```

Phone-specific:

```http
POST /auth/forgot-password/phone-number
```

```json
{
  "phone": "+84901234567"
}
```

### Confirm Reset Password OTP

```http
POST /auth/confirm-otp
```

```json
{
  "identifier": "test@example.com",
  "otp": "123456",
  "purpose": "reset-password"
}
```

Response:

```json
{
  "message": "OTP confirmed successfully",
  "resetToken": "..."
}
```

### Reset Password

```http
POST /auth/reset-password
```

```json
{
  "resetToken": "{{resetToken}}",
  "newPassword": "NewPassword123"
}
```

### Refresh Token

```http
POST /auth/refresh-token
```

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

### Logout

```http
POST /auth/logout
```

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

### Change Password

```http
PUT /auth/change-password
```

Headers:

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

### Google Social Login

Google social login only works for an existing verified user whose email already exists in `users`.

```http
POST /auth/social-login
```

```json
{
  "provider": "google",
  "idToken": "{{googleIdToken}}"
}
```

## Postman Notes

- Body must use `raw` and `JSON`.
- Password must be at least 8 characters.
- OTP is 6 digits.
- Phone should use E.164 format, for example `+84901234567`.
- OTP is sent by email/SMS and is not returned in the API response.
- `resetToken` is stored in server memory, so restarting backend invalidates existing reset tokens.

## Contact API

Users and guests can submit contact information. If an `Authorization` header is provided, it must contain a valid access token.

```http
POST /contacts
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

The `Authorization` header is optional. Authenticated submissions store the user ID; guest submissions store `userId` as `null`.

```json
{
  "senderName": "Nguyễn Văn A",
  "phone": "+84901234567",
  "email": "user@example.com",
  "address": "123 Nguyễn Trãi",
  "province": "Hồ Chí Minh",
  "topic": "general",
  "message": "Tôi cần được hỗ trợ..."
}
```

`address` is optional. Supported topics are `general`, `account`, `technical`, `partnership`, `feedback`, and `other`. The server generates `createdAt` and ignores client-provided `userId` and `createdAt` values.

### View Contact Submissions (Admin)

Only authenticated users with the `admin` role can view contact submissions. Results are ordered by newest first.

```http
GET /admin/contacts?page=1&limit=10
Authorization: Bearer {{adminAccessToken}}
```

`page` defaults to `1`. `limit` defaults to `10` and is capped at `50`.
