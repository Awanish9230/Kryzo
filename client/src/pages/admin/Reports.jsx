import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BarChart3,
    FileText,
    Code,
    Settings,
    Download,
    AlertCircle,
    Triangle,
    Flag
} from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const Reports = () => {
    const navigate = useNavigate();
    const [reportData, setReportData] = useState([]);
    const [painPoints, setPainPoints] = useState({ hardestQuestions: [], weakTopics: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, analyticsRes] = await Promise.all([
                    api.get('/admin/detailed-stats'),
                    api.get('/admin/analytics/pain-points')
                ]);
                setReportData(statsRes.data || []);
                setPainPoints({
                    hardestQuestions: analyticsRes.data?.hardestQuestions || [],
                    weakTopics: analyticsRes.data?.weakTopics || []
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load reports data');
                setReportData([]);
                setPainPoints({ hardestQuestions: [], weakTopics: [] });
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getCount = (topicStats, type, difficulty) => {
        const stat = topicStats.find(s => s.type === type && s.difficulty === difficulty);
        return stat ? stat.count : 0;
    };

    if (loading) return (
        <Loader fullScreen />
    );

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-3 text-zinc-500 hover:text-white bg-white/5 border border-white/5 rounded-2xl transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Question Reports</h1>
                            <p className="text-zinc-500 text-sm mt-1">Detailed matrix of question distribution across the platform.</p>
                        </div>
                    </div>
                    <button className="px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-2">
                        <Download size={16} />
                        Export Data
                    </button>
                </header>

                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-500 uppercase tracking-widest sticky left-0 bg-zinc-950 z-10 w-64 border-r border-white/5">Topic Name</th>
                                    <th colSpan="3" className="px-8 py-4 text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] text-center border-r border-white/5">MCQ Breakdown</th>
                                    <th colSpan="3" className="px-8 py-4 text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em] text-center border-r border-white/5">Coding Breakdown</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-300 uppercase tracking-widest text-center">Grand Total</th>
                                </tr>
                                <tr className="bg-white/[0.01] border-b border-white/5 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                    <th className="px-8 py-4 sticky left-0 bg-zinc-950 z-10 border-r border-white/5"></th>
                                    <th className="px-6 py-4 text-center">Easy</th>
                                    <th className="px-6 py-4 text-center">Med</th>
                                    <th className="px-6 py-4 text-center border-r border-white/5 text-blue-400">Total</th>
                                    <th className="px-6 py-4 text-center text-zinc-600">Easy</th>
                                    <th className="px-6 py-4 text-center text-zinc-600">Med</th>
                                    <th className="px-6 py-4 text-center border-r border-white/5 text-purple-400">Total</th>
                                    <th className="px-8 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {reportData.map((topic, idx) => {
                                    const mcqEasy = getCount(topic.stats, 'MCQ', 'easy');
                                    const mcqMed = getCount(topic.stats, 'MCQ', 'medium');
                                    const mcqHard = getCount(topic.stats, 'MCQ', 'hard');
                                    const mcqTotal = mcqEasy + mcqMed + mcqHard;

                                    const codingEasy = getCount(topic.stats, 'CODING', 'easy');
                                    const codingMed = getCount(topic.stats, 'CODING', 'medium');
                                    const codingHard = getCount(topic.stats, 'CODING', 'hard');
                                    const codingTotal = codingEasy + codingMed + codingHard;

                                    return (
                                        <tr key={idx} className="hover:bg-white/[0.01] transition-all group">
                                            <td className="px-8 py-5 sticky left-0 bg-zinc-950 group-hover:bg-zinc-900 transition-colors z-10 border-r border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-50" />
                                                    <span className="text-sm font-bold text-zinc-300 group-hover:text-white">{topic._id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center text-xs text-zinc-500">{mcqEasy}</td>
                                            <td className="px-6 py-5 text-center text-xs text-zinc-500">{mcqMed}</td>
                                            <td className="px-6 py-5 text-center text-sm font-black text-blue-500 bg-blue-500/[0.02] border-r border-white/5">{mcqTotal}</td>
                                            <td className="px-6 py-5 text-center text-xs text-zinc-500">{codingEasy}</td>
                                            <td className="px-6 py-5 text-center text-xs text-zinc-500">{codingMed}</td>
                                            <td className="px-6 py-5 text-center text-sm font-black text-purple-500 bg-purple-500/[0.02] border-r border-white/5">{codingTotal}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-black text-white group-hover:bg-white group-hover:text-black transition-all">
                                                    {topic.total}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {reportData.length === 0 && (
                            <div className="py-20 text-center text-zinc-500">
                                <FileText size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="font-medium">No report data available.</p>
                                <p className="text-xs mt-1">Start by adding some questions to the bank.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Weakest Topics */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-red-500/10 rounded-2xl">
                                <Triangle size={20} className="text-red-500 rotate-180" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Critical Weak Topics</h3>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Lowest Accuracy Rate</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {painPoints.weakTopics.map((topic, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-red-500/20 transition-all">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{topic.topic || 'Uncategorized'}</p>
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{topic.totalQuestions} Questions Analyzed</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-red-500">{topic.accuracy.toFixed(1)}%</p>
                                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Accuracy</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hardest Questions */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                <AlertCircle size={20} className="text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Highest Failure Rate</h3>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Most Failed Questions</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {painPoints.hardestQuestions.slice(0, 5).map((q, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-yellow-500/20 transition-all">
                                    <div className="max-w-[70%]">
                                        <p className="text-sm font-bold text-zinc-300 group-hover:text-white truncate transition-colors">{q.title}</p>
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{q.type} • {q.difficulty}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-yellow-500">{q.failureRate.toFixed(1)}%</p>
                                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Fail Rate</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                            <Flag size={160} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">User Feedback</h3>
                            <p className="text-sm text-zinc-400 max-w-xs">Review questions flagged by students for quality issues.</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/questions/reports')}
                            className="relative z-10 p-4 bg-blue-600 text-white border border-blue-500/20 rounded-2xl hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            View Reports
                        </button>
                    </div>

                    <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                            <BarChart3 size={160} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Content Needs</h3>
                            <p className="text-sm text-zinc-400 max-w-xs">Analyze topics with low question volume or high demand.</p>
                        </div>
                        <button className="relative z-10 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all">
                            View Trends
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
