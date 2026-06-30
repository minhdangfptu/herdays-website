import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';

import HttpError from '../utils/httpError.js';

const POST_STATUSES = ['Draft', 'Published'];
const MAX_PAGE_SIZE = 50;
const EDITOR_STYLE_TAGS = ['p', 'div', 'h1', 'h2', 'h3', 'li', 'blockquote'];

const sanitizeContent = (content) => sanitizeHtml(content, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'h1', 'h2', 'h3']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    ...Object.fromEntries(EDITOR_STYLE_TAGS.map((tag) => [tag, ['style']])),
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading']
  },
  allowedStyles: {
    '*': {
      'font-size': [/^0\.875rem$/],
      'text-align': [/^(left|center|right|justify)$/]
    }
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true)
  }
});

const validateCloudinaryUrl = (value, fieldName) => {
  if (!value) return '';

  try {
    const url = new URL(value);
    const isCloudinaryHost = url.hostname === 'cloudinary.com' || url.hostname.endsWith('.cloudinary.com');
    if (url.protocol !== 'https:' || !isCloudinaryHost) throw new Error('Invalid Cloudinary URL');
    return url.toString();
  } catch {
    throw new HttpError(400, `${fieldName} must be a valid HTTPS Cloudinary URL`);
  }
};

const validateObjectId = (value, fieldName) => {
  if (!mongoose.isValidObjectId(value)) throw new HttpError(400, `${fieldName} is invalid`);
  return value;
};

const validateTitle = (title) => {
  const normalizedTitle = title?.trim();
  if (!normalizedTitle) throw new HttpError(400, 'title is required');
  if (normalizedTitle.length > 200) throw new HttpError(400, 'title must not exceed 200 characters');
  return normalizedTitle;
};

const validateContent = (content) => {
  if (typeof content !== 'string') throw new HttpError(400, 'content is required');
  const sanitizedContent = sanitizeContent(content);
  const plainText = sanitizeHtml(sanitizedContent, { allowedTags: [], allowedAttributes: {} }).trim();
  if (!plainText) throw new HttpError(400, 'content must include readable text');
  const imageSources = [...sanitizedContent.matchAll(/<img[^>]+src="([^"]+)"/g)];
  imageSources.forEach(([, source], index) => validateCloudinaryUrl(source, `content image ${index + 1}`));
  return sanitizedContent;
};

const validateStatus = (status) => {
  if (!POST_STATUSES.includes(status)) throw new HttpError(400, 'status must be Draft or Published');
  return status;
};

const validateImages = (images) => {
  if (images === undefined) return [];
  if (!Array.isArray(images)) throw new HttpError(400, 'images must be an array');
  if (images.length > 20) throw new HttpError(400, 'images must not contain more than 20 items');
  return images.map((image, index) => validateCloudinaryUrl(image, `images[${index}]`));
};

export const validatePostId = (postId) => validateObjectId(postId, 'postId');

export const validateTopicId = (topicId) => validateObjectId(topicId, 'topicId');

export const validateUpdateTopicImage = (body) => ({
  imgThumbnail: validateCloudinaryUrl(body.imgThumbnail, 'imgThumbnail')
});

export const validatePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(query.limit, 10) || 12));
  return { page, limit };
};

export const validateAdminPostQuery = (query) => {
  const result = validatePagination(query);
  if (query.status) result.status = validateStatus(query.status);
  if (query.topicId) result.topicId = validateTopicId(query.topicId);
  return result;
};

export const validateCreatePost = (body) => ({
  postTopicId: validateTopicId(body.postTopicId),
  title: validateTitle(body.title),
  content: validateContent(body.content),
  images: validateImages(body.images),
  thumbnail: validateCloudinaryUrl(body.thumbnail, 'thumbnail'),
  status: body.status ? validateStatus(body.status) : 'Draft'
});

export const validateUpdatePost = (body) => {
  const allowedFields = ['postTopicId', 'title', 'content', 'images', 'thumbnail', 'status'];
  const hasUpdate = allowedFields.some((field) => body[field] !== undefined);
  if (!hasUpdate) throw new HttpError(400, 'At least one post field is required');

  const update = {};
  if (body.postTopicId !== undefined) update.postTopicId = validateTopicId(body.postTopicId);
  if (body.title !== undefined) update.title = validateTitle(body.title);
  if (body.content !== undefined) update.content = validateContent(body.content);
  if (body.images !== undefined) update.images = validateImages(body.images);
  if (body.thumbnail !== undefined) update.thumbnail = validateCloudinaryUrl(body.thumbnail, 'thumbnail');
  if (body.status !== undefined) update.status = validateStatus(body.status);
  return update;
};
