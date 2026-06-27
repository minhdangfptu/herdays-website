/**
* Anh em Twobars: Giang Dam, Louis, Antonie was here
* All our efforts are for a brighter future, where we can freely eat bread and drink bubble tea without worrying about someone stealing it.
* Updated by Louis on 2026-06-16
*/
import express from 'express';

import authRoute from './authRoute.js';
import adminPostRoute from './adminPostRoute.js';
import adminTopicRoute from './adminTopicRoute.js';
import adminUploadRoute from './adminUploadRoute.js';
import blogRoute from './blogRoute.js';
import { sendSuccess } from '../utils/response.js';
import profileRoute from './profileRoute.js';
import contactRoute from './contactRoute.js';
import adminContactRoute from './adminContactRoute.js';
import quizRoute from './quizRoute.js';
import chatRoute from './chatRoute.js';
import boxRoute from './boxRoute.js';
import cartRoute from './cartRoute.js';
import productRoute from './productRoute.js';
import adminOrderRoute from './adminOrderRoute.js';
import adminUserRoute from './adminUserRoute.js';

const router = express.Router();

router.get('/status', (req, res) => {
    void req;
    sendSuccess(res, {
        message: 'API HerDays đang hoạt động',
        data: { status: 'running' }
    });
});

router.use('/auth', authRoute);
router.use('/blog', blogRoute);
router.use('/admin/posts', adminPostRoute);
router.use('/admin/topics', adminTopicRoute);
router.use('/admin/uploads', adminUploadRoute);
router.use('/admin/contacts', adminContactRoute);
router.use('/profile', profileRoute);
router.use('/contacts', contactRoute);
router.use('/quiz', quizRoute);
router.use('/chat', chatRoute);
router.use('/box', boxRoute);
router.use('/cart', cartRoute);
router.use('/admin/products', productRoute);
router.use('/admin/orders', adminOrderRoute);
router.use('/admin/users', adminUserRoute);

export default router;
