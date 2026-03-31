import { X, Calendar as CalendarIcon, Info } from 'lucide-react';
import { useState } from 'react';
import type { Machine, BookingDetails } from '../types';

const EXCHANGE_RATE = 1458.80;
const PAYMENT_METHODS = [
    { id: 'mtn-momo', label: 'MTN MoMo', icon: '📱' },
    { id: 'credit-card', label: 'Credit Card', icon: '💳' },
    { id: 'debit-card', label: 'Debit Card', icon: '💳' },
    { id: 'apple-pay', label: 'Apple Pay', icon: '🍎' },
    { id: 'google-pay', label: 'Google Pay', icon: '🔵' },
    { id: 'airtel-money', label: 'Airtel Money', icon: '📲' }
];

interface BookingModalProps {
    machine: Machine;
    onClose: () => void;
    onConfirm: (details: BookingDetails) => void;
}

export const BookingModal = ({ machine, onClose, onConfirm }: BookingModalProps) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'RWF'>('USD');
    const [hasInsurance, setHasInsurance] = useState(false);
    const [hasDelivery, setHasDelivery] = useState(false);
    const [hasOperator, setHasOperator] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>('');

    const insuranceDailyCost = 50; // per day
    const deliveryCost = 200; // flat rate
    const operatorDailyCost = 75; // per day

    const calculateTotal = () => {
        if (!startDate || !endDate) return { usd: 0, rwf: 0, breakdown: {} };
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        let total = diffDays * machine.dailyRate;
        let insurance = 0, delivery = 0, operator = 0;

        if (hasInsurance) insurance = diffDays * insuranceDailyCost;
        if (hasDelivery) delivery = deliveryCost;
        if (hasOperator) operator = diffDays * operatorDailyCost;

        total += insurance + delivery + operator;

        return {
            usd: total,
            rwf: Math.round(total * EXCHANGE_RATE * 100) / 100,
            breakdown: { machine: diffDays * machine.dailyRate, insurance, delivery, operator }
        };
    };

    const totals = calculateTotal();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="bg-secondary-50 border-b border-secondary-100 p-6 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-heading font-bold text-secondary-900">Book Machine</h3>
                        <p className="text-sm text-secondary-500 mt-1">{machine.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Currency Toggle */}
                        <div className="flex gap-1 bg-white p-1 rounded-lg border border-secondary-200">
                            <button
                                onClick={() => setDisplayCurrency('USD')}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                                    displayCurrency === 'USD'
                                        ? 'bg-secondary-900 text-white'
                                        : 'text-secondary-700 hover:bg-secondary-100'
                                }`}
                            >
                                USD
                            </button>
                            <button
                                onClick={() => setDisplayCurrency('RWF')}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                                    displayCurrency === 'RWF'
                                        ? 'bg-secondary-900 text-white'
                                        : 'text-secondary-700 hover:bg-secondary-100'
                                }`}
                            >
                                RWF
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary-200 text-secondary-400 hover:text-secondary-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="flex items-center gap-4 bg-primary-50 p-4 rounded-xl border border-primary-100 text-primary-700">
                        <Info size={20} className="flex-shrink-0" />
                        <p className="text-sm">You won't be charged until the booking is confirmed by our admin team.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary-700 block">Start Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 outline-none"
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary-700 block">End Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 outline-none"
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="border-t border-secondary-100 pt-4">
                        <h4 className="font-bold text-secondary-900 mb-3">Select Payment Method</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`p-3 rounded-lg border-2 transition-all font-medium text-sm flex items-center gap-2 ${
                                        paymentMethod === method.id
                                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                                            : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                                    }`}
                                >
                                    <span className="text-lg">{method.icon}</span>
                                    <span className="text-xs">{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-secondary-100 pt-4">
                        <h4 className="font-bold text-secondary-900 mb-3">Booking Options</h4>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-secondary-50 p-2 rounded">
                                <input
                                    type="checkbox"
                                    checked={hasInsurance}
                                    onChange={(e) => setHasInsurance(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-secondary-900">Equipment Insurance</div>
                                    <div className="text-xs text-secondary-500">
                                        {displayCurrency === 'USD' 
                                            ? `$${insuranceDailyCost}/day` 
                                            : `RWF ${Math.round(insuranceDailyCost * EXCHANGE_RATE).toLocaleString('en-US')}/day`
                                        }
                                    </div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-secondary-50 p-2 rounded">
                                <input
                                    type="checkbox"
                                    checked={hasDelivery}
                                    onChange={(e) => setHasDelivery(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-secondary-900">Delivery Service</div>
                                    <div className="text-xs text-secondary-500">
                                        {displayCurrency === 'USD' 
                                            ? `$${deliveryCost} flat rate` 
                                            : `RWF ${Math.round(deliveryCost * EXCHANGE_RATE).toLocaleString('en-US')} flat rate`
                                        }
                                    </div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer hover:bg-secondary-50 p-2 rounded">
                                <input
                                    type="checkbox"
                                    checked={hasOperator}
                                    onChange={(e) => setHasOperator(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-secondary-900">Operator Service</div>
                                    <div className="text-xs text-secondary-500">
                                        {displayCurrency === 'USD' 
                                            ? `$${operatorDailyCost}/day` 
                                            : `RWF ${Math.round(operatorDailyCost * EXCHANGE_RATE).toLocaleString('en-US')}/day`
                                        }
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                    {totals.usd > 0 && (
                        <div className="border-t border-dashed border-secondary-200 pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-secondary-500">Machine Rental</span>
                                <div className="text-right">
                                    {displayCurrency === 'USD' ? (
                                        <>
                                            <span className="font-medium block text-secondary-900">${totals.breakdown.machine?.toFixed(2) || '0.00'}</span>
                                            <span className="text-xs text-secondary-400">RWF {Math.round((totals.breakdown.machine || 0) * EXCHANGE_RATE).toLocaleString('en-US')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium block text-secondary-900">RWF {Math.round((totals.breakdown.machine || 0) * EXCHANGE_RATE).toLocaleString('en-US')}</span>
                                            <span className="text-xs text-secondary-400">${totals.breakdown.machine?.toFixed(2) || '0.00'}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {(totals.breakdown.insurance ?? 0) > 0 && (
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-secondary-500">Insurance</span>
                                    {displayCurrency === 'USD' ? (
                                        <span className="font-medium text-secondary-900">${(totals.breakdown.insurance ?? 0).toFixed(2)}</span>
                                    ) : (
                                        <span className="font-medium text-secondary-900">RWF {Math.round((totals.breakdown.insurance ?? 0) * EXCHANGE_RATE).toLocaleString('en-US')}</span>
                                    )}
                                </div>
                            )}
                            {(totals.breakdown.delivery ?? 0) > 0 && (
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-secondary-500">Delivery</span>
                                    {displayCurrency === 'USD' ? (
                                        <span className="font-medium text-secondary-900">${(totals.breakdown.delivery ?? 0).toFixed(2)}</span>
                                    ) : (
                                        <span className="font-medium text-secondary-900">RWF {Math.round((totals.breakdown.delivery ?? 0) * EXCHANGE_RATE).toLocaleString('en-US')}</span>
                                    )}
                                </div>
                            )}
                            {(totals.breakdown.operator ?? 0) > 0 && (
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-secondary-500">Operator</span>
                                    {displayCurrency === 'USD' ? (
                                        <span className="font-medium text-secondary-900">${(totals.breakdown.operator ?? 0).toFixed(2)}</span>
                                    ) : (
                                        <span className="font-medium text-secondary-900">RWF {Math.round((totals.breakdown.operator ?? 0) * EXCHANGE_RATE).toLocaleString('en-US')}</span>
                                    )}
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold text-secondary-900 border-t border-secondary-100 pt-2 mt-2">
                                <span>Total Estimate</span>
                                <div className="text-right">
                                    {displayCurrency === 'USD' ? (
                                        <>
                                            <span className="block">${totals.usd.toFixed(2)}</span>
                                            <span className="text-xs font-normal text-secondary-500">RWF {totals.rwf.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="block">RWF {totals.rwf.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                                            <span className="text-xs font-normal text-secondary-500">${totals.usd.toFixed(2)}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-secondary-100 bg-secondary-50 flex gap-3 justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold text-secondary-600 hover:bg-secondary-200 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (!paymentMethod) {
                                alert('Please select a payment method');
                                return;
                            }
                            onConfirm({
                                startDate,
                                endDate,
                                total: totals.usd,
                                hasInsurance,
                                hasDelivery,
                                hasOperator,
                                insuranceCost: totals.breakdown.insurance || 0,
                                deliveryCost: totals.breakdown.delivery || 0,
                                operatorCost: totals.breakdown.operator || 0,
                                paymentMethod
                            });
                        }}
                        disabled={totals.usd === 0 || !paymentMethod}
                        className="px-5 py-2.5 rounded-xl font-bold bg-secondary-900 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-secondary-900/10 transition-all"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};
