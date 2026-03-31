import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// --- Staff Management ---

export const getAllStaff = async (req: Request, res: Response) => {
    try {
        const staff = await prisma.staff.findMany({
            include: { tasks: true, rentals: { where: { status: 'Active' } } }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
};

export const createStaff = async (req: Request, res: Response) => {
    try {
        const { name, role, phoneNumber, email, licenseNumber } = req.body;
        const staff = await prisma.staff.create({
            data: {
                name,
                role,
                phoneNumber,
                email,
                licenseNumber,
                status: 'Available'
            }
        });
        res.status(201).json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create staff member' });
    }
};

export const updateStaff = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, role, phoneNumber, email, licenseNumber, status } = req.body;

        const staff = await prisma.staff.update({
            where: { id: parseInt(id as string) },
            data: { name, role, phoneNumber, email, licenseNumber, status }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update staff' });
    }
};

export const deleteStaff = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.staff.delete({ where: { id: parseInt(id as string) } });
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete staff' });
    }
};

// --- Task Assignment ---

export const createTask = async (req: Request, res: Response) => {
    try {
        const { staffId, title, description } = req.body;
        const task = await prisma.task.create({
            data: {
                staffId: parseInt(staffId),
                title,
                description,
                status: 'Pending'
            }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign task' });
    }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const task = await prisma.task.update({
            where: { id: parseInt(id as string) },
            data: { status }
        });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
};

// --- Driver Assignment for Rentals ---

export const assignDriverToRental = async (req: Request, res: Response) => {
    try {
        const { rentalId } = req.params;
        const { driverId } = req.body;

        const rental = await prisma.rental.update({
            where: { id: parseInt(rentalId as string) },
            data: { driverId: parseInt(driverId) }
        });

        // Mark driver as occupied
        await prisma.staff.update({
            where: { id: parseInt(driverId) },
            data: { status: 'Occupied' }
        });

        res.json(rental);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign driver' });
    }
};

// Retrieve driver from active operation (unassign from rental and mark available)
export const retrieveDriver = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;
        const id = parseInt(driverId as string);

        // Find active rental where this driver is assigned
        const rental = await prisma.rental.findFirst({ where: { driverId: id, status: 'Active' } });
        if (!rental) {
            return res.status(400).json({ error: 'Driver is not assigned to any active operation' });
        }

        // Unassign driver from rental
        await prisma.rental.update({ where: { id: rental.id }, data: { driverId: null } });

        // Mark driver as available
        const staff = await prisma.staff.update({ where: { id }, data: { status: 'Available' } });

        res.json({ message: 'Driver retrieved successfully', staff });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve driver' });
    }
};
