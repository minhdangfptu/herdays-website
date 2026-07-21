import express from 'express';

import * as blogController from '../controllers/blogController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/posts/search', blogController.searchPosts);
router.post('/ingest-posts', adminMiddleware, blogController.ingestPosts);
router.get('/topics', blogController.getTopics);
router.get('/topics/:topicId/posts', blogController.getTopicPosts);
router.get('/posts/:postId', blogController.getPost);

export default router;
