import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createNotification, sendAdminEmail } from './notification.controller';
import { emailTemplates } from '../utils/emailService';

export const getRentals = async (req: Request, res: Response) => {
    try {
        const rentals = await prisma.rental.findMany({
            include: {
                user: {
                    select: { name: true, email: true, phoneNumber: true }
                },
                machine: {
                    select: { name: true, plateNumber: true, dailyRate: true, type: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rentals' });
    }
};

export const updateRentalStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Active, Completed, Cancelled

        // Start a transaction to ensure machine status stays in sync
        const result = await prisma.$transaction(async (tx) => {
            const rental = await tx.rental.update({
                where: { id: parseInt(id as string) },
                data: { status },
                include: { machine: true, user: true } // Include for notification details
            });

            // Update machine status based on rental status
            if (status === 'Active') {
                await tx.machine.update({
                    where: { id: rental.machineId },
                    data: { status: 'Rented' }
                });
            } else if (status === 'Completed' || status === 'Cancelled') {
                await tx.machine.update({
                    where: { id: rental.machineId },
                    data: { status: 'Available' }
                });

                // Auto-mark driver as Available when rental is not active
                if (rental.driverId) {
                    await tx.staff.update({
                        where: { id: rental.driverId },
                        data: { status: 'Available' }
                    });
                }

                // Create Finance record when rental is completed
                if (status === 'Completed' && rental.totalCost) {
                    await tx.finance.create({
                        data: {
                            type: 'Income',
                            category: 'Rental',
                            description: `Payment for ${rental.machine.name} rental - Customer: ${rental.user.name}`,
                            amount: rental.totalCost,
                            currency: 'USD',
                            rentalId: rental.id,
                            status: 'Completed',
                            notes: `Payment method: ${rental.paymentMethod || 'Not specified'}`
                        }
                    });
                }
            }

            return rental;
        });

        // Send Notifications and Emails based on status
        if (result) {
            const startDate = result.startDate.toLocaleDateString();
            const endDate = result.endDate.toLocaleDateString();

            if (status === 'Active') {
                // Rental approved
                const emailContent = emailTemplates.rentalApproved(
                    result.user.name,
                    result.machine.name,
                    startDate,
                    endDate
                );

                await createNotification(
                    `Your rental for ${result.machine.name} has been approved!`,
                    'success',
                    result.userId,
                    false,
                    emailContent
                );
            } else if (status === 'Completed') {
                // Rental completed
                const emailContent = emailTemplates.rentalCompleted(
                    result.user.name,
                    result.machine.name,
                    result.totalCost || 0
                );

                await createNotification(
                    `Your rental for ${result.machine.name} is now completed. Thank you!`,
                    'info',
                    result.userId,
                    false,
                    emailContent
                );
            } else if (status === 'Cancelled') {
                // Rental cancelled/rejected
                const emailContent = emailTemplates.rentalRejected(
                    result.user.name,
                    result.machine.name,
                    'The rental request was cancelled'
                );

                await createNotification(
                    `Your rental for ${result.machine.name} has been cancelled.`,
                    'warning',
                    result.userId,
                    false,
                    emailContent
                );
            } else {
                // Other status updates
                await createNotification(
                    `Your rental for ${result.machine.name} is now ${status}.`,
                    'info',
                    result.userId
                );
            }
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update rental status' });
    }
};

export const createRental = async (req: Request, res: Response) => {
    try {
        const { machineId, startDate, endDate, totalCost, userId: bodyUserId, status, hasInsurance, hasDelivery, hasOperator, insuranceCost, deliveryCost, operatorCost, paymentMethod } = req.body;
        // @ts-ignore
        const requesterId = req.user.userId;
        // @ts-ignore
        const requesterRole = req.user.role;

        let targetUserId = requesterId;
        let rentalStatus = 'Pending'; // Default for customers

        // Allow Admin to override user and status
        if (requesterRole === 'Admin') {
            if (bodyUserId) targetUserId = parseInt(bodyUserId);
            if (status) rentalStatus = status;
        }

        // Fetch machine and user info for notifications and emails
        const machine = await prisma.machine.findUnique({ where: { id: parseInt(machineId) } });
        const user = await prisma.user.findUnique({ where: { id: targetUserId } });
        const machineName = machine ? machine.name : 'Unknown Machine';
        const userName = user ? user.name : 'Unknown User';

        // Start transaction to ensure consistency
        const rental = await prisma.$transaction(async (tx) => {
            const newRental = await tx.rental.create({
                data: {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    totalCost: parseFloat(totalCost || 0),
                    status: rentalStatus,
                    userId: targetUserId,
                    machineId: parseInt(machineId),
                    hasInsurance: Boolean(hasInsurance),
                    hasDelivery: Boolean(hasDelivery),
                    hasOperator: Boolean(hasOperator),
                    insuranceCost: parseFloat(insuranceCost || 0),
                    deliveryCost: parseFloat(deliveryCost || 0),
                    operatorCost: parseFloat(operatorCost || 0),
                    paymentMethod: paymentMethod || 'credit-card'
                }
            });

            // If created as Active immediately, update machine status
            if (rentalStatus === 'Active') {
                await tx.machine.update({
                    where: { id: parseInt(machineId) },
                    data: { status: 'Rented' }
                });
            }

            return newRental;
        });

        const formattedStartDate = new Date(startDate).toLocaleDateString();
        const formattedEndDate = new Date(endDate).toLocaleDateString();

        // Notifications and Emails
        // 1. Notify the user
        await createNotification(
            `Rental request submitted for ${machineName}. Status: ${rentalStatus}`,
            'success',
            targetUserId
        );

        // 2. Notify and Email Admins (if it was a regular user request)
        if (requesterRole !== 'Admin') {
            // In-app notification for admins
            await createNotification(
                `New rental request for ${machineName} from ${userName}`,
                'info',
                undefined, // No specific user, but...
                true // Set isAdmin = true so all admins see it
            );

            // Send email to all admins
            const adminEmailContent = emailTemplates.rentalRequest(
                userName,
                machineName,
                formattedStartDate,
                formattedEndDate
            );

            await sendAdminEmail(
                adminEmailContent.subject,
                adminEmailContent.html,
                adminEmailContent.text
            );
        }

        res.status(201).json(rental);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create rental request' });
    }
};

export const getMyRentals = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const rentals = await prisma.rental.findMany({
            where: { userId },
            include: {
                machine: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user rentals' });
    }
};
