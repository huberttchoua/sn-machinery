import { useState, useEffect } from 'react';

import { MachineCard } from '../../components/MachineCard';
import { BookingModal } from '../../components/BookingModal';
import { Search, SlidersHorizontal } from 'lucide-react';
import { createApiUrl } from '../../lib/api';
import type { Machine, BookingDetails } from '../../types';

const EXCHANGE_RATE = 1458.80;

const MachineCatalog = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'RWF'>('USD');

    async function fetchMachines() {
        try {
            const res = await fetch(createApiUrl('/api/machines'));
            const data: unknown = await res.json();
            if (Array.isArray(data)) setMachines(data as Machine[]);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchMachines();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

    const categories = ['All', 'Excavator', 'Bulldozer', 'Loader', 'Aerial Lift'];

    const filteredMachines = machines.filter(m =>
        (selectedCategory === 'All' || m.type.includes(selectedCategory)) &&
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRent = (machine: Machine) => {
        setSelectedMachine(machine);
    };

    const handleBookingConfirm = async (details: BookingDetails) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to book a machine');
            return;
        }

        if (!selectedMachine) {
            alert('No machine selected');
            return;
        }

        try {
            const res = await fetch(createApiUrl('/api/rentals'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    machineId: selectedMachine.id,
                    startDate: details.startDate,
                    endDate: details.endDate,
                    totalCost: details.total,
                    hasInsurance: details.hasInsurance || false,
                    hasDelivery: details.hasDelivery || false,
                    hasOperator: details.hasOperator || false,
                    insuranceCost: details.insuranceCost || 0,
                    deliveryCost: details.deliveryCost || 0,
                    operatorCost: details.operatorCost || 0,
                    paymentMethod: details.paymentMethod || 'credit-card'
                })
            });

            if (res.ok) {
                alert('Booking request sent successfully! Waiting for admin approval.');
                setSelectedMachine(null);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to book booking');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to server');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Machine Catalog</h1>
                    <p className="text-gray-500 mt-2">Browse our high-quality fleet available for rent.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Currency Toggle */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setDisplayCurrency('USD')}
                            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                                displayCurrency === 'USD'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            USD
                        </button>
                        <button
                            onClick={() => setDisplayCurrency('RWF')}
                            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                                displayCurrency === 'RWF'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            RWF
                        </button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none w-64 transition-all"
                        />
                    </div>
                    <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 transition-all">
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMachines.map(machine => (
                    <MachineCard
                        key={machine.id}
                        machine={machine}
                        onRent={() => handleRent(machine)}
                        displayCurrency={displayCurrency}
                        exchangeRate={EXCHANGE_RATE}
                    />
                ))}
            </div>

            {filteredMachines.length === 0 && (
                <div className="text-center py-20">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No machines found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Booking Modal */}
            {selectedMachine && (
                <BookingModal
                    machine={selectedMachine}
                    onClose={() => setSelectedMachine(null)}
                    onConfirm={handleBookingConfirm}
                />
            )}
        </div>
    );
};

export default MachineCatalog;
