import BlogPost from '../models/blogPostModel.js';
import BlogTopic from '../models/blogTopicModel.js';
import HttpError from '../utils/httpError.js';

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
