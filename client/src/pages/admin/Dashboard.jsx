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
    BarChart2,
    Sparkles,
    AlertCircle,
    Zap
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [isStandardizing, setIsStandardizing] = useState(false);
    const { onlineUsers } = useSocket();

    const fetchStats = async () => {
        try {
            const [statsRes, activityRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/analytics/users')
            ]);

            setStats({
                ...statsRes.data,
                activity: activityRes.data // { dau, wau, mau }
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleAutoFill = async () => {
        setIsAutoFilling(true);
        try {
            await api.post('/admin/questions/auto-fill');
            toast.success('Autonomous gap-filling complete!');
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Auto-fill failed');
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleStandardize = async () => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-zinc-900 border border-white/10 shadow-2xl rounded-[2rem] pointer-events-auto flex flex-col overflow-hidden`}>
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Neural Standardization</h3>
                            <p className="text-zinc-500 text-sm">Choose audit intensity for the question bank.</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                runStandardization(true);
                            }}
                            className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white group-hover:text-blue-400">Deep Audit (Aggressive)</span>
                                <TrendingUp size={14} className="text-zinc-600" />
                            </div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">Rewrites descriptions & fixes all test cases (3 Public / 7 Hidden).</p>
                        </button>
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                runStandardization(false);
                            }}
                            className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-green-500/10 hover:border-green-500/20 transition-all group"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white group-hover:text-green-400">Quick Repair (Safe)</span>
                                <CheckCircle2 size={14} className="text-zinc-600" />
                            </div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">Only fixes questions with incorrect test case counts.</p>
                        </button>
                    </div>
                </div>
                <div className="bg-zinc-950 p-4 flex justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-6 py-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    const runStandardization = async (deepAudit) => {
        setIsStandardizing(true);
        const loadingToast = toast.loading(`${deepAudit ? 'Deep Audit' : 'Quick Repair'} in progress...`);
        try {
            const { data } = await api.post('/admin/questions/standardize', { force: deepAudit });
            toast.success(data.message, { id: loadingToast });
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Standardization failed', { id: loadingToast });
        } finally {
            setIsStandardizing(false);
        }
    };

    if (loading) return (
        <Loader fullScreen />
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
                                            {stats?.breakdown?.type && Object.entries(stats.breakdown.type).map(([type, count]) => (
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
                                                const count = stats?.breakdown?.difficulty?.[diff] || 0;
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

                        {/* Real-time Activity Stats */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <TrendingUp className="text-blue-500" />
                                    Live Activity
                                </h2>
                                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-xs font-bold animate-pulse">
                                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                                    Live
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Online Users</p>
                                    <p className="text-2xl font-bold text-white flex items-center gap-2">
                                        {onlineUsers?.length || 0}
                                        <span className="text-xs font-normal text-zinc-500">active now</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Daily Active</p>
                                    <p className="text-2xl font-bold text-white flex items-center gap-2">
                                        {stats?.activity?.dau || 0}
                                        <span className="text-xs font-normal text-zinc-500">today</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Weekly Active Users</span>
                                    <span className="font-bold">{stats?.activity?.wau || 0}</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: '100%' }} />
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Monthly Active Users</span>
                                    <span className="font-bold">{stats?.activity?.mau || 0}</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Question Bank Health (Gaps) */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm border-yellow-500/20">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <AlertCircle className="text-yellow-500" />
                                    Coverage Gaps
                                </h2>
                                <button
                                    onClick={handleAutoFill}
                                    disabled={isAutoFilling}
                                    className="p-2 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all disabled:opacity-50"
                                    title="Auto-fill questions using AI"
                                >
                                    {isAutoFilling ? <div className="w-[18px] h-[18px] border-2 border-zinc-500 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} className="text-yellow-500" />}
                                </button>
                                <button
                                    onClick={handleStandardize}
                                    disabled={isStandardizing}
                                    className="p-2 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all disabled:opacity-50 ml-2"
                                    title="Standardize existing coding test cases (3 Public / 7 Hidden)"
                                >
                                    {isStandardizing ? <div className="w-[18px] h-[18px] border-2 border-zinc-500 border-t-white rounded-full animate-spin" /> : <Zap size={18} className="text-blue-500" />}
                                </button>
                            </div>
                            <p className="text-xs text-zinc-500 mb-6">The following subtopics have low question coverage. You can use autonomous AI to fill these gaps.</p>
                            <div className="space-y-3">
                                {stats?.gaps?.map((gap, idx) => (
                                    <div key={idx} className="p-3 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-between">
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-bold text-zinc-600 truncate uppercase tracking-tighter">{gap.topic}</p>
                                            <p className="text-sm font-bold text-zinc-300 truncate">{gap.subtopic}</p>
                                        </div>
                                        <div className="text-right ml-4 shrink-0">
                                            <p className="text-xs font-black text-yellow-500/80">{gap.count} / 5</p>
                                            <div className="w-12 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-yellow-500/50" style={{ width: `${(gap.count / 5) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.gaps || stats?.gaps.length === 0) && (
                                    <p className="text-zinc-600 text-xs text-center py-4">Great! All topics are well covered.</p>
                                )}
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
