import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';


const Contact = () => {
    const { theme } = useTheme();
    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300">
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20">
                        {/* Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-5xl font-bold tracking-tighter mb-6 text-brand-text">Get in touch</h1>
                            <p className="text-xl text-brand-text-secondary mb-12">
                                Have questions about our platform? We're here to help. Chat with our friendly team 24/7.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-brand-secondary/10 rounded-xl h-fit">
                                        <Mail className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 text-brand-text">Chat with us</h3>
                                        <p className="text-brand-text-secondary mb-2">Speak to our friendly team.</p>
                                        <a href="mailto:support@kryzo.com" className="text-blue-500 font-bold hover:underline">support@kryzo.com</a>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="p-3 bg-brand-secondary/10 rounded-xl h-fit">
                                        <MapPin className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 text-brand-text">Visit us</h3>
                                        <p className="text-brand-text-secondary mb-2">Visit our office HQ.</p>
                                        <p className="text-brand-text">100 Smith Street, Collingwood VIC 3066 AU</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="p-3 bg-brand-secondary/10 rounded-xl h-fit">
                                        <Phone className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 text-brand-text">Call us</h3>
                                        <p className="text-brand-text-secondary mb-2">Mon-Fri from 8am to 5pm.</p>
                                        <p className="text-brand-text">+1 (555) 000-0000</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-brand-card/30 p-8 rounded-3xl border border-brand-border"
                        >
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest">First Name</label>
                                        <input type="text" className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-4 text-brand-text placeholder:text-brand-text-secondary focus:border-blue-500 focus:outline-none transition-colors" placeholder="Kryzo" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest">Last Name</label>
                                        <input type="text" className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-4 text-brand-text placeholder:text-brand-text-secondary focus:border-blue-500 focus:outline-none transition-colors" placeholder="Admin" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest">Email</label>
                                    <input type="email" className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-4 text-brand-text placeholder:text-brand-text-secondary focus:border-blue-500 focus:outline-none transition-colors" placeholder="support@kryzo.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest">Message</label>
                                    <textarea className="w-full bg-brand-bg/50 border border-brand-border rounded-xl p-4 text-brand-text placeholder:text-brand-text-secondary focus:border-blue-500 focus:outline-none transition-colors h-32" placeholder="Tell us how we can help..." />
                                </div>
                                <button className="w-full py-4 bg-blue-600 font-bold rounded-xl hover:bg-blue-500 transition-colors text-white">
                                    Send Message
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Contact;
