import mongoose from 'mongoose';

const SENSITIVE_KEY_PARTS = [
  'email',
  'phone',
  'address',
  'token',
  'password',
  'fullname',
  'firstname',
  'lastname',
  'birthdate',
  'dateofbirth',
  'userid',
  'memberid',
  'customerid',
  'identity'
];

const buildError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const cleanString = (value, maxLength) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw buildError(400, 'Dữ liệu không hợp lệ');

  const cleaned = value.trim();
  if (!cleaned) return null;
  if (cleaned.length > maxLength) throw buildError(400, 'Dữ liệu vượt quá độ dài cho phép');

  return cleaned;
};

const findSensitiveKey = (value) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findSensitiveKey(item);
      if (match) return match;
    }

    return null;
  }

  if (!value || typeof value !== 'object') return null;

  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[_-]/g, '');
    if (SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part))) {
      return key;
    }

    const match = findSensitiveKey(child);
    if (match) return match;
  }

  return null;
};

export const validateConversationId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw buildError(400, 'ID hội thoại không hợp lệ');
  }

  return value;
};

export const validateChatSession = (value) => {
  const cleaned = cleanString(value, 120);
  if (!cleaned) return null;

  if (!/^[A-Za-z0-9._:-]+$/.test(cleaned)) {
    throw buildError(400, 'Chat session không hợp lệ');
  }

  return cleaned;
};

export const validateCreateConversation = (body = {}) => {
  const quizSummary = body.quizSummary ?? body.context?.quizSummary ?? null;
  const sensitiveKey = findSensitiveKey(quizSummary);
  if (sensitiveKey) {
    throw buildError(400, `quizSummary chứa dữ liệu nhạy cảm: ${sensitiveKey}`);
  }

  return {
    title: cleanString(body.title, 120),
    context: {
      targetStatus: cleanString(body.targetStatus ?? body.context?.targetStatus, 80),
      ageGroup: cleanString(body.ageGroup ?? body.context?.ageGroup, 40),
      personalizationConsent: Boolean(
        body.personalizationConsent ?? body.context?.personalizationConsent
      ),
      quizSummary
    }
  };
};

export const validateSendMessage = (body = {}) => {
  const userMessage = body.userMessage ?? body.message;
  if (typeof userMessage !== 'string') {
    throw buildError(400, 'Nội dung tin nhắn là bắt buộc');
  }

  const cleaned = userMessage.trim();
  if (!cleaned) {
    throw buildError(400, 'Nội dung tin nhắn là bắt buộc');
  }

  if (cleaned.length > 2000) {
    throw buildError(400, 'Nội dung tin nhắn vượt quá 2000 ký tự');
  }

  return {
    userMessage: cleaned
  };
};

