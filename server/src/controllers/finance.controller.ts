import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { enrichFinanceWithCurrencies } from '../utils/currency';

export const getFinances = async (req: Request, res: Response) => {
    try {
        const { type, category, status } = req.query;

        const where: any = {};
        if (type) where.type = typeof type === 'string' ? type : (Array.isArray(type) ? type[0] : type);
        if (category) where.category = typeof category === 'string' ? category : (Array.isArray(category) ? category[0] : category);
        if (status) where.status = typeof status === 'string' ? status : (Array.isArray(status) ? status[0] : status);

        const finances = await (prisma as any).finance.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        // Fetch rental data for each finance record
        const enrichedFinances = await Promise.all(
            finances.map(async (finance: any) => {
                let financeWithCurrency = enrichFinanceWithCurrencies(finance);
                
                if (finance.rentalId) {
                    const rental = await (prisma as any).rental.findUnique({
                        where: { id: finance.rentalId },
                        include: {
                            user: { select: { name: true, email: true } },
                            machine: { select: { name: true, type: true } }
                        }
                    });
                    return { ...financeWithCurrency, rental };
                }
                return { ...financeWithCurrency, rental: null };
            })
        );

        res.json(enrichedFinances);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch finances' });
    }
};

export const createFinance = async (req: Request, res: Response) => {
    try {
        const { type, category, description, amount, currency, rentalId, status, notes } = req.body;

        // Validate required fields
        if (!type || !category || !description || amount === undefined) {
            return res.status(400).json({ error: 'Missing required fields: type, category, description, amount' });
        }

        const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
        const rentalIdNum = rentalId ? (typeof rentalId === 'string' ? parseInt(rentalId) : rentalId) : null;

        const finance = await prisma.finance.create({
            data: {
                type,
                category,
                description,
                amount: amountNum,
                currency: currency || 'USD',
                rentalId: rentalIdNum,
                status: status || 'Pending',
                notes: notes || null
            }
        });

        res.status(201).json(finance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create finance record' });
    }
};

export const updateFinance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type, category, description, amount, currency, status, notes } = req.body;
        
        const idNum = parseInt(Array.isArray(id) ? id[0] : id);
        if (isNaN(idNum)) {
            return res.status(400).json({ error: 'Invalid finance ID' });
        }

        const amountNum = amount !== undefined ? (typeof amount === 'string' ? parseFloat(amount) : amount) : undefined;

        const finance = await prisma.finance.update({
            where: { id: idNum },
            data: {
                type: type || undefined,
                category: category || undefined,
                description: description || undefined,
                amount: amountNum,
                currency: currency || undefined,
                status: status || undefined,
                notes: notes || undefined
            }
        });

        res.json(finance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update finance record' });
    }
};

export const deleteFinance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const idNum = parseInt(Array.isArray(id) ? id[0] : id);
        if (isNaN(idNum)) {
            return res.status(400).json({ error: 'Invalid finance ID' });
        }

        await prisma.finance.delete({
            where: { id: idNum }
        });

        res.json({ message: 'Finance record deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete finance record' });
    }
};

export const getFinanceSummary = async (req: Request, res: Response) => {
    try {
        // Include Completed, Approved, and Pending records
        const finances = await (prisma as any).finance.findMany({
            where: {
                status: {
                    in: ['Completed', 'Approved', 'Pending']
                }
            }
        });

        // Enrich with currency conversions
        const enrichedFinances = finances.map((f: any) => enrichFinanceWithCurrencies(f));

        // Calculate totals in both currencies
        const totalIncomeUSD = enrichedFinances
            .filter((f: any) => f.type === 'Income')
            .reduce((sum: number, f: any) => sum + f.amountUSD, 0);

        const totalExpenseUSD = enrichedFinances
            .filter((f: any) => f.type === 'Expense')
            .reduce((sum: number, f: any) => sum + f.amountUSD, 0);

        const profitUSD = totalIncomeUSD - totalExpenseUSD;

        // RWF versions
        const totalIncomeRWF = enrichedFinances
            .filter((f: any) => f.type === 'Income')
            .reduce((sum: number, f: any) => sum + f.amountRWF, 0);

        const totalExpenseRWF = enrichedFinances
            .filter((f: any) => f.type === 'Expense')
            .reduce((sum: number, f: any) => sum + f.amountRWF, 0);

        const profitRWF = totalIncomeRWF - totalExpenseRWF;

        // Breakdown by category (USD)
        const incomeByCategory: any = {};
        const expenseByCategory: any = {};

        enrichedFinances.forEach((f: any) => {
            if (f.type === 'Income') {
                incomeByCategory[f.category] = (incomeByCategory[f.category] || 0) + f.amountUSD;
            } else if (f.type === 'Expense') {
                expenseByCategory[f.category] = (expenseByCategory[f.category] || 0) + f.amountUSD;
            }
        });

        res.json({
            totalIncome: { USD: totalIncomeUSD, RWF: totalIncomeRWF },
            totalExpense: { USD: totalExpenseUSD, RWF: totalExpenseRWF },
            profit: { USD: profitUSD, RWF: profitRWF },
            incomeByCategory,
            expenseByCategory,
            recordCount: enrichedFinances.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch finance summary' });
    }
};
