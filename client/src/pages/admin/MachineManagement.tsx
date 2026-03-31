import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Truck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { roundToSignificantFigures, getExchangeRate } from '../../utils/currency';
import { createApiUrl } from '../../lib/api';
import type { Machine } from '../../types';

type AppUser = {
    id: number;
    name: string;
    email: string;
    role: string;
};

const MachineManagement = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [searchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        type: 'Excavator',
        dailyRate: '',
        dailyRateRwf: '',
        healthStatus: 'Excellent',
        plateNumber: '',
        description: '',
        imageUrl: '',
        status: 'Available'
    });

    // Rental Assignment State
    const [showRentModal, setShowRentModal] = useState(false);
    const [rentingMachine, setRentingMachine] = useState<Machine | null>(null);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [rentalData, setRentalData] = useState({
        userId: '',
        startDate: '',
        endDate: '',
        totalCost: 0
    });

    async function fetchMachines() {
        try {
            const res = await fetch(createApiUrl('/api/machines'));
            const data: unknown = await res.json();
            if (Array.isArray(data)) setMachines(data as Machine[]);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchUsers() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(createApiUrl('/api/users'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data: unknown = await res.json();
            if (Array.isArray(data)) setUsers(data as AppUser[]);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchMachines();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this machine?')) return;
        const token = localStorage.getItem('token');
        await fetch(createApiUrl(`/api/machines/${id}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchMachines();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = editingMachine ? createApiUrl(`/api/machines/${editingMachine.id}`) : createApiUrl('/api/machines');
        const method = editingMachine ? 'PUT' : 'POST';

        const data = new FormData();
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('dailyRate', formData.dailyRate);
        data.append('dailyRateRwf', formData.dailyRateRwf);
        data.append('healthStatus', formData.healthStatus);
        data.append('plateNumber', formData.plateNumber);
        data.append('description', formData.description);
        data.append('status', formData.status);

        // If there's a file, append it. 
        // If not, and we have an image URL from text input (that hasn't been replaced by a file), we send it.
        // However, my backend logic prioritizes 'image' file over 'imageUrl' in body.
        // If we are editing and didn't change the image, we might not want to send anything for image so it stays same?
        // Actually the backend explicitly looks for `req.file`. If not present it uses `imageUrl` from body.

        if (imageFile) {
            data.append('image', imageFile);
        } else {
            data.append('imageUrl', formData.imageUrl);
        }

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type header when sending FormData! Fetch sets it automatically with boundary.
                },
                body: data
            });

            if (res.ok) {
                setShowModal(false);
                setEditingMachine(null);
                resetForm();
                fetchMachines();
            } else {
                alert('Failed to save machine');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setImageFile(null);
        setFormData({
            name: '',
            type: 'Excavator',
            dailyRate: '',
            dailyRateRwf: '',
            healthStatus: 'Excellent',
            plateNumber: '',
            description: '',
            imageUrl: '',
            status: 'Available'
        });
    };

    const openEdit = (machine: Machine) => {
        setEditingMachine(machine);
        setImageFile(null);
        setFormData({
            name: machine.name,
            type: machine.type,
            dailyRate: machine.dailyRate !== undefined ? String(machine.dailyRate) : '',
            dailyRateRwf: machine.dailyRateRwf !== undefined ? String(machine.dailyRateRwf) : '',
            healthStatus: machine.healthStatus,
            plateNumber: machine.plateNumber,
            description: machine.description || '',
            imageUrl: machine.imageUrl || '',
            status: machine.status
        });
        setShowModal(true);
    };

    const openRentModal = (machine: Machine) => {
        setRentingMachine(machine);
        fetchUsers();
        setRentalData({ userId: '', startDate: '', endDate: '', totalCost: 0 });
        setShowRentModal(true);
    };

    const calculateCost = () => {
        if (!rentalData.startDate || !rentalData.endDate || !rentingMachine) return 0;
        const start = new Date(rentalData.startDate);
        const end = new Date(rentalData.endDate);
        const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        return diffDays * rentingMachine.dailyRate;
    };

    const handleRentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const cost = calculateCost();

        if (!rentingMachine) {
            alert('No machine selected for rental');
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
                    machineId: rentingMachine.id,
                    userId: rentalData.userId,
                    startDate: rentalData.startDate,
                    endDate: rentalData.endDate,
                    totalCost: cost,
                    status: 'Active' // Create as Active immediately
                })
            });

            if (res.ok) {
                setShowRentModal(false);
                setRentingMachine(null);
                fetchMachines(); // Update status
                alert('Machine rented successfully. View details in Rental Management.');
            } else {
                alert('Failed to rent machine');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredMachines = machines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Machine Management</h1>
                    <p className="text-gray-500 mt-2">Manage fleet, pricing, and health status.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingMachine(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
                >
                    <Plus size={20} /> Add Machine
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMachines.map(machine => (
                    <div key={machine.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
                        <div className="relative h-48 bg-gray-100">
                            {machine.imageUrl ? (
                                <img src={machine.imageUrl} className="w-full h-full object-cover" alt={machine.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Truck size={48} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${machine.status === 'Available' ? 'bg-green-500' :
                                    machine.status === 'Rented' ? 'bg-blue-500' : 'bg-red-500'
                                    }`}>
                                    {machine.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{machine.name}</h3>
                                    <p className="text-sm text-gray-500">{machine.type}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                                <div>
                                    <span className="text-gray-400 block text-xs uppercase font-bold">Price (USD)</span>
                                    <span className="font-bold text-gray-900">${machine.dailyRate}/day</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs uppercase font-bold">Price (RWF)</span>
                                    <span className="font-bold text-gray-900">{machine.dailyRateRwf?.toLocaleString()} RWF</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Info size={14} className="text-blue-500" />
                                    <span className="truncate">{machine.plateNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <AlertTriangle size={14} className={
                                        machine.healthStatus === 'Excellent' ? 'text-green-500' :
                                            machine.healthStatus === 'Critical' ? 'text-red-500' : 'text-yellow-500'
                                    } />
                                    <span className="font-medium text-gray-700">{machine.healthStatus} Condition</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-2">
                                {machine.status === 'Available' && (
                                    <button
                                        onClick={() => openRentModal(machine)}
                                        className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Assign Rental
                                    </button>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(machine)}
                                        className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(machine.id)}
                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit / Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="flex-shrink-0 p-8 border-b border-gray-100">
                            <h2 className="text-2xl font-bold">{editingMachine ? 'Edit Machine' : 'Add New Machine'}</h2>
                        </div>
                        <form id="machineForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 overflow-y-auto flex-1">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Machine Name</label>
                                <input required className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                <select className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="Excavator">Excavator</option>
                                    <option value="Bulldozer">Bulldozer</option>
                                    <option value="Loader">Loader</option>
                                    <option value="Aerial Lift">Aerial Lift</option>
                                    <option value="Compactor">Compactor</option>
                                    <option value="Truck">Truck</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                                <select className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Available">Available</option>
                                    <option value="Rented">Rented</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Plate / Serial Number</label>
                                <input required className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.plateNumber} onChange={e => setFormData({ ...formData, plateNumber: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Health Status</label>
                                <select className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.healthStatus} onChange={e => setFormData({ ...formData, healthStatus: e.target.value })}>
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Daily Rate (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full pl-8 px-4 py-2 rounded-xl border border-gray-200"
                                        value={formData.dailyRate}
                                        onChange={e => {
                                            const val = e.target.value;
                                            // update USD field
                                            setFormData((prev) => ({ ...prev, dailyRate: val }));
                                            // calculate and update RWF immediately with 3 significant figures
                                            if (val === '' || isNaN(Number(val))) {
                                                setFormData((prev) => ({ ...prev, dailyRateRwf: '' }));
                                            } else {
                                                const rwf = roundToSignificantFigures(Number(val) * getExchangeRate(), 3);
                                                setFormData((prev) => ({ ...prev, dailyRateRwf: String(rwf) }));
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Daily Rate (RWF)</label>
                                <div className="relative">
                                    <span className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">RWF</span>
                                    <input required type="number" step="100" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.dailyRateRwf} onChange={e => setFormData({ ...formData, dailyRateRwf: e.target.value })} />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Machine Image</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                            {imageFile ? (
                                                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                                            ) : formData.imageUrl ? (
                                                <img src={formData.imageUrl} alt="Current" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Truck size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setImageFile(e.target.files[0]);
                                                    }
                                                }}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                                            />
                                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">OR Enter URL</div>
                                            <input
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                                value={formData.imageUrl}
                                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                placeholder="https://example.com/image.jpg"
                                                disabled={!!imageFile}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description / Credentials</label>
                                <textarea rows={3} className="w-full px-4 py-2 rounded-xl border border-gray-200 resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Engine details, insurance info, etc." />
                            </div>
                        </form>
                        <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 p-8 flex gap-3">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                            <button type="submit" form="machineForm" className="flex-1 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800">Save Machine</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rent Out Modal */}
            {showRentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRentModal(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">Assign Rental</h2>
                        <p className="text-gray-500 mb-4">Rent out <strong>{rentingMachine?.name}</strong> to a customer.</p>

                        <form onSubmit={handleRentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Select Customer</label>
                                <select required className="w-full px-4 py-2 rounded-xl border border-gray-200" value={rentalData.userId} onChange={e => setRentalData({ ...rentalData, userId: e.target.value })}>
                                    <option value="">-- Choose User --</option>
                                    {users.filter(u => u.role === 'Customer').map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                                    <input required type="date" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={rentalData.startDate} onChange={e => setRentalData({ ...rentalData, startDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                                    <input required type="date" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={rentalData.endDate} onChange={e => setRentalData({ ...rentalData, endDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-600">Total Est. Cost</span>
                                <span className="text-2xl font-bold text-green-600">${calculateCost().toLocaleString()}</span>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowRentModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                                <button className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700">Confirm Rental</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MachineManagement;
