import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    XCircle,
    ExternalLink,
    Clock,
    Filter,
    MessageSquare
} from 'lucide-react';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';

const ReportedQuestions = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const { data } = await api.get('/admin/questions/reports');
            setReports(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/admin/questions/reports/${id}`, { status });
            setReports(reports.map(r => r._id === id ? { ...r, status } : r));
            toast.success(`Report ${status}`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status');
        }
    };

    const filteredReports = reports.filter(r => r.status === filter);

    if (loading) return (
        <Loader fullScreen />
    );

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">Question Reports</h1>
                        <p className="text-zinc-500">Review and resolve issues flagged by students.</p>
                    </div>

                    <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
                        {['pending', 'reviewed', 'dismissed'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredReports.map((report) => (
                            <motion.div
                                key={report._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${report.questionId?.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' :
                                                report.questionId?.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-green-500/10 text-green-500'
                                                }`}>
                                                {report.questionId?.difficulty || 'N/A'}
                                            </span>
                                            <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                                                {report.questionId?.type}
                                            </span>
                                            <div className="h-3 w-px bg-white/10" />
                                            <span className="text-zinc-500 text-[10px] font-bold">
                                                Reported by {report.userId?.name}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                                            {report.questionId?.title}
                                        </h3>

                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex items-start gap-4">
                                            <MessageSquare size={18} className="text-zinc-600 shrink-0 mt-1" />
                                            <div>
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Reason for report</span>
                                                <p className="text-zinc-400 text-sm leading-relaxed italic">
                                                    "{report.reason}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-64 shrink-0 flex flex-col gap-3 justify-center">
                                        <Link
                                            to={`/admin/questions/edit/${report.questionId?._id}`}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all"
                                        >
                                            <ExternalLink size={14} />
                                            Edit Question
                                        </Link>

                                        {report.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(report._id, 'reviewed')}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all border border-green-500/10"
                                                >
                                                    <CheckCircle size={14} />
                                                    Mark Reviewed
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all border border-red-500/10"
                                                >
                                                    <XCircle size={14} />
                                                    Dismiss
                                                </button>
                                            </>
                                        )}

                                        <div className="mt-2 flex items-center justify-center gap-2 text-zinc-600">
                                            <Clock size={12} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredReports.length === 0 && (
                        <div className="text-center py-20 bg-zinc-900/30 rounded-[3rem] border border-dashed border-white/5">
                            <CheckCircle size={40} className="text-zinc-800 mx-auto mb-4" />
                            <h3 className="text-zinc-500 font-bold">No {filter} reports found.</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportedQuestions;
