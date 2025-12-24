import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Footer from '../../components/Footer';

const Pricing = () => {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
                            Simple pricing.
                        </h1>
                        <p className="text-xl text-zinc-400">
                            Start for free, upgrade when you're ready.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Free Tier */}
                        <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20">
                            <h3 className="text-xl font-bold mb-2">Free</h3>
                            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                {["50 coding questions", "Basic community support", "1 Mock interview"].map(i => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-400">
                                        <Check size={18} className="text-white" /> {i}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl border border-white/20 font-bold hover:bg-white hover:text-black transition-all">Get Started</button>
                        </div>

                        {/* Pro Tier */}
                        <div className="p-8 rounded-[2rem] border-2 border-blue-600 bg-zinc-900/40 relative">
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-shadow">Popular</div>
                            <h3 className="text-xl font-bold mb-2 text-blue-400">Pro</h3>
                            <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                {["Unlimited questions", "System Design Course", "Priority Support", "Unlimited Mock Interviews"].map(i => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                                        <Check size={18} className="text-blue-500" /> {i}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl bg-blue-600 font-bold hover:bg-blue-500 transition-all">Upgrade to Pro</button>
                        </div>

                        {/* Enterprise Tier */}
                        <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20">
                            <h3 className="text-xl font-bold mb-2">Team</h3>
                            <div className="text-4xl font-bold mb-6">$99<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                {["SSO & Advanced Security", "Team Analytics", "Dedicated Success Manager", "Custom Training Paths"].map(i => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-400">
                                        <Check size={18} className="text-white" /> {i}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl border border-white/20 font-bold hover:bg-white hover:text-black transition-all">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Pricing;
