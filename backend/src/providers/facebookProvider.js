import env from '../config/environment.js';
import HttpError from '../utils/httpError.js';

const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com';

const parseFacebookResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.error) {
    throw new HttpError(401, payload.error?.message || 'Invalid Facebook access token');
  }

  return payload;
};

export const verifyFacebookAccessToken = async (accessToken) => {
  if (!env.facebook.appId || !env.facebook.appSecret) {
    throw new HttpError(500, 'Facebook login is not configured');
  }

  const appAccessToken = `${env.facebook.appId}|${env.facebook.appSecret}`;
  const debugUrl = new URL(`${FACEBOOK_GRAPH_API_BASE_URL}/debug_token`);
  debugUrl.searchParams.set('input_token', accessToken);
  debugUrl.searchParams.set('access_token', appAccessToken);

  const debugPayload = await parseFacebookResponse(await fetch(debugUrl));
  const tokenData = debugPayload.data;

  if (!tokenData?.is_valid || tokenData.app_id !== env.facebook.appId) {
    throw new HttpError(401, 'Invalid Facebook access token');
  }

  const profileUrl = new URL(`${FACEBOOK_GRAPH_API_BASE_URL}/me`);
  profileUrl.searchParams.set('fields', 'id,name,email');
  profileUrl.searchParams.set('access_token', accessToken);

  return parseFacebookResponse(await fetch(profileUrl));
};
