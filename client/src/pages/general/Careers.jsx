import { motion } from 'framer-motion';
import { ArrowRight, Briefcase } from 'lucide-react';
import Footer from '../../components/Footer';

const Careers = () => {
    const roles = [
        { title: "Senior Frontend Engineer", dept: "Engineering", loc: "Remote", type: "Full-time" },
        { title: "Product Designer", dept: "Design", loc: "New York", type: "Full-time" },
        { title: "Developer Advocate", dept: "Marketing", loc: "London", type: "Contract" },
        { title: "Backend Systems Engineer", dept: "Engineering", loc: "Remote", type: "Full-time" },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full mb-6 border border-purple-500/20">
                        <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">We're Hiring</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                        Do your best work here.
                    </h1>
                    <p className="text-xl text-zinc-400">
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
                                className="group p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:border-white/20 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">{role.title}</h3>
                                    <div className="flex gap-4 text-sm text-zinc-500 font-medium">
                                        <span>{role.dept}</span>
                                        <span>•</span>
                                        <span>{role.loc}</span>
                                        <span>•</span>
                                        <span>{role.type}</span>
                                    </div>
                                </div>
                                <ArrowRight className="text-zinc-600 group-hover:translate-x-1 group-hover:text-white transition-all" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Careers;
