import { v2 as cloudinary } from 'cloudinary';

import env from '../config/environment.js';
import HttpError from '../utils/httpError.js';

const getConfiguration = () => {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new HttpError(503, 'Cloudinary chưa được cấu hình');
  }
  return { cloudName, apiKey, apiSecret };
};

const getFolder = (type) => {
  const { folders } = env.cloudinary;
  return folders?.[type] || folders?.blog || 'herdays/blog';
};

export const createImageUploadSignature = (type = 'blog') => {
  const { cloudName, apiKey, apiSecret } = getConfiguration();
  const folder = getFolder(type);
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    apiSecret
  );

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    apiKey,
    timestamp,
    folder,
    signature
  };
};
