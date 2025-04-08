import express from 'express';
import { getMessages, sendMessage, createChat } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/messages/:chatId').get(protect, getMessages).post(protect, sendMessage);
router.route('/create').post(protect, createChat);

export default router;