import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';

import env from '../config/environment.js';
import BlogPost from '../models/blogPostModel.js';
import Box from '../models/boxModel.js';
import ChatConversation from '../models/chatConversationModel.js';
import ChatMessage from '../models/chatMessageModel.js';
import { requestChatResponse } from '../providers/aiServiceProvider.js';
import {
  buildUpdatedChatMemory,
  deleteChatMemory,
  getChatMemory,
  saveChatMemory
} from './chatMemoryService.js';
import { getLatestChatQuizContext } from './quizService.js';

const GUEST_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const MEMBER_HISTORY_LIMIT = 50;
const BLOG_CITATION_LIMIT = 3;
const BLOG_SEARCH_LIMIT = 80;
const SHOP_BOX_CANDIDATE_LIMIT = 20;
const BLOG_STOP_WORDS = new Set([
  'ban',
  'bai',
  'biet',
  'cho',
  'co',
  'cua',
  'duoc',
  'gi',
  'giup',
  'hoi',
  'khong',
  'la',
  'mot',
  'nay',
  'nhu',
  'toi',
  'trong',
  'va',
  've'
]);

const buildError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildGuestExpiresAt = () => new Date(Date.now() + GUEST_SESSION_TTL_MS);

const createSessionId = () => crypto.randomUUID();

const normalizeText = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'd')
  .toLowerCase();

const tokenize = (value = '') => normalizeText(value)
  .split(/[^a-z0-9]+/)
  .filter((word) => word.length > 2 && !BLOG_STOP_WORDS.has(word));

const toPlainText = (value = '') => sanitizeHtml(value, {
  allowedTags: [],
  allowedAttributes: {}
}).replace(/\s+/g, ' ').trim();

const buildBlogPostUrl = (post) => {
  const frontendUrl = env.frontendUrl.replace(/\/$/, '');
  const topicId = post.postTopicId?._id?.toString() || post.postTopicId?.toString();

  if (!topicId) return `${frontendUrl}/blog`;
  return `${frontendUrl}/blog/${topicId}/posts/${post._id.toString()}`;
};

const buildBoxDetailUrl = (boxId) => `/product-detail/box/${boxId}`;

const buildBoxCustomizeUrl = (boxId) => `/box-customize/${boxId}`;

const hasBlogCitation = (citations = []) => citations.some((citation) => citation?.sourceType === 'blog');

const getTokenHitCount = (queryTokens, text) => {
  const textTokens = new Set(tokenize(text));
  return queryTokens.reduce((total, token) => total + (textTokens.has(token) ? 1 : 0), 0);
};

const hasShopIntent = (value = '') => {
  const normalized = normalizeText(value);
  return [
    'box',
    'san pham',
    'mua do',
    'mua hang',
    'muon mua',
    'mua qua',
    'dat box',
    'xem shop',
    'vao shop',
    'shop',
    'goi y',
    'nen mua',
    'caremode',
    'care mode'
  ].some((pattern) => normalized.includes(pattern));
};

const uniqueNonEmpty = (items = []) => [
  ...new Set(items
    .map((item) => (item || '').toString().trim())
    .filter(Boolean))
];

const mapBoxToProductCandidate = (box) => {
  const boxId = box._id.toString();
  const products = box.products || [];
  const productNames = products.map((item) => item.productId?.productName);
  const productCategories = [
    ...(box.productCategories || []),
    ...products.map((item) => item.productId?.category)
  ];

  const targetStatuses = uniqueNonEmpty([
    box.category,
    ...productCategories
  ]).slice(0, 12);

  const recommendationTags = uniqueNonEmpty([
    box.boxName,
    box.category,
    box.description,
    ...productCategories,
    ...productNames
  ]).slice(0, 30);

  const benefits = uniqueNonEmpty([
    box.description,
    ...productCategories.map((category) => `Category: ${category}`),
    ...productNames.map((name) => `Includes: ${name}`)
  ]).slice(0, 12);

  return {
    productId: boxId,
    name: box.boxName,
    targetStatuses,
    recommendationTags,
    benefits,
    price: box.price,
    currency: 'VND',
    isActive: true,
    isCustomizable: true,
    inStock: box.quantity > 0,
    customizeUrl: buildBoxCustomizeUrl(boxId),
    thumbnail: box.thumbnail,
    detailUrl: buildBoxDetailUrl(boxId)
  };
};

