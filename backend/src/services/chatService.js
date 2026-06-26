import crypto from 'crypto';

import ChatConversation from '../models/chatConversationModel.js';
import ChatMessage from '../models/chatMessageModel.js';
import { requestChatResponse } from '../providers/aiServiceProvider.js';
import {
  buildUpdatedChatMemory,
  deleteChatMemory,
  getChatMemory,
  saveChatMemory
} from './chatMemoryService.js';

const GUEST_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const MEMBER_HISTORY_LIMIT = 50;

const buildError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildGuestExpiresAt = () => new Date(Date.now() + GUEST_SESSION_TTL_MS);

const createSessionId = () => crypto.randomUUID();

const serializeConversation = (conversation) => ({
  id: conversation._id.toString(),
  title: conversation.title,
  sessionType: conversation.sessionType,
  sessionId: conversation.sessionId,
  context: conversation.context,
  summary: conversation.summary,
  lastMessageAt: conversation.lastMessageAt,
  expiresAt: conversation.expiresAt,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt
});

const serializeMessage = (message) => ({
  id: message._id.toString(),
  conversationId: message.conversation.toString(),
  role: message.role,
  content: message.content,
  safety: message.safety,
  citations: message.citations,
  recommendedProducts: message.recommendedProducts,
  ctas: message.ctas,
  usage: message.usage,
  model: message.model,
  needsHumanSupport: message.needsHumanSupport,
  createdAt: message.createdAt
});

const getConversationTitle = (message) => {
  const title = message.replace(/\s+/g, ' ').trim();
  if (title.length <= 80) return title || 'Cuộc trò chuyện mới';

  return `${title.slice(0, 77).trim()}...`;
};

const buildOwnershipQuery = ({ conversationId, userId, sessionId }) => {
  const query = {
    _id: conversationId,
    deletedAt: null
  };

  if (userId) {
    query.user = userId;
    return query;
  }

  if (!sessionId) {
    throw buildError(401, 'Thiếu X-Chat-Session');
  }

  query.sessionType = 'guest';
  query.sessionId = sessionId;
  query.$or = [
    { expiresAt: null },
    { expiresAt: { $gt: new Date() } }
  ];

  return query;
};

const findOwnedConversation = async ({ conversationId, userId, sessionId }) => {
  const conversation = await ChatConversation.findOne(
    buildOwnershipQuery({ conversationId, userId, sessionId })
  );

  if (!conversation) {
    throw buildError(404, 'Không tìm thấy hội thoại');
  }

  return conversation;
};

const buildAiPayload = ({ conversation, userMessage, history, memory }) => ({
  conversationId: conversation._id.toString(),
  userMessage,
  language: 'vi',
  userContext: {
    sessionType: conversation.sessionType,
    targetStatus: conversation.context?.targetStatus || null,
    ageGroup: conversation.context?.ageGroup || null,
    personalizationConsent: Boolean(conversation.context?.personalizationConsent),
    quizSummary: conversation.context?.quizSummary || null
  },
  history: history.map((message) => ({
    role: message.role,
    content: message.content
  })),
  memorySummary: memory?.summary || null,
  knowledgeFilters: {
    targetStatuses: conversation.context?.targetStatus ? [conversation.context.targetStatus] : [],
    tags: [],
    limit: 5
  },
  productCandidates: []
});

export const createConversation = async ({ userId, sessionId, payload }) => {
  const isMember = Boolean(userId);
  const conversation = await ChatConversation.create({
    user: userId || null,
    sessionId: isMember ? null : sessionId || createSessionId(),
    sessionType: isMember ? 'member' : 'guest',
    title: payload.title || 'Cuộc trò chuyện mới',
    context: payload.context,
    expiresAt: isMember ? null : buildGuestExpiresAt()
  });

  return {
    conversation: serializeConversation(conversation),
    sessionId: conversation.sessionId
  };
};

export const getMemberConversations = async ({ userId }) => {
  if (!userId) {
    throw buildError(401, 'Bạn cần đăng nhập để xem lịch sử hội thoại');
  }

  const conversations = await ChatConversation.find({
    user: userId,
    deletedAt: null
  })
    .sort({ lastMessageAt: -1, createdAt: -1 })
    .limit(MEMBER_HISTORY_LIMIT);

  return {
    conversations: conversations.map(serializeConversation)
  };
};

export const getConversationMessages = async ({ conversationId, userId, sessionId }) => {
  const conversation = await findOwnedConversation({ conversationId, userId, sessionId });
  const messages = await ChatMessage.find({ conversation: conversation._id }).sort({ createdAt: 1 });

  return {
    conversation: serializeConversation(conversation),
    messages: messages.map(serializeMessage)
  };
};

export const deleteConversation = async ({ conversationId, userId, sessionId }) => {
  const conversation = await findOwnedConversation({ conversationId, userId, sessionId });

  conversation.deletedAt = new Date();
  await conversation.save();
  await deleteChatMemory(conversation._id.toString());

  return {
    conversationId: conversation._id.toString()
  };
};

export const sendMessage = async ({ conversationId, userId, sessionId, payload }) => {
  const conversation = await findOwnedConversation({ conversationId, userId, sessionId });

  const history = await ChatMessage.find({ conversation: conversation._id })
    .sort({ createdAt: -1 })
    .limit(12);
  const orderedHistory = history.reverse();
  const memory = await getChatMemory(conversation._id.toString());

  const userMessage = await ChatMessage.create({
    conversation: conversation._id,
    user: userId || null,
    role: 'user',
    content: payload.userMessage
  });

  conversation.lastMessageAt = userMessage.createdAt;
  conversation.expiresAt = conversation.sessionType === 'guest' ? buildGuestExpiresAt() : null;
  if (conversation.title === 'Cuộc trò chuyện mới') {
    conversation.title = getConversationTitle(payload.userMessage);
  }
  await conversation.save();

  const aiResponse = await requestChatResponse(
    buildAiPayload({
      conversation,
      userMessage: payload.userMessage,
      history: orderedHistory,
      memory
    })
  );

  const assistantMessage = await ChatMessage.create({
    conversation: conversation._id,
    user: userId || null,
    role: 'assistant',
    content: aiResponse.answer,
    safety: aiResponse.safety,
    citations: aiResponse.citations,
    recommendedProducts: aiResponse.recommendedProducts,
    ctas: aiResponse.ctas,
    usage: aiResponse.usage,
    model: aiResponse.model,
    needsHumanSupport: aiResponse.needsHumanSupport
  });

  conversation.lastMessageAt = assistantMessage.createdAt;
  conversation.expiresAt = conversation.sessionType === 'guest' ? buildGuestExpiresAt() : null;
  await conversation.save();

  await saveChatMemory(
    conversation._id.toString(),
    buildUpdatedChatMemory({
      previousMemory: memory,
      userMessage: payload.userMessage,
      aiResponse
    })
  );

  return {
    conversation: serializeConversation(conversation),
    userMessage: serializeMessage(userMessage),
    assistantMessage: serializeMessage(assistantMessage),
    ai: aiResponse
  };
};
