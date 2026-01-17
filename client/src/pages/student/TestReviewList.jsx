import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Clock, Calendar, Award, TrendingUp, Eye, FileText } from 'lucide-react';
import Loader from '../../components/Loader';

const TestReviewList = () => {
    const { theme } = useTheme();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, DIAGNOSTIC, WEEKLY, CUSTOM

    useEffect(() => {
        fetchAttempts();
    }, []);

    const fetchAttempts = async () => {
        try {
            const { data } = await api.get('/student/attempts');
            setAttempts(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filteredAttempts = filter === 'all'
        ? attempts
        : attempts.filter(a => a.testType === filter);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (loading) return (
        <Loader fullScreen />
    );

    return (
        <div className="min-h-screen bg-brand-bg pt-24 pb-12 px-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-2 tracking-tight text-brand-text">Test Reviews</h1>
                    <p className="text-brand-text-secondary">Review your past test attempts and learn from your mistakes</p>
                </header>

                {/* Filter */}
                <div className="flex gap-3 mb-8">
                    {['all', 'DIAGNOSTIC', 'WEEKLY', 'CUSTOM'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === type
                                ? 'bg-brand-text text-brand-bg'
                                : 'bg-brand-card/30 text-brand-text-secondary hover:text-brand-text border border-brand-border'
                                }`}
                        >
                            {type === 'all' ? 'All Tests' : type.charAt(0) + type.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Attempts List */}
                {filteredAttempts.length === 0 ? (
                    <div className="bg-brand-card/30 border border-brand-border rounded-3xl p-12 text-center">
                        <FileText className="w-16 h-16 text-brand-secondary/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-brand-text">No Test Attempts Found</h3>
                        <p className="text-brand-text-secondary mb-6">
                            {filter === 'all'
                                ? 'Take a diagnostic test to get started!'
                                : `No ${filter.toLowerCase()} tests found. Try a different filter.`}
                        </p>
                        <Link
                            to="/student/test/diagnostic"
                            className="inline-block px-6 py-3 bg-brand-text text-brand-bg font-bold rounded-xl hover:opacity-90 transition-all"
                        >
                            Take Diagnostic Test
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAttempts.map((attempt, idx) => (
                            <motion.div
                                key={attempt._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    to={`/student/review/${attempt._id}`}
                                    className="block bg-brand-card/30 border border-brand-border rounded-3xl p-6 hover:border-brand-border/50 transition-all group"
                                >
                                    {/* Test Type Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${attempt.testType === 'DIAGNOSTIC' ? 'bg-blue-500/10 text-blue-500' :
                                            attempt.testType === 'WEEKLY' ? 'bg-purple-500/10 text-purple-500' :
                                                'bg-green-500/10 text-green-500'
                                            }`}>
                                            {attempt.testType}
                                        </span>
                                        <Eye className="w-5 h-5 text-brand-text-secondary group-hover:text-brand-text transition-colors" />
                                    </div>

                                    {/* Score */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-4xl font-black text-brand-text">{attempt.percentage}%</span>
                                            <span className="text-brand-text-secondary text-sm font-bold">Score</span>
                                        </div>
                                        <div className="text-sm text-brand-text-secondary">
                                            {attempt.score} points • {attempt.questionCount} questions
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="space-y-3 pt-4 border-t border-brand-border">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-brand-text-secondary" />
                                            <span className="text-brand-text-secondary">{formatDate(attempt.completedAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-4 h-4 text-brand-text-secondary" />
                                            <span className="text-brand-text-secondary">{formatTime(attempt.totalTime)}</span>
                                        </div>
                                    </div>

                                    {/* Review Button */}
                                    <div className="mt-6 pt-4 border-t border-brand-border">
                                        <div className="flex items-center justify-between text-sm font-bold text-brand-text group-hover:text-blue-500 transition-colors">
                                            <span>Review Test</span>
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestReviewList;