const getAvailableBoxCandidates = async () => {
  const boxes = await Box.find({ quantity: { $gt: 0 } })
    .sort({ createdAt: -1 })
    .limit(SHOP_BOX_CANDIDATE_LIMIT)
    .populate('products.productId', 'productName category')
    .lean();

  return boxes.map(mapBoxToProductCandidate);
};

const buildFallbackBlogCitations = async (userMessage, citations = []) => {
  if (hasBlogCitation(citations)) return citations;

  const queryTokens = tokenize(userMessage);
  if (queryTokens.length === 0) return citations;

  const posts = await BlogPost.find({ status: 'Published' })
    .select('title content postTopicId createdAt')
    .populate('postTopicId', 'name slug')
    .sort({ createdAt: -1 })
    .limit(BLOG_SEARCH_LIMIT)
    .lean();

  const fallbackCitations = posts
    .map((post) => {
      const topicName = post.postTopicId?.name || '';
      const topicSlug = post.postTopicId?.slug || '';
      const plainContent = toPlainText(post.content);
      const titleScore = getTokenHitCount(queryTokens, post.title) * 3;
      const topicScore = getTokenHitCount(queryTokens, `${topicName} ${topicSlug}`) * 2;
      const contentScore = getTokenHitCount(queryTokens, plainContent);
      const score = titleScore + topicScore + contentScore;

      return {
        sourceId: `blog:${post._id.toString()}`,
        sourceType: 'blog',
        title: post.title,
        url: buildBlogPostUrl(post),
        excerpt: plainContent.slice(0, 180),
        score
      };
    })
    .filter((citation) => citation.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, BLOG_CITATION_LIMIT);

  return [...citations, ...fallbackCitations];
};

const hydrateMessagesWithFallbackBlogCitations = async (messages) => {
  let previousUserMessage = '';

  for (const message of messages) {
    if (message.role === 'user') {
      previousUserMessage = message.content;
      continue;
    }

    if (
      message.role !== 'assistant'
      || !previousUserMessage
      || hasBlogCitation(message.citations)
      || (message.recommendedProducts || []).length > 0
      || hasShopIntent(previousUserMessage)
    ) {
      continue;
    }

    const citations = await buildFallbackBlogCitations(previousUserMessage, message.citations || []);
    if (citations.length === (message.citations || []).length) continue;

    message.citations = citations;
    await message.save();
  }

  return messages;
};

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

const buildAiPayload = ({ conversation, userMessage, history, memory, productCandidates }) => ({
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
  productCandidates
});

const buildConversationContext = async ({ userId, payload }) => {
  const context = { ...payload.context };

  if (userId && (!context.quizSummary || !context.targetStatus)) {
    const latestQuizContext = await getLatestChatQuizContext(userId);

    if (!context.quizSummary) {
      context.quizSummary = latestQuizContext?.quizSummary || null;
    }

    if (!context.targetStatus) {
      context.targetStatus = latestQuizContext?.targetStatus || null;
    }
  }

  return context;
};

export const createConversation = async ({ userId, sessionId, payload }) => {
  const isMember = Boolean(userId);
  const context = await buildConversationContext({ userId, payload });
  const conversation = await ChatConversation.create({
    user: userId || null,
    sessionId: isMember ? null : sessionId || createSessionId(),
    sessionType: isMember ? 'member' : 'guest',
    title: payload.title || 'Cuộc trò chuyện mới',
    context,
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
  await hydrateMessagesWithFallbackBlogCitations(messages);

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
  const productCandidates = await getAvailableBoxCandidates();

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
      memory,
      productCandidates
    })
  );
  if ((aiResponse.recommendedProducts || []).length > 0 || hasShopIntent(payload.userMessage)) {
    aiResponse.citations = [];
  } else {
    aiResponse.citations = await buildFallbackBlogCitations(payload.userMessage, aiResponse.citations || []);
  }

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
