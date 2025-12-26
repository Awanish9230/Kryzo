import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Zap, History, Code, FileText } from 'lucide-react';

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
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
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
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-8 hover:bg-white/[0.01] transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Left Side: Date/Day Indicator */}
                                        <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-white/5 pr-8">
                                            <div className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white font-black text-xl mb-2 shadow-inner group-hover:bg-white group-hover:text-black transition-all">
                                                {idx + 1}
                                            </div>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{day.dayName}</span>
                                            <span className="text-[10px] font-bold text-zinc-600 mt-1 uppercase tracking-tighter">Topic focus</span>
                                            <span className="text-xs font-bold text-blue-500 text-center mt-1 truncate max-w-[100px]">{day.topic}</span>
                                        </div>

                                        {/* Middle: Detailed Tasks */}
                                        <div className="flex-grow space-y-4">
                                            {day.tasks.map((task, tIdx) => (
                                                <div key={tIdx} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <div className={`mt-1 p-2 rounded-lg ${task.type === 'READ' ? 'bg-blue-500/10 text-blue-500' :
                                                        task.type === 'PRACTICE_MCQ' ? 'bg-purple-500/10 text-purple-500' :
                                                            'bg-green-500/10 text-green-500'
                                                        }`}>
                                                        {task.type === 'READ' ? <BookOpen size={16} /> :
                                                            task.type === 'PRACTICE_MCQ' ? <Zap size={16} /> :
                                                                <Code size={16} />}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h4 className="text-sm font-bold text-white mb-0.5">{task.description}</h4>
                                                        {task.resource ? (
                                                            <Link to={`/student/study/${task.resource.id}`} className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors mt-1">
                                                                <FileText size={10} />
                                                                Study: {task.resource.title}
                                                            </Link>
                                                        ) : task.availableCount === 0 && task.type !== 'READ' ? (
                                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">No questions available - Check documentation</span>
                                                        ) : task.type === 'READ' ? (
                                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Self-paced study recommended</span>
                                                        ) : null}
                                                    </div>
                                                    {task.target && (
                                                        <span className={`px-3 py-1 border rounded-full text-[10px] font-black ${task.availableCount === 0 ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-zinc-500'
                                                            }`}>
                                                            {task.target}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right: Action */}
                                        <div className="flex items-center justify-center min-w-[120px]">
                                            <Link
                                                to={day.link}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all text-sm group"
                                            >
                                                Start
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
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
