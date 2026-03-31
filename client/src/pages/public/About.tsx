const About = () => {
    return (
        <section className="py-20 bg-secondary-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-heading font-bold mb-6">About SN Machinery</h2>
                        <p className="text-secondary-300 text-lg leading-relaxed mb-6">
                            Established with a vision to empower construction projects across the region, SN Machinery has grown into a trusted partner for contractors and developers. We believe in quality, safety, and efficiency.
                        </p>
                        <p className="text-secondary-300 text-lg leading-relaxed">
                            Our mission is to provide accessible, high-quality heavy machinery solutions that help build the future, one project at a time.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary-800 p-8 rounded-2xl border border-secondary-700">
                            <div className="text-4xl font-bold text-primary-500 mb-2">50+</div>
                            <div className="text-secondary-400 font-medium">Machines</div>
                        </div>
                        <div className="bg-secondary-800 p-8 rounded-2xl border border-secondary-700">
                            <div className="text-4xl font-bold text-primary-500 mb-2">200+</div>
                            <div className="text-secondary-400 font-medium">Projects</div>
                        </div>
                        <div className="bg-secondary-800 p-8 rounded-2xl border border-secondary-700">
                            <div className="text-4xl font-bold text-primary-500 mb-2">100%</div>
                            <div className="text-secondary-400 font-medium">Satisfaction</div>
                        </div>
                        <div className="bg-secondary-800 p-8 rounded-2xl border border-secondary-700">
                            <div className="text-4xl font-bold text-primary-500 mb-2">24/7</div>
                            <div className="text-secondary-400 font-medium">Support</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
