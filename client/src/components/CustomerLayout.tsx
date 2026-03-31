import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Phone, Home, Truck, LogOut, Bell } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n-context';
import LanguageSelector from './LanguageSelector';

type NotificationItem = {
    id: string | number;
    isRead: boolean;
    message: string;
    createdAt: string;
};

export const CustomerLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const location = useLocation();
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async (): Promise<void> => {
        const token = localStorage.getItem('token');
        const url = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/notifications` : 'http://127.0.0.1:3001/api/notifications';

        for (let attempt = 1; attempt <= 2; attempt++) {
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
                return;
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
                if (attempt < 2) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                } else {
                    setNotifications([]);
                }
            }
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchNotifications();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [fetchNotifications]);

    const { t } = useTranslation();

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { name: t('home'), path: '/customer', icon: Home },
        { name: t('machines'), path: '/customer/machines', icon: Truck },
        { name: t('rentals'), path: '/customer/rentals', icon: ShoppingBag },
        { name: t('contact'), path: '/customer/contact', icon: Phone },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-secondary-50 font-sans">
            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-secondary-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/customer" className="flex-shrink-0 flex items-center gap-2">
                                <div className="bg-primary-500 rounded-lg p-1.5 shadow-md shadow-primary-500/20">
                                    <Truck className="h-6 w-6 text-white" />
                                </div>
                                <span className="font-heading font-bold text-xl text-secondary-900 tracking-tight">SN Machinery</span>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex md:items-center md:space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                                        }`}
                                >
                                    <link.icon size={16} />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                            <div className="h-6 w-px bg-secondary-200 mx-4" />

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
                                    className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-full transition-colors relative"
                                >
                                    <Bell size={20} />
                                    {notifications.some(n => !n.isRead) && (
                                        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-secondary-100 py-1 overflow-hidden z-50">
                                        <div className="px-4 py-2 border-b border-secondary-50 flex justify-between items-center">
                                            <p className="text-sm font-bold text-secondary-900">{t('notifications')}</p>
                                            <button onClick={() => fetchNotifications()} className="text-xs text-primary-600 hover:underline">Refresh</button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-secondary-500 text-sm">No notifications</div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div key={notif.id} className={`p-3 border-b border-secondary-50 last:border-0 hover:bg-secondary-50 ${!notif.isRead ? 'bg-primary-50/50' : ''}`}>
                                                        <p className="text-sm text-secondary-800">{notif.message}</p>
                                                        <p className="text-xs text-secondary-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-full transition-colors focus:ring-2 focus:ring-primary-100"
                                >
                                    <User size={20} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-secondary-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-2 border-b border-secondary-50">
                                            <p className="text-sm font-bold text-secondary-900">{t('myAccount')}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            {t('signOut')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-secondary-100 animate-in slide-in-from-top-4 duration-200">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                                        }`}
                                >
                                    <link.icon size={18} />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                            <div className="border-t border-secondary-100 pt-2 mt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
                <Outlet />
            </main>
        </div>
    );
};
