import { Calendar, CreditCard, Download, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PaymentModal } from '../../components/PaymentModal';
import { createApiUrl } from '../../lib/api';

type RentalApi = {
    id: number;
    machine: { name: string };
    startDate: string;
    endDate: string;
    status: string;
    totalCost: number;
};

type RentalView = {
    id: string;
    machineName: string;
    startDate: string;
    endDate: string;
    status: string;
    totalCost: number;
    paymentStatus: 'Paid' | 'Pending';
};


const MyRentals = () => {
    const [rentals, setRentals] = useState<RentalView[]>([]);

    async function fetchRentals() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(createApiUrl('/api/rentals/my'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data: unknown = await res.json();
            if (Array.isArray(data)) {
                // Transform data to match UI
                const formatted: RentalView[] = (data as RentalApi[]).map((r) => ({
                    id: `R-${r.id}`,
                    machineName: r.machine.name,
                    startDate: new Date(r.startDate).toISOString().split('T')[0],
                    endDate: new Date(r.endDate).toISOString().split('T')[0],
                    status: r.status,
                    totalCost: r.totalCost,
                    paymentStatus: r.status === 'Active' || r.status === 'Completed' ? 'Paid' : 'Pending' // Simple logic for now
                }));
                setRentals(formatted);
            }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchRentals();
    }, []);

    const [paymentModalData, setPaymentModalData] = useState<{ id: string, amount: number } | null>(null);

    const handlePayClick = (id: string, amount: number) => {
        setPaymentModalData({ id, amount });
    };

    const handlePaymentSuccess = () => {
        setPaymentModalData(null);
        alert('Payment processed successfully!');
        // Update state in real app
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Rentals</h1>
                <p className="text-gray-500 mt-2">Manage your bookings and payments.</p>
            </div>

            <div className="space-y-4">
                {rentals.map((rental) => (
                    <div key={rental.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Info */}
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${rental.status === 'Active' ? 'bg-green-100 text-green-600' :
                                rental.status === 'Upcoming' ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-gray-900">{rental.machineName}</h3>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${rental.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        rental.status === 'Upcoming' ? 'bg-blue-50 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {rental.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <Calendar size={14} />
                                    {rental.startDate} — {rental.endDate}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 font-mono">{rental.id}</p>
                            </div>
                        </div>

                        {/* Cost & Action */}
                        <div className="flex items-center gap-6 md:border-l md:border-gray-100 md:pl-6">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Cost</p>
                                <p className="text-xl font-bold text-gray-900">${rental.totalCost.toLocaleString()}</p>
                                {rental.paymentStatus === 'Paid' ? (
                                    <p className="text-xs text-green-600 font-bold flex items-center justify-end gap-1">
                                        Paid <CreditCard size={12} />
                                    </p>
                                ) : (
                                    <p className="text-xs text-orange-500 font-bold">Payment Due</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                {rental.paymentStatus === 'Pending' && (
                                    <button
                                        onClick={() => handlePayClick(rental.id, rental.totalCost)}
                                        className="bg-gray-900 hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        Pay Now
                                    </button>
                                )}
                                {rental.paymentStatus === 'Paid' && (
                                    <button className="border border-gray-200 hover:bg-gray-50 text-gray-600 px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                        <Download size={16} /> Invoice
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {paymentModalData && (
                <PaymentModal
                    amount={paymentModalData.amount}
                    onClose={() => setPaymentModalData(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default MyRentals;
