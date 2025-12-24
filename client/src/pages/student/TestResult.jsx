import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    BookOpen,
    ArrowRight,
    Target,
    Calendar,
    Trophy,
    TrendingUp
} from 'lucide-react';

const TestResult = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResult();
    }, []);

    const fetchResult = async () => {
        try {
            const { data } = await api.get('/student/plan');
            setResult(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    if (!result) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <p className="text-zinc-500">No recent test results found.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full mb-6 border border-white/5">
                        <Trophy size={16} className="text-yellow-500" />
                        <span className="text-sm font-bold text-yellow-500 uppercase tracking-widest">Analysis Complete</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
                        {result.percentage}% <span className="text-zinc-600 text-3xl md:text-5xl">Score</span>
                    </h1>
                    <div className="flex items-center justify-center gap-6 mb-6">
                        <div className="text-center px-6 py-3 bg-zinc-900 rounded-2xl border border-white/5">
                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1">Questions</p>
                            <p className="text-2xl font-bold text-white">
                                <span className="text-green-500">{result.correctQuestions}</span>
                                <span className="text-zinc-600">/</span>
                                {result.totalQuestions}
                            </p>
                        </div>
                        <div className="text-center px-6 py-3 bg-zinc-900 rounded-2xl border border-white/5">
                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1">Points</p>
                            <p className="text-2xl font-bold text-blue-500">{result.score}</p>
                        </div>
                    </div>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        {result.motivation}
                    </p>
                </motion.div>

                {/* Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Weak Areas */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <Target size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold">Focus Areas</h3>
                        </div>
                        {result.analysis.weak.length > 0 ? (
                            <div className="space-y-3">
                                {result.analysis.weak.map(topic => (
                                    <div key={topic} className="flex items-center gap-3 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                        <XCircle size={18} className="text-red-500 shrink-0" />
                                        <span className="font-bold text-red-200">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500">No significant weak areas detected. Keep it up!</p>
                        )}
                    </motion.div>

                    {/* Strong Areas */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <TrendingUp size={24} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold">Strong Points</h3>
                        </div>
                        {result.analysis.strong.length > 0 ? (
                            <div className="space-y-3">
                                {result.analysis.strong.map(topic => (
                                    <div key={topic} className="flex items-center gap-3 p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                        <span className="font-bold text-green-200">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500">Keep practicing to build strong points!</p>
                        )}
                    </motion.div>
                </div>

                {/* Detailed Question Analysis (New Section) */}
                {result.questions && result.questions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h2 className="text-3xl font-bold tracking-tight mb-8">Performance Breakdown</h2>
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/5">
                                            <th className="p-6 font-bold text-zinc-400 text-xs uppercase tracking-widest">Question</th>
                                            <th className="p-6 font-bold text-zinc-400 text-xs uppercase tracking-widest">Type</th>
                                            <th className="p-6 font-bold text-zinc-400 text-xs uppercase tracking-widest">Difficulty</th>
                                            <th className="p-6 font-bold text-zinc-400 text-xs uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {result.questions.map((q) => (
                                            <tr key={q._id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-6 font-medium text-white">{q.title}</td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${q.type === 'CODING'
                                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>
                                                        {q.type}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`text-xs font-bold uppercase ${q.difficulty === 'hard' ? 'text-red-500' :
                                                            q.difficulty === 'medium' ? 'text-yellow-500' : 'text-green-500'
                                                        }`}>
                                                        {q.difficulty}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${q.status === 'solved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            q.status === 'attempted' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                        {q.status === 'solved' && <CheckCircle2 size={14} />}
                                                        {q.status === 'attempted' && <Target size={14} />}
                                                        {q.status === 'skipped' && <XCircle size={14} />}
                                                        {q.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 7-Day Plan */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-8">7-Day Improvement Plan</h2>
                    <div className="space-y-4">
                        {result.plan.map((day, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                                className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="shrink-0 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-bold text-zinc-500 group-hover:bg-white group-hover:text-black transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{day.day}</p>
                                            <p className="font-bold text-white text-lg">{day.action}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 border-l border-white/5 pl-6 md:pl-6 border-t md:border-t-0 pt-4 md:pt-0">
                                        <p className="text-zinc-400 mb-2">{day.description}</p>

                                        {day.resource && (
                                            <div className="flex items-center gap-2 text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg w-fit text-sm font-bold">
                                                <BookOpen size={14} />
                                                <span>Recommended: {day.resource.title}</span>
                                            </div>
                                        )}
                                    </div>

                                    {day.link && (
                                        <button
                                            onClick={() => navigate(day.link)}
                                            className="shrink-0 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2 justify-center"
                                        >
                                            Start
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="text-zinc-500 hover:text-white font-bold transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestResult;
