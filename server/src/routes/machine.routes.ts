import { Router } from 'express';
import { getMachines, createMachine, updateMachine, deleteMachine } from '../controllers/machine.controller';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Public route for catalog
router.get('/', getMachines);

// Protected Admin routes
router.post('/', authenticateToken, isAdmin, upload.single('image'), createMachine);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), updateMachine);
router.delete('/:id', authenticateToken, isAdmin, deleteMachine);

export default router;
