import { Link, Outlet, useLocation } from 'react-router-dom';
import { Truck, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n-context';
import LanguageSelector from './LanguageSelector';

export const PublicLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const isActive = (path: string) => location.pathname === path;

    const { t } = useTranslation();

    const navLinks = [
        { name: t('home'), path: '/' },
        { name: t('machines'), path: '/machines' },
        { name: t('services'), path: '/services' },
        { name: t('about'), path: '/about' },
        { name: t('contact'), path: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-secondary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-500 text-white p-2 rounded-xl shadow-lg shadow-primary-500/20">
                                <Truck size={24} />
                            </div>
                            <span className="text-2xl font-heading font-bold text-secondary-900 tracking-tight">SN Machinery</span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`font-medium transition-colors ${isActive(link.path)
                                        ? 'text-primary-600'
                                        : 'text-secondary-600 hover:text-primary-600'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <LanguageSelector />
                            <Link to="/login" className="text-secondary-900 font-bold hover:text-primary-600 transition-colors">{t('login')}</Link>
                            <Link to="/register" className="bg-primary-500 text-white px-5 py-2.5 rounded-full font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20">
                                {t('getStarted')}
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-secondary-100">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-secondary-100 flex flex-col gap-2 p-2">
                                <Link to="/login" className="w-full text-center text-secondary-900 font-bold hover:text-primary-600 transition-colors py-2">{t('login')}</Link>
                                <Link to="/register" className="w-full text-center bg-primary-500 text-white px-5 py-2.5 rounded-full font-bold hover:bg-primary-600 transition-all">
                                    {t('getStarted')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-20">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-secondary-50 py-12 border-t border-secondary-200">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="grid md:grid-cols-3 gap-8 mb-8 text-left">
                        <div>
                            <h4 className="font-bold text-secondary-900 mb-4 font-heading">SN Machinery</h4>
                            <p className="text-secondary-500 text-sm">Empowering construction with premium heavy machinery rentals.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-secondary-900 mb-4 font-heading">Contact</h4>
                            <p className="text-secondary-500 text-sm">123 Construction Ave, Machinery City</p>
                            <p className="text-secondary-500 text-sm">+1 (555) 123-4567</p>
                            <p className="text-secondary-500 text-sm">contact@snmachinery.com</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-secondary-900 mb-4 font-heading">Quick Links</h4>
                            <div className="flex flex-col gap-2 text-sm text-secondary-500">
                                <Link to="/machines" className="hover:text-primary-600">Machines</Link>
                                <Link to="/services" className="hover:text-primary-600">Services</Link>
                                <Link to="/about" className="hover:text-primary-600">About Us</Link>
                            </div>
                        </div>
                    </div>
                    <div className="text-secondary-500 text-sm border-t border-secondary-200 pt-8">
                        <p>&copy; 2026 SN Machinery. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
