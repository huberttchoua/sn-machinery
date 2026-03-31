import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getMachines = async (req: Request, res: Response) => {
    try {
        const machines = await prisma.machine.findMany();
        res.json(machines);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch machines' });
    }
};

export const createMachine = async (req: Request, res: Response) => {
    try {
        const { name, type, dailyRate, dailyRateRwf, healthStatus, plateNumber, description, imageUrl: explicitImageUrl } = req.body;

        // Handle file upload
        let finalImageUrl = explicitImageUrl;
        if (req.file) {
            finalImageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        }

        const machine = await prisma.machine.create({
            data: {
                name,
                type,
                status: 'Available',
                dailyRate: parseFloat(dailyRate),
                dailyRateRwf: parseFloat(dailyRateRwf || '0'),
                healthStatus: healthStatus || 'Excellent',
                plateNumber: plateNumber || 'N/A',
                description,
                imageUrl: finalImageUrl
            }
        });
        res.status(201).json(machine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create machine' });
    }
};

export const updateMachine = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, type, dailyRate, dailyRateRwf, healthStatus, plateNumber, description, imageUrl: explicitImageUrl, status } = req.body;

        // Handle file upload
        let finalImageUrl = explicitImageUrl;
        if (req.file) {
            finalImageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        }

        const machine = await prisma.machine.update({
            where: { id: parseInt(id as string) },
            data: {
                name,
                type,
                dailyRate: dailyRate ? parseFloat(dailyRate) : undefined,
                dailyRateRwf: dailyRateRwf ? parseFloat(dailyRateRwf) : undefined,
                healthStatus,
                plateNumber,
                description,
                imageUrl: finalImageUrl,
                status
            }
        });
        res.json(machine);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update machine' });
    }
};

export const deleteMachine = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.machine.delete({ where: { id: parseInt(id as string) } });
        res.json({ message: 'Machine deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete machine' });
    }
};
