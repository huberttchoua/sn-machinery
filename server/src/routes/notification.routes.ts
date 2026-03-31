import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken); // Protect all notification routes

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
