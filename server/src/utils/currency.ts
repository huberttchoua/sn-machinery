/**
 * Currency conversion utility
 * Exchange rate: 1 USD = 1300 RWF (adjust as needed)
 */

const EXCHANGE_RATE = 1300; // 1 USD = 1300 RWF

export const convertUSDtoRWF = (usd: number): number => {
    return Math.round(usd * EXCHANGE_RATE * 100) / 100;
};

export const convertRWFtoUSD = (rwf: number): number => {
    return Math.round((rwf / EXCHANGE_RATE) * 100) / 100;
};

export const getExchangeRate = (): number => {
    return EXCHANGE_RATE;
};

export const formatCurrency = (amount: number, currency: 'USD' | 'RWF' = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export const enrichFinanceWithCurrencies = (finance: any) => {
    const baseAmount = finance.amount;
    const baseCurrency = finance.currency;

    return {
        ...finance,
        amountUSD: baseCurrency === 'USD' ? baseAmount : convertRWFtoUSD(baseAmount),
        amountRWF: baseCurrency === 'RWF' ? baseAmount : convertUSDtoRWF(baseAmount)
    };
};
