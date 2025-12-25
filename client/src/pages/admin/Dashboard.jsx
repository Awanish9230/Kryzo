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
                    <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
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
                        <div className="h-64 w-full bg-gradient-to-t from-blue-500/5 to-transparent border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                            <BarChart2 className="w-20 h-20 text-blue-500 opacity-10" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-zinc-600 font-medium text-sm">Analytics engine loading...</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                        <div className="space-y-3">
                            <QuickActionLink label="Manage Questions" href="/admin/questions" />
                            <QuickActionLink label="Bulk Upload" href="/admin/questions/bulk" />
                            <QuickActionLink label="Documentation" href="/admin/documentation" />
                            <QuickActionLink label="User Management" href="/admin/users" />
                            <QuickActionLink label="Global Reports" href="/admin/reports" />
                            <QuickActionLink label="Platform Settings" href="/admin/settings" />
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
