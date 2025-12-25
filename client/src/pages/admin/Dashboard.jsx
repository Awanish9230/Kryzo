import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import {
    Users,
    HelpCircle,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    TrendingUp,
    BarChart2
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">Admin Console</h1>
                        <p className="text-zinc-500">Platform overview and system metrics.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2">
                            System Logs
                            <ArrowUpRight size={16} className="text-zinc-500" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <AdminStatCard label="Total Students" value={stats?.totalUsers || 0} icon={<Users className="text-blue-500" />} />
                    <AdminStatCard label="Question Bank" value={stats?.totalQuestions || 0} icon={<HelpCircle className="text-purple-500" />} />
                    <AdminStatCard label="Published" value={stats?.publishedQuestions || 0} icon={<CheckCircle2 className="text-green-500" />} />
                    <AdminStatCard label="Recent Submissions" value={12} icon={<Clock className="text-yellow-500" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Question Distribution */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                                    <BarChart2 size={24} />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Question Bank Distribution</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Type & Difficulty */}
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">By Type</h3>
                                        <div className="space-y-4">
                                            {Object.entries(stats?.breakdown?.type || {}).map(([type, count]) => (
                                                <div key={type} className="space-y-2">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span className="text-zinc-400">{type}</span>
                                                        <span className="text-white">{count}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: stats.totalQuestions > 0 ? `${(count / stats.totalQuestions) * 100}%` : '0%' }}
                                                            className={`h-full ${type === 'CODING' ? 'bg-blue-500' : type === 'MCQ' ? 'bg-purple-500' : 'bg-green-500'}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">By Difficulty</h3>
                                        <div className="flex gap-2">
                                            {['easy', 'medium', 'hard'].map((diff) => {
                                                const count = stats?.breakdown?.difficulty[diff] || 0;
                                                const percentage = stats?.totalQuestions ? (count / stats.totalQuestions) * 100 : 0;
                                                return (
                                                    <div key={diff} className="flex-1 p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                                                        <p className={`text-[10px] font-bold uppercase mb-1 ${diff === 'easy' ? 'text-green-500' : diff === 'medium' ? 'text-yellow-500' : 'text-red-500'}`}>{diff}</p>
                                                        <p className="text-2xl font-bold">{count}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Topics */}
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Top Topics</h3>
                                    <div className="space-y-3">
                                        {stats?.breakdown?.topics?.map((topic, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 flex items-center justify-center bg-zinc-950 border border-white/10 rounded-lg text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">{topic.name}</span>
                                                </div>
                                                <span className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-full text-[10px] font-bold text-zinc-500 group-hover:text-white transition-all">
                                                    {topic.count} qns
                                                </span>
                                            </div>
                                        ))}
                                        {(!stats?.breakdown?.topics || stats?.breakdown?.topics.length === 0) && (
                                            <p className="text-zinc-600 text-sm text-center py-8">No topics added yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Growth */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <TrendingUp className="text-blue-500" />
                                    Growth Analytics
                                </h2>
                                <select className="bg-white/5 border border-white/10 rounded-lg text-xs font-bold p-2 text-zinc-400 focus:outline-none">
                                    <option>Last 30 Days</option>
                                    <option>Last 7 Days</option>
                                </select>
                            </div>
                            <div className="h-48 w-full bg-gradient-to-t from-blue-500/5 to-transparent border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                <BarChart2 className="w-20 h-20 text-blue-500 opacity-10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-zinc-600 font-medium text-sm">Real-time tracking enabled</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm self-start">
                        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                        <div className="space-y-3">
                            <QuickActionLink label="Manage Questions" href="/admin/questions" />
                            <QuickActionLink label="Bulk Upload" href="/admin/questions/bulk" />
                            <QuickActionLink label="Documentation" href="/admin/documentation" />
                            <QuickActionLink label="User Management" href="/admin/users" />
                            <QuickActionLink label="Global Reports" href="/admin/reports" />
                            <QuickActionLink label="Settings" href="/admin/settings" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminStatCard = ({ label, value, icon }) => (
    <div className="bg-zinc-900 border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white transition-all group-hover:text-black">
                {icon}
            </div>
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Global Stat</span>
        </div>
        <h3 className="text-zinc-500 text-xs font-medium mb-1">{label}</h3>
        <p className="text-3xl font-bold tracking-tighter">{value}</p>
    </div>
);

const QuickActionLink = ({ label, href }) => (
    <Link to={href} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white hover:text-black transition-all group">
        <span className="font-bold text-sm tracking-tight">{label}</span>
        <ArrowUpRight size={18} className="text-zinc-600 group-hover:text-black" />
    </Link>
);

export default AdminDashboard;
