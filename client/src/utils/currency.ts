export const EXCHANGE_RATE = 1458.80; // 1 USD = 1458.80 RWF (fallback)

type StoredAdminSettings = {
    preferences?: {
        exchangeRateRwfPerUsd?: number;
    };
};

export const getExchangeRate = (): number => {
    if (typeof window === 'undefined') return EXCHANGE_RATE;

    try {
        const raw = window.localStorage.getItem('adminSettings');
        if (!raw) return EXCHANGE_RATE;

        const parsed = JSON.parse(raw) as StoredAdminSettings;
        const customRate = parsed?.preferences?.exchangeRateRwfPerUsd;

        if (typeof customRate === 'number' && Number.isFinite(customRate) && customRate > 0) {
            return customRate;
        }

        return EXCHANGE_RATE;
    } catch {
        return EXCHANGE_RATE;
    }
};

export const convertUSDtoRWF = (usd: number, rate = getExchangeRate()) => {
    return Math.round(usd * rate * 100) / 100;
};

export const convertRWFtoUSD = (rwf: number, rate = getExchangeRate()) => {
    return Math.round((rwf / rate) * 100) / 100;
};

// Round to 3 significant figures
export const roundToSignificantFigures = (num: number, figures: number = 3) => {
    if (num === 0) return 0;
    const magnitude = Math.floor(Math.log10(Math.abs(num)));
    const factor = Math.pow(10, figures - 1 - magnitude);
    return Math.round(num * factor) / factor;
};

export const formatRWF = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

type MachineRateLike = {
    dailyRate: number;
    dailyRateRwf?: number;
};

export const getRwfPrice = (machine: MachineRateLike) => {
    if (machine.dailyRateRwf && machine.dailyRateRwf > 0) {
        return machine.dailyRateRwf;
    }
    return machine.dailyRate * getExchangeRate();
};
