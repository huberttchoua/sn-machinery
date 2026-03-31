import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, User, Truck, FilePlus, RotateCw } from 'lucide-react';
import { createApiUrl } from '../../lib/api';

type StaffTask = {
    id: number;
    title: string;
    status: string;
};

type StaffMember = {
    id: number;
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
    licenseNumber?: string;
    status: string;
    tasks?: StaffTask[];
};

type RentalNeedingDriver = {
    id: number;
    status: string;
    driverId?: number | null;
    user?: { name?: string };
    machine?: { name?: string };
};

const StaffManagement = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [rentals, setRentals] = useState<RentalNeedingDriver[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [formData, setFormData] = useState({
        name: '', role: 'Driver', phoneNumber: '', email: '', licenseNumber: ''
    });
    const [taskData, setTaskData] = useState({ title: '', description: '' });
    const [assignData, setAssignData] = useState({ rentalId: '' });

    async function fetchStaff() {
        const token = localStorage.getItem('token');
        const res = await fetch(createApiUrl('/api/staff'), { headers: { 'Authorization': `Bearer ${token}` } });
        const data: unknown = await res.json();
        if (Array.isArray(data)) {
            setStaff(data as StaffMember[]);
        } else {
            setStaff([]);
        }
    }

    async function fetchActiveRentals() {
        const token = localStorage.getItem('token');
        const res = await fetch(createApiUrl('/api/rentals'), { headers: { 'Authorization': `Bearer ${token}` } });
        const data: unknown = await res.json();
        if (Array.isArray(data)) {
            const active = (data as RentalNeedingDriver[]).filter((r) => r.status === 'Active' && !r.driverId);
            setRentals(active);
        } else {
            setRentals([]);
        }
    }

    useEffect(() => {
        fetchStaff();
        fetchActiveRentals();

        // Auto-refresh every 10 seconds to sync driver status changes from other pages
        const interval = setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            fetchStaff();
            fetchActiveRentals();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchStaff();
        await fetchActiveRentals();
        setIsRefreshing(false);
    };

    const handleSaveStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = selectedStaff ? createApiUrl(`/api/staff/${selectedStaff.id}`) : createApiUrl('/api/staff');
        const method = selectedStaff ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });

        setShowModal(false);
        fetchStaff();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete staff member?')) return;
        const token = localStorage.getItem('token');
        await fetch(createApiUrl(`/api/staff/${id}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchStaff();
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff) return;
        const token = localStorage.getItem('token');
        await fetch(createApiUrl('/api/staff/tasks'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ...taskData, staffId: selectedStaff.id })
        });
        setShowTaskModal(false);
        fetchStaff();
    };

    const handleAssignDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff) return;
        const token = localStorage.getItem('token');
        await fetch(createApiUrl(`/api/staff/assign-driver/${assignData.rentalId}`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ driverId: selectedStaff.id })
        });
        setShowAssignModal(false);
        fetchStaff();
        fetchActiveRentals();
    };

    const handleRetrieveDriver = async (id: number) => {
        if (!confirm('Retrieve this driver from site operation? This will unassign them from their active rental.')) return;
        const token = localStorage.getItem('token');
        const res = await fetch(createApiUrl(`/api/staff/retrieve/${id}`), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) return alert(data.error || 'Failed to retrieve driver');
        alert(data.message || 'Driver retrieved');
        fetchStaff();
        fetchActiveRentals();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff & Drivers</h1>
                    <p className="text-gray-500 mt-2">Manage team, assign tasks, and dispatch drivers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="bg-gray-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-600 disabled:bg-gray-400"
                    >
                        <RotateCw size={20} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <button
                        onClick={() => { setSelectedStaff(null); setFormData({ name: '', role: 'Driver', phoneNumber: '', email: '', licenseNumber: '' }); setShowModal(true); }}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Staff
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(member => (
                    <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                                    <p className="text-sm text-gray-500">{member.role}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${member.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>{member.status}</span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-6">
                            <p>📞 {member.phoneNumber}</p>
                            {member.role === 'Driver' && <p>🪪 License: {member.licenseNumber || 'N/A'}</p>}
                        </div>

                        {/* Tasks Section */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Active Tasks</h4>
                            {member.tasks && member.tasks.length > 0 ? (
                                <div className="space-y-2">
                                    {member.tasks.filter((t) => t.status !== 'Completed').map((task) => (
                                        <div key={task.id} className="bg-gray-50 p-2 rounded-lg text-xs flex justify-between">
                                            <span>{task.title}</span>
                                            <span className="text-blue-600 font-bold">{task.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-xs text-gray-400 italic">No active tasks</p>}
                        </div>

                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                            {member.role === 'Driver' && member.status === 'Available' && (
                                <button
                                    onClick={() => { setSelectedStaff(member); setAssignData({ rentalId: '' }); setShowAssignModal(true); }}
                                    className="bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <Truck size={16} /> Assign to Rental
                                </button>
                            )}
                            {member.role === 'Driver' && member.status === 'Occupied' && (
                                <button
                                    onClick={() => handleRetrieveDriver(member.id)}
                                    className="bg-red-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-700 flex items-center justify-center gap-2"
                                >
                                    <User size={16} /> Retrieve from Site
                                </button>
                            )}
                            <button
                                onClick={() => { setSelectedStaff(member); setTaskData({ title: '', description: '' }); setShowTaskModal(true); }}
                                className="bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 flex items-center justify-center gap-2"
                            >
                                <FilePlus size={16} /> Assign Task
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => { setSelectedStaff(member); setFormData({ name: member.name, role: member.role, phoneNumber: member.phoneNumber, email: member.email, licenseNumber: member.licenseNumber ?? '' }); setShowModal(true); }} className="flex-1 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-100"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(member.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg p-8 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{selectedStaff ? 'Edit Staff' : 'Add New Staff'}</h2>
                        <form onSubmit={handleSaveStaff} className="space-y-4">
                            <input required placeholder="Full Name" className="w-full px-4 py-2 border rounded-xl" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <select className="w-full px-4 py-2 border rounded-xl" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <option value="Driver">Driver</option>
                                <option value="Mechanic">Mechanic</option>
                                <option value="Support">Support</option>
                            </select>
                            <input required placeholder="Phone Number" className="w-full px-4 py-2 border rounded-xl" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                            <input placeholder="Email (Optional)" className="w-full px-4 py-2 border rounded-xl" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            {formData.role === 'Driver' && (
                                <input placeholder="License Number" className="w-full px-4 py-2 border rounded-xl" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
                            )}
                            <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl mt-2">Save Staff Member</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTaskModal(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg p-8 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Assign Task to {selectedStaff?.name}</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <input required placeholder="Task Title" className="w-full px-4 py-2 border rounded-xl" value={taskData.title} onChange={e => setTaskData({ ...taskData, title: e.target.value })} />
                            <textarea placeholder="Description" className="w-full px-4 py-2 border rounded-xl" value={taskData.description} onChange={e => setTaskData({ ...taskData, description: e.target.value })} />
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-2">Assign Task</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Driver Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg p-8 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Assign {selectedStaff?.name} to Rental</h2>
                        <p className="text-sm text-gray-500 mb-4">Select an active rental that requires a driver.</p>
                        <form onSubmit={handleAssignDriver} className="space-y-4">
                            <select required className="w-full px-4 py-2 border rounded-xl" value={assignData.rentalId} onChange={e => setAssignData({ ...assignData, rentalId: e.target.value })}>
                                <option value="">-- Select Rental --</option>
                                {rentals.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.machine?.name} (Rented by {r.user?.name})
                                    </option>
                                ))}
                            </select>
                            {rentals.length === 0 && <p className="text-red-500 text-sm">No active rentals need drivers.</p>}
                            <button disabled={rentals.length === 0} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl mt-2 disabled:bg-gray-300">Confirm Assignment</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
