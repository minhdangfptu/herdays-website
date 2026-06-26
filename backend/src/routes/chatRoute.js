import express from 'express';

import * as chatController from '../controllers/chatController.js';
import attachOptionalChatUser from '../middlewares/chatOptionalAuthMiddleware.js';

const router = express.Router();

router.use(attachOptionalChatUser);

router
  .route('/conversations')
  .get(chatController.getConversations)
  .post(chatController.createConversation);

router
  .route('/conversations/:id')
  .delete(chatController.deleteConversation);

router
  .route('/conversations/:id/messages')
  .get(chatController.getMessages)
  .post(chatController.sendMessage);

export default router;

