import * as blogService from '../services/blogService.js';
import { sendSuccess } from '../utils/response.js';
import {
  validateAdminPostQuery,
  validateCreatePost,
  validatePagination,
  validatePostId,
  validateTopicId,
  validateUpdateTopicImage,
  validateUpdatePost
} from '../validations/blogValidation.js';

export const getTopics = async (req, res, next) => {
  try {
    void req;
    const result = await blogService.getTopics();
    sendSuccess(res, {
      message: 'Lấy danh sách chủ đề thành công',
      data: result.topics
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicPosts = async (req, res, next) => {
  try {
    const topicId = validateTopicId(req.params.topicId);
    const result = await blogService.getTopicPosts(topicId, validatePagination(req.query));
    sendSuccess(res, {
      message: 'Lấy danh sách bài viết thành công',
      data: result.posts,
      meta: { ...result.pagination, topic: result.topic }
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const result = await blogService.getPublishedPost(validatePostId(req.params.postId));
    sendSuccess(res, {
      message: 'Lấy chi tiết bài viết thành công',
      data: result.post
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminPosts = async (req, res, next) => {
  try {
    const result = await blogService.getAdminPosts(validateAdminPostQuery(req.query));
    sendSuccess(res, {
      message: 'Lấy danh sách bài viết quản trị thành công',
      data: result.posts,
      meta: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminPost = async (req, res, next) => {
  try {
    const result = await blogService.getAdminPost(validatePostId(req.params.postId));
    sendSuccess(res, {
      message: 'Lấy bài viết quản trị thành công',
      data: result.post
    });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const result = await blogService.createPost(req.user.id, validateCreatePost(req.body));
    sendSuccess(res, {
      statusCode: 201,
      message: result.message,
      data: result.post
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const result = await blogService.updatePost(
      validatePostId(req.params.postId),
      validateUpdatePost(req.body)
    );
    sendSuccess(res, {
      message: result.message,
      data: result.post
    });
  } catch (error) {
    next(error);
  }
};

export const updateTopicImage = async (req, res, next) => {
  try {
    const topicId = validateTopicId(req.params.topicId);
    const { imgThumbnail } = validateUpdateTopicImage(req.body);
    const result = await blogService.updateTopicImage(topicId, imgThumbnail);
    sendSuccess(res, {
      message: result.message,
      data: result.topic
    });
  } catch (error) {
    next(error);
  }
};
