import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Search, Shield, User } from 'lucide-react';
import { createApiUrl } from '../../lib/api';

type UserRecord = {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    role: 'Customer' | 'Employee' | 'Admin' | string;
};

const UserManagement = () => {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

    // Form Stats
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'Customer'
    });

    async function fetchUsers() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(createApiUrl('/api/users'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data: unknown = await res.json();
            if (Array.isArray(data)) setUsers(data as UserRecord[]);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        const token = localStorage.getItem('token');
        await fetch(createApiUrl(`/api/users/${id}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchUsers();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = editingUser ? createApiUrl(`/api/users/${editingUser.id}`) : createApiUrl('/api/users');
        const method = editingUser ? 'PUT' : 'POST';

        // Remove password if empty during edit
        const payload: {
            name: string;
            email: string;
            phoneNumber: string;
            role: string;
            password?: string;
        } = {
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            role: formData.role,
        };

        if (!editingUser || formData.password) {
            payload.password = formData.password;
        }

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingUser(null);
                setFormData({ name: '', email: '', phoneNumber: '', password: '', role: 'Customer' });
                fetchUsers();
            } else {
                alert('Failed to save user');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (user: UserRecord) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: '', // Don't fill password
            role: user.role
        });
        setShowModal(true);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-2">Manage customer and staff accounts.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ name: '', email: '', phoneNumber: '', password: '', role: 'Customer' });
                        setShowModal(true);
                    }}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
                >
                    <Plus size={20} /> Add User
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="flex-1 outline-none text-gray-700"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'Employee' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {user.role === 'Admin' ? <Shield size={12} /> : <User size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 font-medium">
                                        {user.phoneNumber}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(user)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                <input required className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input required type="email" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                                <input required type="tel" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                                <select className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="Customer">Customer</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Password {editingUser && '(Leave blank to keep current)'}</label>
                                <input type="password" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                                <button className="flex-1 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800">Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
