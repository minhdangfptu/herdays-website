/**
 * Maps backend English error messages to Vietnamese for display to users.
 * All translation happens client-side so the backend stays language-agnostic.
 */
const TRANSLATIONS = {
  // Auth — credentials
  'Invalid credentials':                           'Tài khoản hoặc mật khẩu không đúng',
  'User not found':                                'Không tìm thấy tài khoản',
  'Email or phone already exists':                 'Email hoặc số điện thoại đã được sử dụng',

  // Auth — OTP
  'Invalid or expired OTP':                        'OTP không hợp lệ hoặc đã hết hạn',
  'OTP attempt limit exceeded':                     'Bạn đã nhập sai OTP quá nhiều lần',

  // Auth — verification
  'Please confirm OTP before login':               'Vui lòng xác thực OTP trước khi đăng nhập',
  'Please register with email, phone and password before social login': 'Vui lòng đăng ký bằng email, số điện thoại và mật khẩu trước khi đăng nhập bằng mạng xã hội',

  // Auth — tokens
  'Invalid or expired refresh token':              'Token làm mới không hợp lệ hoặc đã hết hạn',

  // Auth — password
  'Current password is incorrect':                 'Mật khẩu hiện tại không đúng',
  'Invalid or expired reset token':               'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',

  // Auth — identifier
  'Invalid identifier':                            'Định danh không hợp lệ',

  // Auth — Google
  'Google account does not include an email':      'Tài khoản Google không có email',

  // Auth — generic
  'Unauthorized — no token provided':             'Vui lòng đăng nhập để tiếp tục.',
  'Unauthorized — token has expired':              'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'Forbidden — insufficient permissions':           'Bạn không có quyền thực hiện thao tác này.',

  // Validation — common
  'E12000': 'Email đã được sử dụng cho tài khoản khác.',
  'P12000': 'Số điện thoại đã được sử dụng cho tài khoản khác.',
}

/**
 * Translate a single backend error message to Vietnamese.
 * Falls back to the original message if no translation is found.
 * @param {string} message - Raw message from backend
 * @returns {string} Translated or original message
 */
export function translateError(message) {
  if (!message || typeof message !== 'string') return message
  return TRANSLATIONS[message] ?? message
}

/**
 * Translate a single field-level validation error message.
 * @param {string} field - Field name
 * @param {string} message - Raw validation error message
 * @returns {string} Translated or original message
 */
export function translateFieldError(field, message) {
  if (!message || typeof message !== 'string') return message
  return TRANSLATIONS[message] ?? message
}
