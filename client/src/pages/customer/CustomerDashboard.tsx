import { Link } from 'react-router-dom';
import { Truck, Clock, ShoppingBag, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

const CustomerDashboard = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userName = user?.name || 'Customer';

    return (
        <div className="space-y-12">
            {/* Hero Section / Welcome */}
            <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white p-8 md:p-12 mb-8">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome back, {userName}!
                    </h1>
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                        Ready for your next project? Browse our fleet of premium heavy machinery or manage your active rentals.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/customer/machines" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/50 flex items-center gap-2">
                            Browse Machinery <ArrowRight size={18} />
                        </Link>
                        <Link to="/customer/rentals" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl font-bold transition-all">
                            View My Rentals
                        </Link>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Quick Stats / Active Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Clock size={24} />
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-500 text-sm">Current Rental</p>
                        <h3 className="text-2xl font-bold text-gray-900">Excavator XL-200</h3>
                        <p className="text-sm text-gray-400">Ends in 3 days</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                            <CreditCard size={24} />
                        </div>
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-500 text-sm">Next Invoice</p>
                        <h3 className="text-2xl font-bold text-gray-900">$1,250.00</h3>
                        <p className="text-sm text-gray-400">Due on Jan 30, 2026</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-gray-50 p-3 rounded-xl text-gray-600">
                            <ShieldCheck size={24} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-500 text-sm">Account Status</p>
                        <h3 className="text-2xl font-bold text-gray-900">Verified</h3>
                        <p className="text-sm text-gray-400">Full insurance coverage active</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {[1, 2, 3].map((_, index) => (

                            <div key={index} className="p-4 flex items-center gap-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag size={18} className="text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">New Booking Request</p>
                                    <p className="text-xs text-gray-500">Bulldozer D5 • Jan 24, 2026</p>
                                </div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Processing</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended for You</h2>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10">
                            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded mb-3 inline-block">Special Offer</span>
                            <h3 className="text-2xl font-bold mb-2">Weekend Special</h3>
                            <p className="text-gray-300 mb-4 text-sm">Get 20% off on all aerial work platforms this weekend.</p>
                            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm group-hover:gap-3 transition-all">
                                View Offer <ArrowRight size={16} />
                            </div>
                        </div>
                        <Truck className="absolute -bottom-4 -right-4 size-32 text-white/5 rotate-[-15deg] group-hover:scale-110 transition-transform duration-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
