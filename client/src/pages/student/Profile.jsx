import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import {
    User,
    Award,
    Target,
    TrendingUp,
    Clock,
    CheckCircle2,
    Trophy,
    Zap
} from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/student/profile');
            setProfile(data);
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

    if (!profile) return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <p className="text-zinc-500">Unable to load profile</p>
            </div>
        </div>
    );

    const levelColors = {
        'Beginner': 'from-zinc-500 to-zinc-600',
        'Intermediate': 'from-blue-500 to-blue-600',
        'Advanced': 'from-purple-500 to-purple-600',
        'Expert': 'from-yellow-500 to-yellow-600'
    };

    const levelIcons = {
        'Beginner': <Target size={24} />,
        'Intermediate': <Zap size={24} />,
        'Advanced': <Award size={24} />,
        'Expert': <Trophy size={24} />
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <User size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">{profile.user.name}</h1>
                            <p className="text-zinc-500">{profile.user.email}</p>
                        </div>
                    </div>
                    {profile.user.collegeId && (
                        <p className="text-sm text-zinc-600 font-mono">College ID: {profile.user.collegeId}</p>
                    )}
                </header>

                {/* Level Badge & Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {/* Level Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="md:col-span-2 bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm relative overflow-hidden"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${levelColors[profile.level]} opacity-10`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-4 bg-gradient-to-br ${levelColors[profile.level]} rounded-2xl text-white`}>
                                    {levelIcons[profile.level]}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Level</p>
                                    <h2 className="text-3xl font-bold tracking-tight">{profile.level}</h2>
                                </div>
                            </div>
                            <p className="text-zinc-400 text-sm">
                                {profile.level === 'Beginner' && 'Keep practicing to reach Intermediate!'}
                                {profile.level === 'Intermediate' && 'Great progress! Aim for Advanced level.'}
                                {profile.level === 'Advanced' && 'Excellent work! Expert level is within reach.'}
                                {profile.level === 'Expert' && 'Outstanding! You\'re at the top of your game.'}
                            </p>
                        </div>
                    </motion.div>

                    {/* Tests Taken */}
                    <StatCard
                        icon={<CheckCircle2 className="text-green-500" />}
                        label="Tests Taken"
                        value={profile.stats?.testsTaken || profile.testsTaken}
                        delay={0.1}
                    />

                    {/* Questions Solved - NEW */}
                    <StatCard
                        icon={<Target className="text-purple-500" />} // Changed Icon
                        label="Questions Solved"
                        value={profile.stats?.totalQuestionsSolved || 0}
                        delay={0.15}
                    />

                    {/* Average Score */}
                    <StatCard
                        icon={<TrendingUp className="text-blue-500" />}
                        label="Avg Score"
                        value={`${profile.stats?.averageScore || profile.averageScore}%`}
                        delay={0.2}
                    />
                </div>

                {/* Percentile Ranking */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-[2rem] p-8 mb-12"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Your Ranking</p>
                            <h3 className="text-2xl font-bold mb-2">
                                You're performing better than <span className="text-blue-500">{profile.percentile}%</span> of users
                            </h3>
                            <p className="text-zinc-500 text-sm">Based on your average score compared to all platform users</p>
                        </div>
                        <div className="hidden md:block p-6 bg-blue-500/10 rounded-2xl">
                            <Trophy size={48} className="text-blue-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Topic Mastery */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Topic Mastery</h2>
                    {profile.topicMastery.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.topicMastery.map((topic, idx) => (
                                <motion.div
                                    key={topic.topic}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.05 }}
                                    className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-white text-lg">{topic.topic}</h3>
                                        <span className={`text-xl font-bold ${topic.accuracy >= 80 ? 'text-green-500' : topic.accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
                                            }`}>
                                            {topic.accuracy}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
                                        <div
                                            className={`h-2 rounded-full transition-all ${topic.accuracy >= 80 ? 'bg-green-500' : topic.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${topic.accuracy}%` }}
                                        ></div>
                                    </div>

                                    {/* Breakdown */}
                                    {topic.breakdown && (
                                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Easy</p>
                                                <p className={`font-bold ${topic.breakdown.easy.accuracy >= 80 ? 'text-green-500' : 'text-zinc-400'}`}>{topic.breakdown.easy.accuracy}%</p>
                                            </div>
                                            <div className="text-center border-l border-r border-white/5">
                                                <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Medium</p>
                                                <p className={`font-bold ${topic.breakdown.medium.accuracy >= 80 ? 'text-yellow-500' : 'text-zinc-400'}`}>{topic.breakdown.medium.accuracy}%</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Hard</p>
                                                <p className={`font-bold ${topic.breakdown.hard.accuracy >= 80 ? 'text-red-500' : 'text-zinc-400'}`}>{topic.breakdown.hard.accuracy}%</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center">
                            <p className="text-zinc-500">No topic data available yet. Take more tests to see your mastery!</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                {profile.recentAttempts && profile.recentAttempts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Activity</h2>
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-sm">
                            <div className="divide-y divide-white/5">
                                {profile.recentAttempts.map((attempt, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + idx * 0.1 }}
                                        className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-xl">
                                                <Clock size={20} className="text-zinc-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">Test Completed</p>
                                                <p className="text-xs text-zinc-600">
                                                    {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{attempt.score}</p>
                                            <p className="text-xs text-zinc-600">Score</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm hover:border-white/10 transition-all"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-2xl">
                {icon}
            </div>
        </div>
        <h3 className="text-zinc-500 text-xs font-medium mb-1 uppercase tracking-widest">{label}</h3>
        <p className="text-3xl font-bold tracking-tighter">{value}</p>
    </motion.div>
);

export default Profile;
