import env from '../config/environment.js';

const buildError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildUrl = (path) => {
  const baseUrl = env.aiService.url?.trim();
  if (!baseUrl) {
    throw buildError(503, 'AI service is not configured');
  }

  return new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

const requestAiService = async (path, payload, { timeoutMs = env.aiService.timeoutMs } = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': env.aiService.token || ''
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const body = await parseResponseBody(response);

    if (!response.ok) {
      const detail = typeof body === 'object' && body?.detail ? body.detail : 'AI service returned an error';
      throw buildError(response.status, detail);
    }

    return body;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw buildError(504, 'AI service timed out');
    }

    if (error.statusCode) {
      throw error;
    }

    throw buildError(503, 'Cannot connect to AI service');
  } finally {
    clearTimeout(timeoutId);
  }
};

export const requestChatResponse = async (payload) => requestAiService('v1/chat/respond', payload);

export const requestKnowledgeUpsert = async (payload) => (
  requestAiService('v1/knowledge/documents', payload, {
    timeoutMs: env.aiService.knowledgeTimeoutMs
  })
);
