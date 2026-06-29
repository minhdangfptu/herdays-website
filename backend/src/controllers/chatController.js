import * as chatService from '../services/chatService.js';
import { sendSuccess } from '../utils/response.js';
import {
  validateChatSession,
  validateConversationId,
  validateCreateConversation,
  validateSendMessage
} from '../validations/chatValidation.js';

const getRequestContext = (req) => ({
  userId: req.user?.id || null,
  sessionId: validateChatSession(req.headers['x-chat-session'])
});

export const createConversation = async (req, res, next) => {
  try {
    const result = await chatService.createConversation({
      ...getRequestContext(req),
      payload: validateCreateConversation(req.body)
    });

    if (result.sessionId) {
      res.set('X-Chat-Session', result.sessionId);
    }

    sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo hội thoại chatbot thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const result = await chatService.getMemberConversations(getRequestContext(req));

    sendSuccess(res, {
      message: 'Lấy danh sách hội thoại thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const result = await chatService.getConversationMessages({
      ...getRequestContext(req),
      conversationId: validateConversationId(req.params.id)
    });

    sendSuccess(res, {
      message: 'Lấy tin nhắn hội thoại thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const result = await chatService.deleteConversation({
      ...getRequestContext(req),
      conversationId: validateConversationId(req.params.id)
    });

    sendSuccess(res, {
      message: 'Xóa hội thoại thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const result = await chatService.sendMessage({
      ...getRequestContext(req),
      conversationId: validateConversationId(req.params.id),
      payload: validateSendMessage(req.body)
    });

    sendSuccess(res, {
      statusCode: 201,
      message: 'Gửi tin nhắn chatbot thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

