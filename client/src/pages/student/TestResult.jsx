import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    BookOpen,
    ArrowRight,
    Target,
    Calendar,
    Trophy,
    TrendingUp,
    Zap,
    Code,
    FileText
} from 'lucide-react';
import Loader from '../../components/Loader';

const TestResult = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchResult();
    }, []);

    const fetchResult = async () => {
        try {
            setError(null);
            const { data } = await api.get('/student/plan?view=result');
            setResult(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load results. Please try again.');
            setLoading(false);
        }
    };

    if (loading) return (
        <Loader fullScreen />
    );

    if (error) return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-center px-4">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-brand-text mb-2">{error}</h2>
            <button
                onClick={fetchResult}
                className="px-6 py-2 bg-brand-text text-brand-bg rounded-lg font-bold hover:opacity-90 transition-colors"
            >
                Retry
            </button>
            <div className="mt-4">
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="text-brand-text-secondary hover:text-brand-text"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    if (!result) return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-center px-4">
            <div className="text-brand-text-secondary mb-4">No recent test results found.</div>
            <button
                onClick={() => navigate('/student/dashboard')}
                className="text-brand-text hover:text-brand-text-secondary underline"
            >
                Back to Dashboard
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-card border border-brand-border rounded-full mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Trophy size={16} className="text-yellow-500 relative z-10" />
                        <span className="text-sm font-bold text-yellow-500 uppercase tracking-widest relative z-10">
                            {result.isDiagnostic ? 'Analysis Complete' : 'Session Complete'}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-text mb-6">
                        {result.percentage}% <span className="text-brand-text-secondary text-3xl md:text-5xl">{result.isDiagnostic ? 'Score' : 'Accuracy'}</span>
                    </h1>
                    <div className="flex items-center justify-center gap-6 mb-6">
                        <div className="text-center px-6 py-3 bg-brand-card/30 rounded-2xl border border-brand-border">
                            <p className="text-brand-text-secondary text-xs uppercase tracking-widest font-bold mb-1">Questions</p>
                            <p className="text-2xl font-bold text-brand-text">
                                <span className="text-green-500">{result.correctQuestions}</span>
                                <span className="text-brand-text-secondary">/</span>
                                {result.totalQuestions}
                            </p>
                        </div>
                        <div className="text-center px-6 py-3 bg-brand-card/30 rounded-2xl border border-brand-border">
                            <p className="text-brand-text-secondary text-xs uppercase tracking-widest font-bold mb-1">Points</p>
                            <p className="text-2xl font-bold text-blue-500">{result.score}</p>
                        </div>
                    </div>
                    <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto leading-relaxed">
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
                        className="bg-brand-card/30 border border-brand-border rounded-[2rem] p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <Target size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-text">Focus Areas</h3>
                        </div>
                        {result.analysis.weak.length > 0 ? (
                            <div className="space-y-3">
                                {result.analysis.weak.map(topic => (
                                    <div key={topic} className="flex items-center gap-3 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                        <XCircle size={18} className="text-red-500 shrink-0" />
                                        <span className="font-bold text-red-400">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-brand-text-secondary">No significant weak areas detected. Keep it up!</p>
                        )}
                    </motion.div>

                    {/* Strong Areas */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-brand-card/30 border border-brand-border rounded-[2rem] p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <TrendingUp size={24} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-text">Strong Points</h3>
                        </div>
                        {result.analysis.strong.length > 0 ? (
                            <div className="space-y-3">
                                {result.analysis.strong.map(topic => (
                                    <div key={topic} className="flex items-center gap-3 p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                        <span className="font-bold text-green-400">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-brand-text-secondary">Keep practicing to build strong points!</p>
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
                        <h2 className="text-3xl font-bold tracking-tight mb-8 text-brand-text">Performance Breakdown</h2>
                        <div className="bg-brand-card/20 border border-brand-border rounded-[2rem] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-brand-border bg-brand-secondary/5">
                                            <th className="p-6 font-bold text-brand-text-secondary text-xs uppercase tracking-widest">Question</th>
                                            <th className="p-6 font-bold text-brand-text-secondary text-xs uppercase tracking-widest">Type</th>
                                            <th className="p-6 font-bold text-brand-text-secondary text-xs uppercase tracking-widest">Difficulty</th>
                                            <th className="p-6 font-bold text-brand-text-secondary text-xs uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {result.questions.map((q) => (
                                            <tr key={q._id} className="hover:bg-brand-secondary/5 transition-colors">
                                                <td className="p-6 font-medium text-brand-text">{q.title}</td>
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
                    <h2 className="text-3xl font-bold tracking-tight mb-8 text-brand-text">
                        {result.isDiagnostic ? 'New 7-Day Improvement Plan' : 'Current 7-Day Journey'}
                    </h2>
                    <div className="space-y-4">
                        {result.plan.map((day, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                                className="group bg-brand-card/30 border border-brand-border rounded-[2rem] p-8 hover:border-brand-border/50 transition-all"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="shrink-0 flex flex-col items-center justify-center min-w-[80px]">
                                        <div className="w-12 h-12 bg-brand-secondary/10 border border-brand-border rounded-xl flex items-center justify-center font-black text-brand-text-secondary group-hover:bg-brand-text group-hover:text-brand-bg transition-all mb-2">
                                            {idx + 1}
                                        </div>
                                        <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">{day.dayName}</p>
                                    </div>

                                    <div className="flex-grow space-y-3">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-brand-text mb-1">Focus: {day.topic}</h3>
                                            <p className="text-xs text-brand-text-secondary font-medium">Daily tasks designed to improve your understanding.</p>
                                        </div>
                                        {day.tasks.map((task, tIdx) => (
                                            <div key={tIdx} className="flex items-center gap-4 p-3 bg-brand-bg/40 border border-brand-border rounded-xl">
                                                <div className="p-1.5 bg-brand-secondary/10 rounded-lg text-brand-text-secondary">
                                                    {task.type === 'READ' ? <BookOpen size={14} /> :
                                                        task.type === 'PRACTICE_MCQ' ? <Zap size={14} /> :
                                                            <Code size={14} />}
                                                </div>
                                                <span className="text-sm font-medium text-brand-text-secondary">{task.description}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={() => navigate(day.link)}
                                            className="px-8 py-3 bg-brand-text text-brand-bg font-black rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                                        >
                                            Start
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="text-brand-text-secondary hover:text-brand-text font-bold transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestResult;
