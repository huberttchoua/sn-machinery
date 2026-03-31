import { Router } from 'express';
import {
    getAllStaff, createStaff, updateStaff, deleteStaff,
    createTask, updateTaskStatus, assignDriverToRental, retrieveDriver
} from '../controllers/staff.controller';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.use(isAdmin);

// Staff CRUD
router.get('/', getAllStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

// Tasks
router.post('/tasks', createTask);
router.patch('/tasks/:id/status', updateTaskStatus);

// Driver Assignment
router.post('/assign-driver/:rentalId', assignDriverToRental);
// Retrieve driver from operation
router.post('/retrieve/:driverId', retrieveDriver);

export default router;
