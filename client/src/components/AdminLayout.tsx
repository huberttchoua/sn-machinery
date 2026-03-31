import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Calendar, Settings, LogOut, Bell, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n-context';
import LanguageSelector from './LanguageSelector';

type NotificationItem = {
    id: string | number;
    isRead: boolean;
    message: string;
    createdAt: string;
};

const Sidebar = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 h-full z-10">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    SN Machinery
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                    <LayoutDashboard size={20} />
                    <span>{t('dashboard')}</span>
                </Link>
                <Link to="/admin/machines" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                    <Truck size={20} />
                    <span>{t('machines')}</span>
                </Link>
                <Link to="/admin/rentals" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                    <Calendar size={20} />
                    <span>{t('rentals')}</span>
                </Link>
                <Link to="/admin/users" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                    <Users size={20} />
                    <span>{t('userManagement')}</span>
                </Link>
                <Link to="/admin/staff" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                    <Users size={20} />
                    <span>{t('staffDrivers')}</span>
                </Link>
                <Link to="/admin/finances" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                    <TrendingUp size={20} />
                    <span>{t('finances')}</span>
                </Link>
                <Link to="/admin/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
                    <Settings size={20} />
                    <span>{t('settings')}</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-colors"
                >
                    <LogOut size={20} />
                    <span>{t('logout')}</span>
                </button>
            </div>
        </div>
    );
};

export const AdminLayout = () => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const { t } = useTranslation();
    
    const fetchNotifications = useCallback(async (attempt = 1): Promise<void> => {
        const token = localStorage.getItem('token');
        const url = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/notifications` : 'http://127.0.0.1:3001/api/notifications';
        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include'
            });
            if (!res.ok) {
                console.error('Notifications fetch failed:', res.status, res.statusText);
                setNotifications([]);
                return;
            }
            const data: unknown = await res.json();
            if (Array.isArray(data)) {
                setNotifications(data as NotificationItem[]);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // retry once after short delay (useful for intermittent dev server restarts)
            if (attempt < 2) {
                setTimeout(() => fetchNotifications(attempt + 1), 500);
            } else {
                setNotifications([]);
            }
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans pl-64">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto relative">
                {/* Admin Header with Notifications */}
                <div className="flex justify-end mb-8 items-center gap-4">
                    <div className="hidden md:block">
                        <LanguageSelector />
                    </div>
                    {/* Notification Bell */}
                    <div className="relative mr-4">
                        <button
                            onClick={() => {
                                setIsNotificationsOpen(!isNotificationsOpen);
                                if (!isNotificationsOpen) fetchNotifications();
                            }}
                            className="p-3 bg-white text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all shadow-sm border border-gray-100 relative"
                        >
                            <Bell size={20} />
                            {notifications.some(n => !n.isRead) && (
                                <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden z-50">
                                <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                                    <p className="text-sm font-bold text-gray-900">{t('notifications')}</p>
                                    <button onClick={() => fetchNotifications()} className="text-xs text-blue-600 hover:underline">Refresh</button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className={`p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50/50' : ''}`}>
                                                <p className="text-sm text-gray-800">{notif.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Outlet />
            </main>
        </div>
    );
};
