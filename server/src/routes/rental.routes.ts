import { Router } from 'express';
import { getRentals, updateRentalStatus, createRental, getMyRentals } from '../controllers/rental.controller';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Customer Routes
router.post('/', authenticateToken, createRental);
router.get('/my', authenticateToken, getMyRentals);

// Admin Routes
router.get('/', authenticateToken, isAdmin, getRentals);
router.patch('/:id/status', authenticateToken, isAdmin, updateRentalStatus);

export default router;
