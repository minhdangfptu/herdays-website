import env from '../config/environment.js';
import { getRedisClient } from '../providers/redisProvider.js';

const MAX_SUMMARY_CHARS = 1200;
const MAX_TEXT_CHARS = 600;

const buildKey = (conversationId) => `chat:memory:${conversationId}`;

const compactText = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const redactSensitiveText = (value = '') => compactText(value)
  .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]')
  .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]')
  .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [token]')
  .replace(/refreshToken["':\s]+[A-Za-z0-9._-]+/gi, 'refreshToken [token]')
  .replace(/accessToken["':\s]+[A-Za-z0-9._-]+/gi, 'accessToken [token]');

const truncate = (value, limit) => {
  const text = compactText(value);
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 3).trim()}...`;
};

export const getChatMemory = async (conversationId) => {
  const redis = await getRedisClient();
  if (!redis || !conversationId) return null;

  try {
    const value = await redis.get(buildKey(conversationId));
    return value ? JSON.parse(value) : null;
  } catch (error) {
    process.stderr.write(`Unable to read chat memory: ${error.message}\n`);
    return null;
  }
};

export const saveChatMemory = async (conversationId, memory) => {
  const redis = await getRedisClient();
  if (!redis || !conversationId || !memory) return;

  try {
    await redis.set(
      buildKey(conversationId),
      JSON.stringify(memory),
      'EX',
      env.redis.chatMemoryTtlSeconds
    );
  } catch (error) {
    process.stderr.write(`Unable to save chat memory: ${error.message}\n`);
  }
};

export const deleteChatMemory = async (conversationId) => {
  const redis = await getRedisClient();
  if (!redis || !conversationId) return;

  try {
    await redis.del(buildKey(conversationId));
  } catch (error) {
    process.stderr.write(`Unable to delete chat memory: ${error.message}\n`);
  }
};

export const buildUpdatedChatMemory = ({ previousMemory, userMessage, aiResponse }) => {
  const previousSummary = redactSensitiveText(previousMemory?.summary || '');
  const latestUserMessage = truncate(redactSensitiveText(userMessage), MAX_TEXT_CHARS);
  const latestAssistantAnswer = truncate(redactSensitiveText(aiResponse.answer), MAX_TEXT_CHARS);
  const latestExchange = `User: ${latestUserMessage} Assistant: ${latestAssistantAnswer}`;
  const summary = truncate(
    [previousSummary, latestExchange].filter(Boolean).join(' '),
    MAX_SUMMARY_CHARS
  );

  return {
    summary,
    lastSafetyLevel: aiResponse.safety?.level || null,
    lastModel: aiResponse.model || null,
    updatedAt: new Date().toISOString()
  };
};
