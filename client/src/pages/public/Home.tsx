import { Link } from 'react-router-dom';
import { Truck, Shield, Clock, Star } from 'lucide-react';

const Home = () => {
    return (
        <div className="space-y-20">
            {/* Hero Section */}
            <section className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <span className="bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                            Premium Heavy Machinery
                        </span>
                        <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-secondary-900 leading-tight">
                            Build Faster With <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Reliable Equipment</span>
                        </h1>
                        <p className="text-xl text-secondary-500 leading-relaxed">
                            Access a fleet of top-tier excavators, bulldozers, and cranes.
                            Flexible rentals, expert operators, and 24/7 support for your construction projects.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link to="/register" className="bg-secondary-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-secondary-800 transition-all text-lg flex items-center gap-2 shadow-lg shadow-secondary-900/20">
                                Rent Now <Truck size={20} />
                            </Link>
                            <Link to="/machines" className="bg-secondary-50 text-secondary-900 px-8 py-4 rounded-xl font-bold hover:bg-secondary-100 transition-all text-lg border border-secondary-200">
                                View Fleet
                            </Link>
                        </div>
                        <div className="pt-8 flex items-center gap-8 text-sm font-bold text-secondary-500">
                            <div className="flex items-center gap-2">
                                <Shield className="text-primary-600" /> Fully Insured
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="text-primary-600" /> 24/7 Support
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="text-primary-500" /> 5-Star Rated
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent rounded-3xl transform rotate-3"></div>
                        <img
                            src="/images/machine 6.jpg"
                            alt="Heavy Machinery"
                            className="relative rounded-3xl shadow-2xl object-cover h-[600px] w-full transform -rotate-2 hover:rotate-0 transition-all duration-500"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
