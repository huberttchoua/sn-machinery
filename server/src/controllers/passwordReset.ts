import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail, emailTemplates } from '../utils/emailService';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Password Reset Request
export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 1); // 1 hour expiry

        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: tokenExpires,
                // Also reset login attempts and unlock account
                failedLoginAttempts: 0,
                accountLockedUntil: null
            }
        });

        // Send password reset email
        const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        const resetEmail = emailTemplates.passwordReset(user.name, resetLink);
        
        await sendEmail({
            to: user.email,
            subject: resetEmail.subject,
            html: resetEmail.html,
            text: resetEmail.text
        });

        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Reset Password with Token
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        // Password strength check
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
            return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and a number' });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gte: new Date() // Token not expired
                }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                failedLoginAttempts: 0,
                accountLockedUntil: null
            }
        });

        res.json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Magic Login Link
export const magicLogin = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gte: new Date() // Token not expired
                }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired login link' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: 'Please verify your email before logging in' });
        }

        // Clear the token and reset login attempts
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: null,
                resetPasswordExpires: null,
                failedLoginAttempts: 0,
                accountLockedUntil: null
            }
        });

        const jwtToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            token: jwtToken, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            message: 'Login successful via magic link'
        });
    } catch (error) {
        console.error('Magic login error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
