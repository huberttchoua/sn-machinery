import { Router } from 'express';
import { register, login, verifyEmail } from '../controllers/authController';
import { requestPasswordReset, resetPassword, magicLogin } from '../controllers/passwordReset';

const router = Router();

console.log(`Registering auth routes`);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/magic-login', magicLogin);

export default router;
