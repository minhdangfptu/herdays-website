import express from 'express';

import * as blogController from '../controllers/blogController.js';

const router = express.Router();

router.post('/ingest-posts', blogController.ingestPosts);
router.get('/topics', blogController.getTopics);
router.get('/topics/:topicId/posts', blogController.getTopicPosts);
router.get('/posts/:postId', blogController.getPost);

export default router;
