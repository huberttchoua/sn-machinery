import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail, emailTemplates } from '../utils/emailService';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phoneNumber, role, accountType, businessName, businessEmail, businessAddress } = req.body;

        // Basic validation
        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // If business account, require business fields
        if (accountType === 'Business' && (!businessName || !businessEmail || !businessAddress)) {
            return res.status(400).json({ error: 'Business name, email, and address are required for business accounts' });
        }

        // Password strength check
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
            return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and a number' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await prisma.user.create({
            data: {
                name,
                // Basic user details
                email,
                password: hashedPassword,
                phoneNumber,
                role: 'Customer', // Default to Customer for public registration
                accountType: accountType || 'Individual',
                businessName: accountType === 'Business' ? businessName : null,
                businessEmail: accountType === 'Business' ? businessEmail : null,
                businessAddress: accountType === 'Business' ? businessAddress : null,
                verificationCode,
                isVerified: false
            },
        });

        // Send verification email
        try {
            console.log(`📧 Sending verification email to: ${user.email}`);
            const verificationEmailContent = emailTemplates.verificationEmail(user.name, verificationCode);
            const emailSent = await sendEmail({
                to: user.email,
                subject: verificationEmailContent.subject,
                html: verificationEmailContent.html,
                text: verificationEmailContent.text
            });

            if (emailSent) {
                console.log(`✅ Verification email sent successfully to: ${user.email}`);
            } else {
                console.log(`⚠️ Verification email failed to send to: ${user.email}`);
            }
        } catch (emailError) {
            console.error('❌ Error sending verification email:', emailError);
        }

        res.status(201).json({ 
            message: 'Registration successful. Please check your email for verification code.',
            userId: user.id,
            email: user.email
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const MAX_LOGIN_ATTEMPTS = 5;
        const LOCK_TIME_MINUTES = 30;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
            const unlockTime = user.accountLockedUntil.toLocaleString();
            return res.status(403).json({ 
                error: 'Account is temporarily locked due to multiple failed login attempts',
                lockedUntil: unlockTime,
                message: 'Please check your email for a login link or wait until the unlock time.'
            });
        }

        // Reset failed attempts if lock time has passed
        if (user.accountLockedUntil && new Date() >= user.accountLockedUntil) {
            await prisma.user.update({
                where: { email },
                data: {
                    failedLoginAttempts: 0,
                    accountLockedUntil: null
                }
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Increment failed login attempts
            const newAttempts = user.failedLoginAttempts + 1;
            
            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                // Lock the account
                const lockUntil = new Date();
                lockUntil.setMinutes(lockUntil.getMinutes() + LOCK_TIME_MINUTES);
                
                // Generate magic login token
                const crypto = require('crypto');
                const magicToken = crypto.randomBytes(32).toString('hex');
                const tokenExpires = new Date();
                tokenExpires.setHours(tokenExpires.getHours() + 1);

                await prisma.user.update({
                    where: { email },
                    data: {
                        failedLoginAttempts: newAttempts,
                        accountLockedUntil: lockUntil,
                        resetPasswordToken: magicToken,
                        resetPasswordExpires: tokenExpires
                    }
                });

                // Send account locked email with magic login link
                const magicLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/magic-login?token=${magicToken}`;
                const accountLockedEmail = emailTemplates.accountLocked(user.name, lockUntil.toLocaleString());
                const magicLinkEmail = emailTemplates.magicLoginLink(user.name, magicLink);
                
                await sendEmail({
                    to: user.email,
                    subject: accountLockedEmail.subject,
                    html: accountLockedEmail.html,
                    text: accountLockedEmail.text
                });

                await sendEmail({
                    to: user.email,
                    subject: magicLinkEmail.subject,
                    html: magicLinkEmail.html,
                    text: magicLinkEmail.text
                });

                return res.status(403).json({ 
                    error: 'Account locked due to too many failed login attempts',
                    lockedUntil: lockUntil.toLocaleString(),
                    message: 'A login link has been sent to your email. Alternatively, you can reset your password.'
                });
            } else {
                // Update failed attempts
                await prisma.user.update({
                    where: { email },
                    data: { failedLoginAttempts: newAttempts }
                });

                const attemptsLeft = MAX_LOGIN_ATTEMPTS - newAttempts;
                return res.status(400).json({ 
                    error: 'Invalid credentials',
                    attemptsLeft,
                    message: `You have ${attemptsLeft} attempt(s) remaining before your account is locked.`
                });
            }
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: 'Please verify your email before logging in' });
        }

        // Successful login - reset failed attempts
        await prisma.user.update({
            where: { email },
            data: { 
                failedLoginAttempts: 0,
                accountLockedUntil: null
            }
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'User already verified' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                verificationCode: null
            }
        });

        const token = jwt.sign({ userId: updatedUser.id, role: updatedUser.role }, JWT_SECRET, { expiresIn: '24h' });

        // Send welcome email after successful verification
        try {
            const welcomeEmailContent = emailTemplates.welcomeEmail(updatedUser.name, updatedUser.accountType);
            await sendEmail({
                to: updatedUser.email,
                subject: welcomeEmailContent.subject,
                html: welcomeEmailContent.html,
                text: welcomeEmailContent.text
            });
        } catch (error) {
            console.error('Error sending welcome email', error);
        }

        res.json({ 
            message: 'Email verified successfully', 
            token, 
            user: { 
                id: updatedUser.id, 
                name: updatedUser.name, 
                email: updatedUser.email, 
                role: updatedUser.role 
            } 
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Something went wrong during verification' });
    }
};
