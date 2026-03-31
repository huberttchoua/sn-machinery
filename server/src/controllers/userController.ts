import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, phoneNumber: true, role: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phoneNumber, role } = req.body;

        // Admin can create any role
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                role: role || 'Customer',
            },
        });

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phoneNumber, role } = req.body;

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { name, email, phoneNumber, role },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id: Number(id) } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, phoneNumber: true, role: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { name, email, phoneNumber } = req.body;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, email, phoneNumber },
            select: { id: true, name: true, email: true, phoneNumber: true, role: true }
        });

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update password' });
    }
};
