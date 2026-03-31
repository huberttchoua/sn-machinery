import { Router } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser, getProfile, updateProfile, changePassword } from '../controllers/userController';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken); // Key: All these routes require login

// Profile routes (Any logged-in user)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Admin only routes
router.use(isAdmin); 

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
