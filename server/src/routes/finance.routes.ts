import { Router } from 'express';
import { getFinances, createFinance, updateFinance, deleteFinance, getFinanceSummary } from '../controllers/finance.controller';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes with auth middleware
router.use(authenticateToken);

// Get all finances
router.get('/', getFinances);

// Get finance summary
router.get('/summary/overview', getFinanceSummary);

// Create finance record
router.post('/', createFinance);

// Update finance record
router.put('/:id', updateFinance);

// Delete finance record
router.delete('/:id', deleteFinance);

export default router;
