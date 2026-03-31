import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../utils/emailService';

// Get all notifications for the logged-in user (or admin)
export const getNotifications = async (req: Request, res: Response) => {
    try {
        // @ts-ignore - User is attached by middleware
        const { userId, role } = req.user;

        let whereClause: any = {
            OR: [
                { userId: Number(userId) }, // Notifications specific to this user
            ]
        };

        if (role === 'Admin') {
            whereClause.OR.push({ isAdmin: true }); // Admins also see admin-wide notifications
        }

        const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to last 20 notifications
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// Mark a notification as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.notification.update({
            where: { id: Number(id) },
            data: { isRead: true }
        });

        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

// Helper function to create notification (internal use)
// Now supports sending emails as well
export const createNotification = async (
    message: string,
    type: string,
    userId?: number,
    isAdmin: boolean = false,
    emailOptions?: {
        subject: string;
        html?: string;
        text?: string;
    }
) => {
    try {
        // Create in-app notification
        await prisma.notification.create({
            data: {
                message,
                type,
                userId: userId || null,
                isAdmin
            }
        });

        // Send email if email options are provided and user has an email
        if (emailOptions && userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });

            if (user?.email) {
                await sendEmail({
                    to: user.email,
                    subject: emailOptions.subject,
                    html: emailOptions.html,
                    text: emailOptions.text
                });
            }
        }
    } catch (error) {
        console.error('Failed to create notification', error);
    }
};

// Send email to admin(s)
export const sendAdminEmail = async (
    subject: string,
    html: string,
    text?: string
) => {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'Admin' },
            select: { email: true }
        });

        const adminEmails = admins.map(admin => admin.email).filter(Boolean);

        if (adminEmails.length > 0) {
            await sendEmail({
                to: adminEmails,
                subject,
                html,
                text
            });
        }
    } catch (error) {
        console.error('Failed to send admin email', error);
    }
};
