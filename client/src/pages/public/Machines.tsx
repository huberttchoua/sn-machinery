import { Link } from 'react-router-dom';

const Machines = () => {
    return (
        <section className="py-20 bg-secondary-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-heading font-bold text-secondary-900 mb-4">Our Powerful Fleet</h2>
                    <p className="text-secondary-500 text-lg">Explore our range of high-performance machinery ready for any job site.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { name: 'CAT 320 Excavator', type: 'Excavator', img: '/images/machine 1.jpg' },
                        { name: 'JCB 3CX Backhoe', type: 'Backhoe', img: '/images/machine 2.jpg' },
                        { name: 'Volvo A40G', type: 'Hauler', img: '/images/machine 3.jpg' }
                    ].map((machine, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-secondary-100">
                            <div className="h-64 overflow-hidden">
                                <img src={machine.img} alt={machine.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-6">
                                <div className="text-sm font-bold text-primary-600 mb-2 uppercase tracking-wider">{machine.type}</div>
                                <h3 className="text-xl font-heading font-bold text-secondary-900 mb-2">{machine.name}</h3>
                                <Link to="/register" className="text-secondary-500 text-sm font-medium hover:text-primary-600 flex items-center gap-1 transition-colors">
                                    View Details & Rent &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link to="/register" className="inline-block border-2 border-secondary-900 text-secondary-900 px-8 py-3 rounded-xl font-bold hover:bg-secondary-900 hover:text-white transition-all">
                        View Full Catalog
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Machines;
