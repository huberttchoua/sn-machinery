import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { createApiUrl } from '../../lib/api';
import { convertUSDtoRWF, convertRWFtoUSD } from '../../utils/currency';

type FinanceRecord = {
    id: number;
    createdAt: string;
    type: 'Income' | 'Expense' | 'Profit' | string;
    category: string;
    description: string;
    amount: number;
    amountUSD?: number;
    amountRWF?: number;
    currency: string;
    status: 'Pending' | 'Approved' | 'Completed' | 'Rejected' | string;
    notes?: string;
    rental?: {
        user?: { name?: string };
        machine?: { name?: string };
        paymentMethod?: string;
    };
};

type FinanceSummary = {
    totalIncome: { USD: number; RWF: number };
    totalExpense: { USD: number; RWF: number };
    profit: { USD: number; RWF: number };
};

const FinanceManagement = () => {
    const [finances, setFinances] = useState<FinanceRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
    const [filterType, setFilterType] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'RWF'>('USD');
    const [summary, setSummary] = useState<FinanceSummary>({ 
        totalIncome: { USD: 0, RWF: 0 }, 
        totalExpense: { USD: 0, RWF: 0 }, 
        profit: { USD: 0, RWF: 0 } 
    });

    async function fetchFinances() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(createApiUrl('/api/finances'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data: unknown = await res.json();
            if (Array.isArray(data)) setFinances(data as FinanceRecord[]);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchSummary() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(createApiUrl('/api/finances/summary/overview'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data: unknown = await res.json();
            if (data && typeof data === 'object') {
                setSummary(data as FinanceSummary);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Form Data
    const [formData, setFormData] = useState({
        type: 'Income',
        category: 'Rental',
        description: '',
        amount: '',
        currency: 'USD',
        status: 'Pending',
        notes: ''
    });

    useEffect(() => {
        fetchFinances();
        fetchSummary();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        const token = localStorage.getItem('token');
        await fetch(createApiUrl(`/api/finances/${id}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchFinances();
        fetchSummary();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = editingRecord
            ? createApiUrl(`/api/finances/${editingRecord.id}`)
            : createApiUrl('/api/finances');
        const method = editingRecord ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingRecord(null);
                setFormData({
                    type: 'Income',
                    category: 'Rental',
                    description: '',
                    amount: '',
                    currency: 'USD',
                    status: 'Pending',
                    notes: ''
                });
                fetchFinances();
                fetchSummary();
            } else {
                alert('Failed to save finance record');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (record: FinanceRecord) => {
        setEditingRecord(record);
        setFormData({
            type: record.type,
            category: record.category,
            description: record.description,
            amount: record.amount.toString(),
            currency: record.currency,
            status: record.status,
            notes: record.notes || ''
        });
        setShowModal(true);
    };

    const filteredFinances = finances.filter(f => {
        const matchesSearch = f.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !filterType || f.type === filterType;
        const matchesStatus = !filterStatus || f.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getCategoryOptions = () => {
        if (formData.type === 'Expense') {
            return ['Maintenance', 'Staff', 'Operations', 'Utilities', 'Other'];
        }
        return ['Rental', 'Insurance', 'Services', 'Other'];
    };

    const handleExportXlsx = async () => {
        if (filteredFinances.length === 0) {
            alert('No finance records available to export.');
            return;
        }

        const XLSX = await import('xlsx');

        const rows = filteredFinances.map((record) => {
            const amountUSD = record.amountUSD || record.amount;
            const amountRWF = record.amountRWF || convertUSDtoRWF(record.amount);

            return {
                ID: record.id,
                Date: new Date(record.createdAt).toLocaleDateString(),
                Type: record.type,
                Category: record.category,
                Description: record.description,
                Customer: record.rental?.user?.name || 'N/A',
                Machine: record.rental?.machine?.name || 'N/A',
                PaymentMethod: record.notes?.split(': ')[1] || record.rental?.paymentMethod || 'N/A',
                AmountUSD: Number(amountUSD.toFixed(2)),
                AmountRWF: Math.round(amountRWF),
                Currency: record.currency,
                Status: record.status,
                Notes: record.notes || ''
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Records');

        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `financial-records-${date}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Header with Currency Toggle */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
                    <p className="text-gray-600 mt-1">Track payments, costs, and profits</p>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Currency Toggle */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setDisplayCurrency('USD')}
                            className={`px-4 py-2 rounded transition-colors ${
                                displayCurrency === 'USD'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            USD
                        </button>
                        <button
                            onClick={() => setDisplayCurrency('RWF')}
                            className={`px-4 py-2 rounded transition-colors ${
                                displayCurrency === 'RWF'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            RWF
                        </button>
                    </div>
                    <button
                        onClick={handleExportXlsx}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Export .xlsx
                    </button>
                    <button
                        onClick={() => {
                            setEditingRecord(null);
                            setFormData({
                                type: 'Income',
                                category: 'Rental',
                                description: '',
                                amount: '',
                                currency: 'USD',
                                status: 'Pending',
                                notes: ''
                            });
                            setShowModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        New Record
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Income</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {displayCurrency === 'USD' 
                                    ? `$${(summary.totalIncome.USD || 0).toFixed(2)}`
                                    : `RWF ${(summary.totalIncome.RWF || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {displayCurrency === 'USD' 
                                    ? `RWF ${(summary.totalIncome.RWF || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                    : `$${(summary.totalIncome.USD || 0).toFixed(2)}`
                                }
                            </p>
                        </div>
                        <TrendingUp className="text-green-600" size={32} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">
                                {displayCurrency === 'USD' 
                                    ? `$${(summary.totalExpense.USD || 0).toFixed(2)}`
                                    : `RWF ${(summary.totalExpense.RWF || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {displayCurrency === 'USD' 
                                    ? `RWF ${(summary.totalExpense.RWF || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                    : `$${(summary.totalExpense.USD || 0).toFixed(2)}`
                                }
                            </p>
                        </div>
                        <TrendingDown className="text-red-600" size={32} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Net Profit</p>
                            <p className={`text-3xl font-bold mt-2 ${(displayCurrency === 'USD' ? summary.profit.USD : summary.profit.RWF) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {displayCurrency === 'USD' 
                                    ? `$${(summary.profit.USD || 0).toFixed(2)}`
                                    : `RWF ${(summary.profit.RWF || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {displayCurrency === 'USD' 
                                    ? `RWF ${(summary.profit.RWF || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                    : `$${(summary.profit.USD || 0).toFixed(2)}`
                                }
                            </p>
                        </div>
                        <DollarSign className={`${(displayCurrency === 'USD' ? summary.profit.USD : summary.profit.RWF) >= 0 ? 'text-blue-600' : 'text-red-600'}`} size={32} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Types</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                        <option value="Profit">Profit</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Machine</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Amount ({displayCurrency})
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredFinances.length > 0 ? (
                            filteredFinances.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(record.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            record.type === 'Income' ? 'bg-green-100 text-green-800' :
                                            record.type === 'Expense' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {record.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{record.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {record.rental?.user?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {record.rental?.machine?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                            {record.notes?.split(': ')[1] || record.rental?.paymentMethod || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold">
                                        <div className="flex flex-col">
                                            {displayCurrency === 'USD' ? (
                                                <>
                                                    <span className="text-gray-900">${(record.amountUSD || record.amount).toFixed(2)}</span>
                                                    <span className="text-xs text-gray-400">RWF {(record.amountRWF || convertUSDtoRWF(record.amount)).toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-gray-900">RWF {(record.amountRWF || convertUSDtoRWF(record.amount)).toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                                                    <span className="text-xs text-gray-400">${(record.amountUSD || record.amount).toFixed(2)}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            record.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEdit(record)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(record.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                    No finance records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingRecord ? 'Edit Finance Record' : 'New Finance Record'}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                            <div className="overflow-y-auto flex-1 p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => {
                                        setFormData({ ...formData, type: e.target.value, category: 'Rental' });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                    <option value="Profit">Profit</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {getCategoryOptions().map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({formData.currency})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {formData.amount && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        ≈ {formData.currency === 'USD' 
                                            ? `RWF ${convertUSDtoRWF(parseFloat(formData.amount)).toLocaleString('en-US', {maximumFractionDigits: 0})}`
                                            : `$${convertRWFtoUSD(parseFloat(formData.amount)).toFixed(2)}`
                                        }
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="USD">USD</option>
                                    <option value="RWF">RWF</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            </div>

                            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    {editingRecord ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceManagement;
