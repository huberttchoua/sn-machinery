import { Truck, Shield, Clock } from 'lucide-react';

const Services = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-heading font-bold text-secondary-900 mb-4">Why Choose Us?</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="text-center space-y-4 group">
                        <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto transition-colors group-hover:bg-primary-100">
                            <Truck size={32} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-secondary-900">Modern Fleet</h3>
                        <p className="text-secondary-500 leading-relaxed">Our machines are regularly serviced and kept in peak condition for maximum reliability.</p>
                    </div>
                    <div className="text-center space-y-4 group">
                        <div className="w-16 h-16 bg-secondary-50 text-secondary-700 rounded-2xl flex items-center justify-center mx-auto transition-colors group-hover:bg-secondary-100">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-secondary-900">Expert Support</h3>
                        <p className="text-secondary-500 leading-relaxed">Need an operator? We provide skilled drivers and mechanics to support your team.</p>
                    </div>
                    <div className="text-center space-y-4 group">
                        <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto transition-colors group-hover:bg-primary-100">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-secondary-900">Flexible Rentals</h3>
                        <p className="text-secondary-500 leading-relaxed">Daily, weekly, or monthly rates tailored to your project timeline and budget.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
