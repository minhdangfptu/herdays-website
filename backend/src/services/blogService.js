import sanitizeHtml from 'sanitize-html';

import env from '../config/environment.js';
import BlogPost from '../models/blogPostModel.js';
import BlogTopic from '../models/blogTopicModel.js';
import { requestKnowledgeUpsert } from '../providers/aiServiceProvider.js';
import HttpError from '../utils/httpError.js';

const normalizePlainText = (value) => sanitizeHtml(value || '', {
  allowedTags: [],
  allowedAttributes: {}
}).replace(/\s+/g, ' ').trim();

const mapPostStatusToKnowledgeStatus = (status) => (
  status === 'Published' ? 'published' : 'draft'
);

const buildPostUrl = (post) => {
  const frontendUrl = env.frontendUrl.replace(/\/$/, '');
  const topicId = post.postTopicId?._id?.toString() || post.postTopicId?.toString();

  if (!topicId) {
    return `${frontendUrl}/blog`;
  }

  return `${frontendUrl}/blog/${topicId}/posts/${post._id.toString()}`;
};

const buildPostKnowledgeDocument = (post) => {
  const topicName = post.postTopicId?.name;
  const topicSlug = post.postTopicId?.slug;
  const tags = [topicName, topicSlug].filter(Boolean);
  const contentParts = [
    post.title,
    topicName ? `Topic: ${topicName}` : '',
    normalizePlainText(post.content)
  ].filter(Boolean);

  return {
    sourceId: `blog:${post._id.toString()}`,
    sourceType: 'blog',
    title: post.title,
    url: buildPostUrl(post),
    status: mapPostStatusToKnowledgeStatus(post.status),
    content: contentParts.join('\n\n'),
    targetStatuses: [],
    tags,
    version: post.updatedAt?.toISOString?.() || post._id.toString()
  };
};

const getKnowledgeResultValue = (result, key) => (
  result?.[key] ?? result?.[key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)] ?? 0
);

const mergeKnowledgeResult = (summary, result) => {
  summary.acceptedDocuments += getKnowledgeResultValue(result, 'acceptedDocuments');
  summary.skippedDocuments += getKnowledgeResultValue(result, 'skippedDocuments');
  summary.chunkCount += getKnowledgeResultValue(result, 'chunkCount');
  summary.warnings.push(...(result?.warnings || []));
};

const ensureTopicExists = async (topicId) => {
  const topic = await BlogTopic.findById(topicId);
  if (!topic) throw new HttpError(404, 'Blog topic not found');
  return topic;
};

const buildPagination = (page, limit, total) => ({
  currentPage: page,
  limit,
  totalItems: total,
  totalPages: Math.ceil(total / limit)
});

export const getTopics = async () => {
  const topics = await BlogTopic.find().sort({ name: 1 }).lean();
  return { topics };
};

export const ingestPostsToKnowledge = async () => {
  const posts = await BlogPost.find()
    .populate('postTopicId', 'name slug')
    .sort({ updatedAt: -1 })
    .lean();

  const documents = posts.map(buildPostKnowledgeDocument);
  const summary = {
    scannedPosts: posts.length,
    sentDocuments: documents.length,
    acceptedDocuments: 0,
    skippedDocuments: 0,
    chunkCount: 0,
    warnings: []
  };

  for (let index = 0; index < documents.length; index += env.aiService.knowledgeBatchSize) {
    const batch = documents.slice(index, index + env.aiService.knowledgeBatchSize);
    const result = await requestKnowledgeUpsert({ documents: batch });
    mergeKnowledgeResult(summary, result);
  }

  summary.warnings = [...new Set(summary.warnings)];

  return {
    message: 'Blog posts ingested to AI knowledge successfully',
    summary
  };
};

export const getTopicPosts = async (topicId, { page, limit }) => {
  const topic = await ensureTopicExists(topicId);
  const filter = { postTopicId: topic._id, status: 'Published' };
  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .select('-content')
      .populate('authorId', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BlogPost.countDocuments(filter)
  ]);

  return { topic, posts, pagination: buildPagination(page, limit, total) };
};

export const getPublishedPost = async (postId) => {
  const post = await BlogPost.findOne({ _id: postId, status: 'Published' })
    .populate('postTopicId', 'name slug')
    .populate('authorId', 'fullName')
    .lean();
  if (!post) throw new HttpError(404, 'Blog post not found');
  return { post };
};

export const getAdminPosts = async ({ page, limit, status, topicId }) => {
  const filter = {};
  if (status) filter.status = status;
  if (topicId) filter.postTopicId = topicId;

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .select('-content')
      .populate('postTopicId', 'name slug')
      .populate('authorId', 'fullName email')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BlogPost.countDocuments(filter)
  ]);

  return { posts, pagination: buildPagination(page, limit, total) };
};

export const getAdminPost = async (postId) => {
  const post = await BlogPost.findById(postId).lean();
  if (!post) throw new HttpError(404, 'Blog post not found');
  return { post };
};

export const createPost = async (authorId, postData) => {
  await ensureTopicExists(postData.postTopicId);
  const post = await BlogPost.create({ ...postData, authorId });
  return { message: 'Blog post created successfully', post };
};

export const updatePost = async (postId, postData) => {
  if (postData.postTopicId) await ensureTopicExists(postData.postTopicId);
  const post = await BlogPost.findByIdAndUpdate(postId, postData, {
    new: true,
    runValidators: true
  });
  if (!post) throw new HttpError(404, 'Blog post not found');
  return { message: 'Blog post updated successfully', post };
};

export const updateTopicImage = async (topicId, imgThumbnail) => {
  const topic = await BlogTopic.findByIdAndUpdate(
    topicId,
    { imgThumbnail },
    { new: true, runValidators: true }
  );
  if (!topic) throw new HttpError(404, 'Blog topic not found');
  return { message: 'Cập nhật ảnh chủ đề thành công', topic };
};
