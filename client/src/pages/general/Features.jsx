import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Award, Database, Code2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';


const Features = () => {
    const { theme } = useTheme();
    const features = [
        { icon: Code2, title: "Advanced Code Editor", desc: "Write, run, and debug code in 40+ languages with our powerful Monaco-based editor." },
        { icon: Database, title: "System Design Playground", desc: "Design complex distributed systems with our interactive whiteboard and architecture tools." },
        { icon: Zap, title: "Real-time Collaboration", desc: "Pair program with friends or interviewers in real-time with sub-millisecond latency." },
        { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption and SSO support for teams and organizations." },
        { icon: Globe, title: "Global CDN", desc: "Lightning fast access from anywhere in the world." },
        { icon: Award, title: "Smart Certified", desc: "Get certificates that are recognized by top tech companies worldwide." }
    ];

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300">
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Everything you need.
                        </h1>
                        <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto">
                            Powerful features built for the modern developer.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-3xl bg-brand-card/30 border border-brand-border hover:bg-brand-card/50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-brand-secondary/10 rounded-xl flex items-center justify-center text-brand-text mb-6">
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-brand-text">{item.title}</h3>
                                <p className="text-brand-text-secondary leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Features;
