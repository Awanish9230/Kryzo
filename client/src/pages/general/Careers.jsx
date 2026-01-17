import { motion } from 'framer-motion';
import { ArrowRight, Briefcase } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';


const Careers = () => {
    const { theme } = useTheme();
    const roles = [
        { title: "Senior Frontend Engineer", dept: "Engineering", loc: "Remote", type: "Full-time" },
        { title: "Product Designer", dept: "Design", loc: "New York", type: "Full-time" },
        { title: "Developer Advocate", dept: "Marketing", loc: "London", type: "Contract" },
        { title: "Backend Systems Engineer", dept: "Engineering", loc: "Remote", type: "Full-time" },
    ];

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300">
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full mb-6 border border-purple-500/20">
                        <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">We're Hiring</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 bg-gradient-to-br from-brand-text to-brand-text-secondary bg-clip-text text-transparent">
                        Do your best work here.
                    </h1>
                    <p className="text-xl text-brand-text-secondary">
                        Join us in our mission to transform technical education for everyone.
                        We're a team of dreamers, doers, and relentless problem solvers.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid gap-4">
                        {roles.map((role, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group p-6 bg-brand-card/30 border border-brand-border rounded-2xl hover:border-brand-border transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-blue-500 transition-colors text-brand-text">{role.title}</h3>
                                    <div className="flex gap-4 text-sm text-brand-text-secondary font-medium">
                                        <span>{role.dept}</span>
                                        <span>•</span>
                                        <span>{role.loc}</span>
                                        <span>•</span>
                                        <span>{role.type}</span>
                                    </div>
                                </div>
                                <ArrowRight className="text-brand-text-secondary group-hover:translate-x-1 group-hover:text-brand-text transition-all" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Careers;
