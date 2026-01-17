import { motion } from 'framer-motion';
import { Users, Target, Globe, Award } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';


const About = () => {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-6 border-b border-brand-border overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-brand-text"
                    >
                        We're building the future of <span className="text-blue-500">tech education</span>.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-brand-text-secondary max-w-2xl mx-auto leading-relaxed"
                    >
                        Kryzo is on a mission to democratize access to high-quality technical interviews and learning resources. We believe everyone deserves a shot at their dream career.
                    </motion.p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-20 border-b border-brand-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Active Students", value: "50K+" },
                            { label: "Questions Solved", value: "1M+" },
                            { label: "Countries", value: "120+" },
                            { label: "Hired at FAANG", value: "500+" }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold mb-2 text-brand-text">{stat.value}</div>
                                <div className="text-brand-text-secondary text-sm uppercase tracking-widest font-bold">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-text">Our Core Values</h2>
                        <p className="text-brand-text-secondary">The principles that guide every decision we make.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Users, title: "Student First", desc: "We prioritize student success over everything else. Your growth is our growth." },
                            { icon: Target, title: "Excellence", desc: "We strive for the highest quality in our content, platform, and support." },
                            { icon: Globe, title: "Inclusivity", desc: "Technology is for everyone. We're breaking down barriers to entry." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-3xl bg-brand-card/30 border border-brand-border hover:bg-brand-card/50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-brand-text">{item.title}</h3>
                                <p className="text-brand-text-secondary leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contributors Section */}
            <div className="py-32 px-6 border-t border-brand-border">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-text">Question Bank Contributors</h2>
                        <p className="text-brand-text-secondary">The brilliant minds behind our comprehensive assessment library.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[
                            { name: "Awanish Kumar Verma", role: "Question Architect" },
                            { name: "Shantanu Raj", role: "Question Architect" },
                            { name: "Manikant Verma", role: "Question Architect" },
                            { name: "Avshesh Kushwaha", role: "Question Architect" },
                            { name: "Utkarsh Maheshwari", role: "Question Architect" }
                        ].map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl bg-brand-card/20 border border-brand-border text-center group hover:bg-brand-card/40 transition-colors"
                            >
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <h4 className="font-bold text-brand-text mb-1 text-sm">{member.name}</h4>
                                <p className="text-brand-text-secondary text-[10px] uppercase tracking-tighter">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section (Placeholder) */}
            <div className="py-20 px-6 border-t border-brand-border bg-brand-card/20">
                <div className="max-w-4xl mx-auto text-center">
                    <Award size={48} className="mx-auto text-yellow-500 mb-6" />
                    <h2 className="text-3xl font-bold mb-6 text-brand-text">Join our journey</h2>
                    <p className="text-brand-text-secondary mb-8">
                        We are a diverse team of engineers, educators, and designers working together to change the world.
                    </p>
                    <button className="px-8 py-3 bg-brand-text text-brand-bg font-bold rounded-full hover:opacity-80 transition-colors">
                        View Openings
                    </button>
                </div>
            </div>


        </div>
    );
};

export default About;
