import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
                <p className="text-gray-500 mt-2">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                            <Phone size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Phone</h3>
                            <p className="text-gray-500 text-sm mt-1">+1 (555) 123-4567</p>
                            <p className="text-gray-500 text-sm">Mon-Fri 8am-6pm</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Email</h3>
                            <p className="text-gray-500 text-sm mt-1">support@snmachinery.com</p>
                            <p className="text-gray-500 text-sm">24/7 Support</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Office</h3>
                            <p className="text-gray-500 text-sm mt-1">123 Construction Ave</p>
                            <p className="text-gray-500 text-sm">New York, NY 10001</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="md:col-span-2">
                    <form className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Doe" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="john@example.com" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Message</label>
                            <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none" placeholder="How can we help you?" />
                        </div>

                        <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                            <span>Send Message</span>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
