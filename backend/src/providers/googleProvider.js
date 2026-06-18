import { OAuth2Client } from 'google-auth-library';

import env from '../config/environment.js';
import HttpError from '../utils/httpError.js';

const googleClient = new OAuth2Client(env.google.clientId);

export const verifyGoogleIdToken = async (idToken) => {
  if (!env.google.clientId) {
    throw new HttpError(500, 'Google login is not configured');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.google.clientId
  });

  return ticket.getPayload();
};
