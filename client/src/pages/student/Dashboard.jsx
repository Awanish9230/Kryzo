import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Zap, History, Code, FileText } from 'lucide-react';
import Loader from '../../components/Loader';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlan();
    }, []);

    const fetchPlan = async () => {
        try {
            const { data } = await api.get('/student/plan');
            setPlan(data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            if (err.response && err.response.status !== 404) {
                setError('Failed to load dashboard');
            }
        }
    };

    const startDiagnostic = async () => {
        navigate('/student/test/diagnostic');
    };

    if (loading) return (
        <Loader fullScreen />
    );

    if (!plan) {
        return (
            <div className="min-h-screen bg-black pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/5 p-12 rounded-[2.5rem] max-w-2xl w-full"
                    >
                        <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-4 tracking-tight">Your Journey Starts Here</h1>
                        <p className="text-zinc-500 mb-10 text-lg">
                            To build your personalized learning path, take a quick diagnostic test to assess your current skills.
                        </p>
                        <button
                            onClick={startDiagnostic}
                            className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center mx-auto group"
                        >
                            Start Diagnostic Test
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">Welcome back!</h1>
                    <p className="text-zinc-500">Here's your performance overview and study plan.</p>
                </header>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard label="Last Test Score" value={plan.score} color="blue" />
                    <TopicCard label="Weak Areas" topics={plan.analysis.weak} color="red" />
                    <TopicCard label="Strengths" topics={plan.analysis.strong} color="green" />
                </div>

                {/* Improvement Plan */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold tracking-tight">Daily Improvement Plan</h2>
                        <span className="text-sm font-medium px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
                            Focus: {plan.focusTopics?.join(', ') || 'General Topics'}
                        </span>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                        <div className="divide-y divide-white/5">
                            {plan.plan.map((day, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-8 group"
                                >
                                    <div className="flex flex-col lg:flex-row gap-10">
                                        {/* Day Indicator - Modern Timeline Style */}
                                        <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-2 shrink-0 lg:w-28">
                                            <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500 font-black text-xl shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{day.dayName}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter truncate max-w-[80px]">
                                                        {day.topic}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Task Cards - Compact & Clean */}
                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {day.tasks.map((task, tIdx) => (
                                                <div key={tIdx} className="relative group/task p-5 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 overflow-hidden">
                                                    <div className={`absolute top-0 left-0 w-1 h-full ${task.type === 'READ' ? 'bg-blue-500' :
                                                        task.type === 'PRACTICE_MCQ' ? 'bg-purple-500' :
                                                            'bg-green-500'
                                                        } opacity-50 group-hover/task:opacity-100 transition-opacity`}></div>

                                                    <div className="flex items-start gap-4">
                                                        <div className={`p-2 rounded-xl shrink-0 ${task.type === 'READ' ? 'bg-blue-500/10 text-blue-500' :
                                                            task.type === 'PRACTICE_MCQ' ? 'bg-purple-500/10 text-purple-500' :
                                                                'bg-green-500/10 text-green-500'
                                                            }`}>
                                                            {task.type === 'READ' ? <BookOpen size={16} /> :
                                                                task.type === 'PRACTICE_MCQ' ? <Zap size={16} /> :
                                                                    <Code size={16} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-bold text-zinc-200 mb-2 leading-tight group-hover/task:text-white transition-colors">
                                                                {task.description}
                                                            </h4>
                                                            {task.resource ? (
                                                                <Link to={`/student/study/${task.resource.id}`} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-400 hover:bg-blue-500 hover:text-white transition-all uppercase tracking-widest">
                                                                    <FileText size={10} />
                                                                    Read Guide
                                                                </Link>
                                                            ) : task.availableCount === 0 && task.type !== 'READ' ? (
                                                                <span className="text-[9px] font-black text-red-500/70 uppercase tracking-tighter">Coming Soon</span>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                                                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                                                        {task.type === 'READ' ? 'Learning Mode' : `${task.target || 'N/A'}`}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions - Unified & Elegant */}
                                        <div className="lg:w-48 shrink-0 flex flex-col gap-3 justify-center">
                                            <Link
                                                to={day.link}
                                                className="w-full flex items-center justify-between px-6 py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all text-[11px] uppercase tracking-widest group/btn shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
                                            >
                                                Start Session
                                                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                            {day.tasks.some(t => t.type === 'PRACTICE_CODING') && (
                                                <Link
                                                    to={`/student/practice/coding?topic=${day.topic}`}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800/50 text-zinc-400 font-black rounded-2xl hover:bg-zinc-800 hover:text-white transition-all text-[10px] uppercase tracking-widest border border-white/5 group/pbtn"
                                                >
                                                    <Code size={14} className="opacity-50 group-hover/pbtn:opacity-100" />
                                                    Code Lab
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <button onClick={startDiagnostic} className="text-zinc-600 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 mx-auto">
                        <History size={16} />
                        Retake Diagnostic Test
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color }) => (
    <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2rem] hover:border-white/10 transition-all">
        <h3 className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-4">{label}</h3>
        <p className="text-5xl font-bold tracking-tighter">{value}</p>
    </div>
);

const TopicCard = ({ label, topics, color }) => {
    const colorMap = {
        red: 'text-red-500 bg-red-500/10 border-red-500/20',
        green: 'text-green-500 bg-green-500/10 border-green-500/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    };
    return (
        <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2rem] hover:border-white/10 transition-all">
            <h3 className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-4">{label}</h3>
            <div className="flex flex-wrap gap-2">
                {topics.length > 0 ? (
                    topics.map(t => (
                        <span key={t} className={`px-3 py-1 text-xs font-bold rounded-lg border ${colorMap[color]}`}>{t}</span>
                    ))
                ) : <span className="text-zinc-600 italic">None identified</span>}
            </div>
        </div>
    );
};

export default StudentDashboard;
