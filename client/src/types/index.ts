export interface Machine {
    id: number;
    name: string;
    type: string;
    dailyRate: number;
    dailyRateRwf?: number;
    status: string;
    healthStatus: string;
    plateNumber: string;
    description?: string;
    imageUrl?: string;
    // Add other fields as necessary
}

export interface BookingDetails {
    startDate: string;
    endDate: string;
    total: number;
    hasInsurance: boolean;
    hasDelivery: boolean;
    hasOperator: boolean;
    insuranceCost: number;
    deliveryCost: number;
    operatorCost: number;
    paymentMethod: string;
}
