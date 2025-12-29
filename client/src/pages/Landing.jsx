import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import {
    Zap,
    Code2,
    BarChart3,
    History,
    ChevronRight,
    ShieldCheck,
    Cpu,
    LayoutDashboard,
    BookOpen,
    Github,
    Twitter,
    Linkedin,
    Target,
    Sparkles,
    Trophy
} from 'lucide-react';
import Footer from '../components/Footer';


const Landing = () => {

    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen bg-black overflow-hidden font-sans">
            {/* Header / Navbar Placeholder (if not global) */}

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium border border-white/10 rounded-full bg-white/5 backdrop-blur-sm text-blue-400">
                            Next-Gen Assessment Platform
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                            Better assessments for <br />
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                modern engineering teams.
                            </span>
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
                            Build, verify, and scale your college's test-series platform with AI-powered diagnostics and real-time performance tracking.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                <>
                                    <Link
                                        to={isAdmin ? "/admin/dashboard" : "/student/dashboard"}
                                        className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-all flex items-center group"
                                    >
                                        <LayoutDashboard className="mr-2 w-5 h-5" />
                                        Go to Dashboard
                                        <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    {!isAdmin && (
                                        <Link
                                            to="/student/test/custom"
                                            className="px-8 py-4 bg-zinc-900 border border-white/10 text-white font-bold rounded-lg hover:bg-zinc-800 transition-all flex items-center"
                                        >
                                            <BookOpen className="mr-2 w-5 h-5" />
                                            Start Studying
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-all flex items-center group"
                                    >
                                        Get Started Free
                                        <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-8 py-4 bg-zinc-900 border border-white/10 text-white font-bold rounded-lg hover:bg-zinc-800 transition-all"
                                    >
                                        Login to Dashboard
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Engineered for Technical Excellence.</h2>
                        <p className="text-zinc-500">Everything you need to run a high-stakes assessment platform.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        {/* Large Card 1 */}
                        <div className="md:col-span-4 bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
                            <ShieldCheck className="w-12 h-12 text-blue-500 mb-6" />
                            <h3 className="text-2xl font-bold mb-3">AI-Powered Diagnostics</h3>
                            <p className="text-zinc-400 max-w-md">Our adaptive engine analyzes student performance across 20+ parameters to build a unique learning path from day one.</p>
                        </div>

                        {/* Side Card 1 */}
                        <div className="md:col-span-2 bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
                            <Zap className="w-10 h-10 text-yellow-500 mb-6" />
                            <h3 className="text-xl font-bold mb-3">Instant Feedback</h3>
                            <p className="text-zinc-400 text-sm">Real-time code evaluation and score calculation with detailed breakdowns.</p>
                        </div>

                        {/* Center Card */}
                        <div className="md:col-span-3 bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
                            <div className="h-40 w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl mb-6 flex items-center justify-center">
                                <Code2 className="w-20 h-20 text-blue-400 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Multi-Language Coding</h3>
                            <p className="text-zinc-400 text-sm">Support for C++, Java, and Python with industry-standard test cases.</p>
                        </div>

                        {/* Large Card 2 */}
                        <div className="md:col-span-3 bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
                            <BarChart3 className="w-10 h-10 text-green-500 mb-6" />
                            <h3 className="text-xl font-bold mb-3">Deep Analytics</h3>
                            <p className="text-zinc-400 text-sm">Track progress with beautiful charts and historical data points to measure growth over time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Onboarding Flow Section */}
            <section className="py-32 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
                        <div>
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-4 block">Onboarding Flow</span>
                            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">Your Journey to <br /> Mastery.</h2>
                        </div>
                        <p className="text-zinc-500 max-w-sm text-lg font-medium leading-relaxed">
                            From initial scan to final certification, we handle every step of your skill development.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: "01", icon: <Target className="text-blue-500" />, title: "Diagnostic Test", desc: "Start with a comprehensive scan of your current coding and aptitude levels." },
                            { step: "02", icon: <Sparkles className="text-purple-500" />, title: "Personalized Plan", desc: "Get an AI-generated 7-day roadmap tailored to your specific weak areas." },
                            { step: "03", icon: <Code2 className="text-green-500" />, title: "Adaptive Practice", desc: "Solve problems that evolve with your skill level, ensuring constant growth." },
                            { step: "04", icon: <Trophy className="text-yellow-500" />, title: "Certification", desc: "Gain industry-recognized badges and proof of proficiency for your resume." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="relative bg-zinc-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-zinc-900/60 transition-all group"
                            >
                                <span className="absolute top-8 right-8 text-3xl font-black text-zinc-800 group-hover:text-zinc-700 transition-colors">{item.step}</span>
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-8">
                                    {item.icon}
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">{item.title}</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Landing;
