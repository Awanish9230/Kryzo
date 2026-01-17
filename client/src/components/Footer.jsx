import { Link } from 'react-router-dom';
import {
    Github,
    Twitter,
    Linkedin,
    Instagram,
    Zap,
    Heart
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

const Footer = () => {
    const { theme } = useTheme();

    return (
        <footer className="border-t border-brand-border bg-brand-bg pt-20 pb-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
                    <div className="col-span-2 lg:col-span-2">
                        <Link to="/" className="flex items-center gap-3 mb-6">
                            <img src="/K_logo.png" alt="Kryzo" className="h-10 w-10 object-cover rounded-full bg-brand-card p-1 border border-brand-border" />
                            <span className="text-2xl font-bold tracking-tighter text-brand-text">Kryzo</span>
                        </Link>
                        <p className="text-brand-text-secondary mb-8 max-w-sm">
                            Master your coding interview with our advanced diagnostic tests and adaptive learning paths. Built for students, by developers.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 rounded-full bg-brand-secondary/10 text-brand-text-secondary hover:bg-brand-text hover:text-brand-bg transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-brand-text mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-brand-text-secondary">
                            <li><Link to="/features" className="hover:text-blue-500 transition-colors">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-blue-500 transition-colors">Pricing</Link></li>
                            <li><Link to="/integrations" className="hover:text-blue-500 transition-colors">Integrations</Link></li>
                            <li><Link to="/changelog" className="hover:text-blue-500 transition-colors">Changelog</Link></li>
                            <li><Link to="/docs" className="hover:text-blue-500 transition-colors">Documentation</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-brand-text mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-brand-text-secondary">
                            <li><Link to="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-blue-500 transition-colors">Careers</Link></li>
                            <li><Link to="/about" className="hover:text-blue-500 transition-colors">Our Team</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-brand-text mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-brand-text-secondary">
                            <li><Link to="/help" className="hover:text-blue-500 transition-colors">Help Center</Link></li>
                            <li><Link to="/community" className="hover:text-blue-500 transition-colors">Community</Link></li>
                            <li><Link to="/status" className="hover:text-blue-500 transition-colors">System Status</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-brand-text mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-brand-text-secondary">
                            <li><Link to="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
                            <li><Link to="/security" className="hover:text-blue-500 transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-brand-text-secondary text-sm">
                        © 2025 Kryzo Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-brand-text-secondary text-sm">
                        <span>Made with ❤️ by Apm Pvt. Ltd.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
