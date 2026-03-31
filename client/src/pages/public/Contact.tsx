import { Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';

const Contact = () => {
    const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your feedback! We will review it shortly.');
        setFeedback({ name: '', email: '', message: '' });
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-4xl font-heading font-bold text-secondary-900 mb-6">Get in Touch</h2>
                        <p className="text-secondary-500 text-lg mb-8">
                            Have a question or want to give feedback? We'd love to hear from you. Fill out the form or reach us directly.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-secondary-900">Phone</div>
                                    <div className="text-secondary-500">+1 (555) 123-4567</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-secondary-900">Email</div>
                                    <div className="text-secondary-500">contact@snmachinery.com</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-secondary-900">Location</div>
                                    <div className="text-secondary-500">123 Construction Ave, Machinery City</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-secondary-100 p-8 rounded-3xl shadow-lg shadow-secondary-900/5">
                        <h3 className="text-2xl font-bold mb-6 font-heading text-secondary-900">Send Feedback</h3>
                        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-secondary-700 mb-1">Your Name</label>
                                <input required className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 outline-none transition-colors" value={feedback.name} onChange={e => setFeedback({ ...feedback, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-secondary-700 mb-1">Email</label>
                                <input required type="email" className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 outline-none transition-colors" value={feedback.email} onChange={e => setFeedback({ ...feedback, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-secondary-700 mb-1">Message / Feedback</label>
                                <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 outline-none resize-none transition-colors" value={feedback.message} onChange={e => setFeedback({ ...feedback, message: e.target.value })} />
                            </div>
                            <button className="w-full bg-secondary-900 text-white font-bold py-4 rounded-xl hover:bg-secondary-800 transition-colors shadow-lg shadow-secondary-900/20">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
