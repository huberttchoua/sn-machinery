import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, Calendar, User, FileText } from 'lucide-react';
import { createApiUrl } from '../../lib/api';

type RentalRecord = {
    id: number;
    status: string;
    totalCost?: number;
    startDate: string;
    endDate: string;
    hasInsurance?: boolean;
    hasDelivery?: boolean;
    hasOperator?: boolean;
    paymentMethod?: string;
    user?: { name?: string; email?: string };
    machine?: { name?: string; plateNumber?: string };
};

const RentalManagement = () => {
    const [rentals, setRentals] = useState<RentalRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    async function fetchRentals() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(createApiUrl('/api/rentals'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data: unknown = await res.json();
            if (Array.isArray(data)) setRentals(data as RentalRecord[]);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchRentals();
    }, []);

    const handleStatusUpdate = async (id: number, status: string) => {
        if (!confirm(`Are you sure you want to mark this rental as ${status}?`)) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(createApiUrl(`/api/rentals/${id}/status`), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                fetchRentals();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredRentals = rentals.filter(r =>
        (filterStatus === 'All' || r.status === filterStatus) &&
        (r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.machine?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Completed': return 'bg-blue-100 text-blue-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rental Management</h1>
                    <p className="text-gray-500 mt-2">Manage bookings, approvals, and returns.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by customer or machine..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {['All', 'Pending', 'Active', 'Completed', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filterStatus === status
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Rental Info</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRentals.map(rental => (
                                <tr key={rental.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{rental.machine?.name || 'Unknown Machine'}</div>
                                        <div className="text-sm text-gray-500">{rental.machine?.plateNumber}</div>
                                        <div className="text-xs text-blue-600 font-bold mt-1">${rental.totalCost?.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            {(rental.hasInsurance || rental.hasDelivery || rental.hasOperator || rental.paymentMethod) && (
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                    {rental.hasInsurance && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Insurance</span>}
                                                    {rental.hasDelivery && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Delivery</span>}
                                                    {rental.hasOperator && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Operator</span>}
                                                    {rental.paymentMethod && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs capitalize">{rental.paymentMethod.replace('-', ' ')}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <div>
                                                <div className="font-medium text-gray-900">{rental.user?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{rental.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={16} />
                                            <span>
                                                {new Date(rental.startDate).toLocaleDateString()} — {new Date(rental.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${getStatusColor(rental.status)}`}>
                                            {rental.status === 'Pending' ? <Clock size={12} /> :
                                                rental.status === 'Active' ? <CheckCircle size={12} /> :
                                                    rental.status === 'Cancelled' ? <XCircle size={12} /> :
                                                        <FileText size={12} />}
                                            {rental.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {rental.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(rental.id, 'Active')}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(rental.id, 'Cancelled')}
                                                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {rental.status === 'Active' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(rental.id, 'Completed')}
                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                                >
                                                    Mark Returned
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRentals.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No rentals found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RentalManagement;
