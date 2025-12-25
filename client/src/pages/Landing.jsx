import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Footer from '../components/Footer';
import {
    Zap,
    Code2,
    BarChart3,
    ChevronRight,
    ShieldCheck,
    LayoutDashboard,
    BookOpen,
    Target,
    Trophy,
    Users,
    ArrowUpRight,
    Sparkles,
    CheckCircle2,
    Terminal
} from 'lucide-react';

const Landing = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin';

    const steps = [
        { icon: <Target className="text-blue-500" />, title: "Diagnostic Test", desc: "Start with a comprehensive scan of your current coding and aptitude levels." },
        { icon: <Sparkles className="text-purple-500" />, title: "Personalized Plan", desc: "Get an AI-generated 7-day roadmap tailored to your specific weak areas." },
        { icon: <Code2 className="text-green-500" />, title: "Adaptive Practice", desc: "Solve problems that evolve with your skill level, ensuring constant growth." },
        { icon: <Trophy className="text-yellow-500" />, title: "Certification", desc: "Gain industry-recognized badges and proof of proficiency for your resume." }
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden mesh-gradient">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[160px] rounded-full opacity-50"></div>
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2 mb-10 text-xs font-black border border-white/5 rounded-full bg-white/5 backdrop-blur-3xl text-blue-400 uppercase tracking-[0.3em] shadow-2xl">
                            <Zap size={12} className="fill-blue-400" />
                            Next-Gen Assessment Engine
                        </div>

                        <h1 className="text-7xl md:text-[120px] font-black tracking-[-0.05em] mb-10 leading-[0.85]">
                            Engineering <br />
                            <span className="text-gradient">Benchmark.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-16 font-semibold leading-relaxed">
                            Kryzo benchmarks engineering excellence through deep-trace diagnostics and adaptive skill-mapping. Optimized for the class of 2025.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            {user ? (
                                <Link
                                    to={isAdmin ? "/admin/dashboard" : "/student/dashboard"}
                                    className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-[2rem] hover:scale-105 transition-all flex items-center group shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                                >
                                    <LayoutDashboard className="mr-3 w-5 h-5" />
                                    Access Console
                                    <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-[2rem] hover:scale-105 transition-all flex items-center group shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                                    >
                                        Get Started
                                        <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-12 py-5 bg-zinc-900/50 border border-white/10 text-white font-black uppercase tracking-widest rounded-[2rem] hover:bg-zinc-900 transition-all backdrop-blur-xl"
                                    >
                                        Log In
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Explore Platform</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-white/5 bg-zinc-950/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        <div>
                            <div className="text-4xl font-black text-white mb-2">50K+</div>
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Questions Solved</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-white mb-2">98%</div>
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Accuracy Rate</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-white mb-2">40+</div>
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Colleges Enrolled</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-white mb-2">24/7</div>
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Platform Uptime</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4 block">Core Capabilities</span>
                        <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Built for Technical Excellence.</h2>
                        <p className="text-zinc-500 max-w-xl mx-auto font-semibold">Everything you need to run high-stakes assessment platforms at any scale.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        <div className="md:col-span-4 glass rounded-[3rem] p-12 hover:border-white/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] group-hover:bg-blue-500/10 transition-colors" />
                            <ShieldCheck className="w-16 h-16 text-blue-500 mb-8" />
                            <h3 className="text-3xl font-black mb-4">AI-Powered Diagnostics</h3>
                            <p className="text-zinc-400 text-lg font-semibold max-w-md leading-relaxed">Our adaptive engine analyzes student performance across 20+ parameters to build a unique learning path from day one.</p>
                        </div>

                        <div className="md:col-span-2 glass rounded-[3rem] p-10 hover:border-white/20 transition-all flex flex-col justify-between group">
                            <Zap className="w-12 h-12 text-yellow-500 mb-8 group-hover:scale-110 transition-transform" />
                            <div>
                                <h3 className="text-x font-black mb-2 uppercase tracking-tighter">Instant Feedback</h3>
                                <p className="text-zinc-500 text-sm font-semibold">Real-time code evaluation with detailed edge-case breakdowns.</p>
                            </div>
                        </div>

                        <div className="md:col-span-3 glass rounded-[3rem] p-10 hover:border-white/20 transition-all group overflow-hidden">
                            <div className="h-48 w-full bg-black/40 rounded-2xl mb-8 flex items-center justify-center border border-white/5 relative">
                                <Code2 className="w-24 h-24 text-purple-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <div className="px-3 py-1 bg-black border border-white/10 rounded-full text-[8px] font-black text-zinc-400 uppercase tracking-widest">Compiler v2.1</div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-gradient">Multi-Language Ecosystem</h3>
                            <p className="text-zinc-500 font-semibold leading-relaxed">Native support for C++, Java, and Python with industry-standard test environments.</p>
                        </div>

                        <div className="md:col-span-3 glass rounded-[3rem] p-10 hover:border-white/20 transition-all group">
                            <BarChart3 className="w-12 h-12 text-green-500 mb-8 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-2xl font-black mb-3">Deep Visual Analytics</h3>
                            <p className="text-zinc-500 font-semibold leading-relaxed">Track progress with immersive radar charts and historical data points to measure growth over time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-32 bg-zinc-950/50 relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div className="max-w-xl">
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.5em] mb-4 block">Onboarding Flow</span>
                            <h2 className="text-4xl md:text-5xl font-black">Your Journey to Mastery.</h2>
                        </div>
                        <p className="text-zinc-500 max-w-sm font-medium">From initial scan to final certification, we handle every step of your skill development.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative p-8 rounded-3xl bg-black border border-white/5 hover:border-white/10 transition-all group"
                            >
                                <div className="text-4xl font-black text-white/5 absolute top-4 right-8 group-hover:text-white/10 transition-colors">0{idx + 1}</div>
                                <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit">
                                    {step.icon}
                                </div>
                                <h4 className="text-xl font-black mb-3">{step.title}</h4>
                                <p className="text-zinc-600 text-sm leading-relaxed font-medium">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 px-6 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-10 leading-[1.1]">
                        Ready to elevate your <br />
                        <span className="text-zinc-600">engineering standards?</span>
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <Link
                            to="/register"
                            className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-200 transition-all flex items-center group shadow-2xl shadow-blue-500/10"
                        >
                            Get Started Now
                            <ArrowUpRight className="ml-3 w-5 h-5" />
                        </Link>
                        <Link
                            to="/contact"
                            className="px-12 py-5 bg-zinc-900 border border-white/10 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-800 transition-all"
                        >
                            Contact Sales
                        </Link>
                    </div>
                    <div className="mt-16 flex items-center justify-center gap-10 opacity-30 grayscale">
                        <div className="font-black tracking-tighter text-2xl">GOOGLE</div>
                        <div className="font-black tracking-tighter text-2xl">MICROSOFT</div>
                        <div className="font-black tracking-tighter text-2xl">AMAZON</div>
                        <div className="font-black tracking-tighter text-2xl">META</div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landing;
