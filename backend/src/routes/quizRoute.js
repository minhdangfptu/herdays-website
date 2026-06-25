import express from 'express';

import * as quizController from '../controllers/quizController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/answers', authMiddleware, quizController.submitAnswers);
router.get('/:tag', quizController.getQuestions);

export default router;
