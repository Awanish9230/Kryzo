import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
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
    const { theme } = useTheme();
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
        <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto text-brand-text">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">Question Reports</h1>
                        <p className="text-brand-text-secondary">Review and resolve issues flagged by students.</p>
                    </div>

                    <div className="flex bg-brand-card/30 p-1 rounded-2xl border border-brand-border">
                        {['pending', 'reviewed', 'dismissed'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-brand-text text-brand-bg shadow-lg' : 'text-brand-text-secondary hover:text-brand-text'
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
                                className="bg-brand-card/30 border border-brand-border rounded-[2rem] p-8 hover:bg-brand-card/50 transition-all group"
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
                                            <span className="text-brand-text-secondary text-[9px] font-black uppercase tracking-widest">
                                                {report.questionId?.type}
                                            </span>
                                            <div className="h-3 w-px bg-brand-border" />
                                            <span className="text-brand-text-secondary text-[10px] font-bold">
                                                Reported by {report.userId?.name}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-brand-text mb-4 group-hover:text-blue-400 transition-colors">
                                            {report.questionId?.title}
                                        </h3>

                                        <div className="bg-brand-bg/40 border border-brand-border rounded-2xl p-6 flex items-start gap-4">
                                            <MessageSquare size={18} className="text-brand-text-secondary shrink-0 mt-1" />
                                            <div>
                                                <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest block mb-2">Reason for report</span>
                                                <p className="text-brand-text-secondary/80 text-sm leading-relaxed italic">
                                                    "{report.reason}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-64 shrink-0 flex flex-col gap-3 justify-center">
                                        <Link
                                            to={`/admin/questions/edit/${report.questionId?._id}`}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-brand-text text-brand-bg text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all"
                                        >
                                            <ExternalLink size={14} />
                                            Edit Question
                                        </Link>

                                        {report.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(report._id, 'reviewed')}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-brand-secondary/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-secondary/20 transition-all border border-green-500/10"
                                                >
                                                    <CheckCircle size={14} />
                                                    Mark Reviewed
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-brand-secondary/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-secondary/20 transition-all border border-red-500/10"
                                                >
                                                    <XCircle size={14} />
                                                    Dismiss
                                                </button>
                                            </>
                                        )}

                                        <div className="mt-2 flex items-center justify-center gap-2 text-brand-text-secondary">
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
                        <div className="text-center py-20 bg-brand-card/30 rounded-[3rem] border border-dashed border-brand-border">
                            <CheckCircle size={40} className="text-brand-text-secondary mx-auto mb-4" />
                            <h3 className="text-brand-text-secondary font-bold">No {filter} reports found.</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportedQuestions;
