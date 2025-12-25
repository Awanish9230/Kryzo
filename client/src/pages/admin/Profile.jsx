import { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Mail, FileText, Code, Layout, Tag, BarChart3 } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import api from '../../utils/api';

const AdminProfile = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/my-stats');
                setStats(data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch stats', err);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const typeIcons = {
        MCQ: <FileText size={18} className="text-blue-400" />,
        CODING: <Code size={18} className="text-green-400" />,
        DEVELOPMENT: <Layout size={18} className="text-purple-400" />
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-5xl mx-auto text-white">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">Admin Profile</h1>
                    <p className="text-zinc-500">Manage your account details and view your contribution statistics.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile Details */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-32 h-32 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center text-purple-500"
                                >
                                    <User size={64} />
                                </motion.div>

                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight mb-2">{user?.name || 'Admin User'}</h2>
                                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto w-fit">
                                        <Shield size={10} />
                                        Administrator
                                    </span>
                                </div>

                                <div className="w-full pt-6 border-t border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            <Mail size={16} className="text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Email Address</p>
                                            <p className="text-sm font-medium text-zinc-300">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Statistics */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overall Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        <BarChart3 size={20} className="text-zinc-400" />
                                    </div>
                                </div>
                                <p className="text-4xl font-black mb-1">{loading ? '...' : stats?.totalQuestions || 0}</p>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Questions Added</p>
                            </motion.div>

                            {/* Type Breakdown */}
                            {stats?.typeStats && Object.entries(stats.typeStats).map(([type, count], index) => (
                                <motion.div
                                    key={type}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * (index + 1) }}
                                    className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-white/5 rounded-2xl">
                                            {typeIcons[type]}
                                        </div>
                                    </div>
                                    <p className="text-4xl font-black mb-1">{count}</p>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{type}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Topic Breakdown */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Tag size={20} className="text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold">Contribution by Topic</h3>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            ) : stats?.topicStats?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {stats.topicStats.map((topicStat, index) => (
                                        <motion.div
                                            key={topicStat.topic}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
                                        >
                                            <span className="text-sm font-medium text-zinc-300">{topicStat.topic}</span>
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-white">
                                                {topicStat.count}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <p className="text-zinc-500 text-sm">No questions added yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
