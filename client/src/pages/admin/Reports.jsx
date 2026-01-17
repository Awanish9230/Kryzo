import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
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
    const { theme } = useTheme();
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
        <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto text-brand-text">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-3 text-brand-text-secondary hover:text-brand-text bg-brand-secondary/10 border border-brand-border rounded-2xl transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Question Reports</h1>
                            <p className="text-brand-text-secondary text-sm mt-1">Detailed matrix of question distribution across the platform.</p>
                        </div>
                    </div>
                    <button className="px-5 py-2.5 bg-brand-card border border-brand-border rounded-xl text-sm font-bold text-brand-text-secondary hover:text-brand-text transition-all flex items-center gap-2">
                        <Download size={16} />
                        Export Data
                    </button>
                </header>

                <div className="bg-brand-card/30 border border-brand-border rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-bg/[0.02] border-b border-brand-border">
                                    <th className="px-8 py-6 text-xs font-bold text-brand-text-secondary uppercase tracking-widest sticky left-0 bg-brand-bg z-10 w-64 border-r border-brand-border">Topic Name</th>
                                    <th colSpan="3" className="px-8 py-4 text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] text-center border-r border-brand-border">MCQ Breakdown</th>
                                    <th colSpan="3" className="px-8 py-4 text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em] text-center border-r border-brand-border">Coding Breakdown</th>
                                    <th className="px-8 py-6 text-xs font-bold text-brand-text-secondary/70 uppercase tracking-widest text-center">Grand Total</th>
                                </tr>
                                <tr className="bg-brand-secondary/5 border-b border-brand-border text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">
                                    <th className="px-8 py-4 sticky left-0 bg-brand-bg z-10 border-r border-brand-border"></th>
                                    <th className="px-6 py-4 text-center">Easy</th>
                                    <th className="px-6 py-4 text-center">Med</th>
                                    <th className="px-6 py-4 text-center border-r border-brand-border text-blue-400">Total</th>
                                    <th className="px-6 py-4 text-center text-brand-text-secondary">Easy</th>
                                    <th className="px-6 py-4 text-center text-brand-text-secondary">Med</th>
                                    <th className="px-6 py-4 text-center border-r border-brand-border text-purple-400">Total</th>
                                    <th className="px-8 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
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
                                        <tr key={idx} className="hover:bg-brand-secondary/5 transition-all group">
                                            <td className="px-8 py-5 sticky left-0 bg-brand-bg group-hover:bg-brand-card/50 transition-colors z-10 border-r border-brand-border">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-50" />
                                                    <span className="text-sm font-bold text-brand-text-secondary/80 group-hover:text-brand-text">{topic._id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center text-xs text-brand-text-secondary">{mcqEasy}</td>
                                            <td className="px-6 py-5 text-center text-xs text-brand-text-secondary">{mcqMed}</td>
                                            <td className="px-6 py-5 text-center text-sm font-black text-blue-500 bg-blue-500/[0.02] border-r border-brand-border">{mcqTotal}</td>
                                            <td className="px-6 py-5 text-center text-xs text-brand-text-secondary">{codingEasy}</td>
                                            <td className="px-6 py-5 text-center text-xs text-brand-text-secondary">{codingMed}</td>
                                            <td className="px-6 py-5 text-center text-sm font-black text-purple-500 bg-purple-500/[0.02] border-r border-brand-border">{codingTotal}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="px-4 py-1.5 bg-brand-secondary/10 border border-brand-border rounded-full text-xs font-black text-brand-text group-hover:bg-brand-text group-hover:text-brand-bg transition-all">
                                                    {topic.total}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {reportData.length === 0 && (
                            <div className="py-20 text-center text-brand-text-secondary">
                                <FileText size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="font-medium">No report data available.</p>
                                <p className="text-xs mt-1">Start by adding some questions to the bank.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Weakest Topics */}
                    <div className="bg-brand-card/30 border border-brand-border rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-red-500/10 rounded-2xl">
                                <Triangle size={20} className="text-red-500 rotate-180" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-text">Critical Weak Topics</h3>
                                <p className="text-brand-text-secondary text-[10px] font-black uppercase tracking-widest mt-0.5">Lowest Accuracy Rate</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {painPoints.weakTopics.map((topic, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-brand-bg/40 rounded-2xl border border-brand-border group hover:border-red-500/20 transition-all">
                                    <div>
                                        <p className="text-sm font-bold text-brand-text-secondary group-hover:text-brand-text transition-colors">{topic.topic || 'Uncategorized'}</p>
                                        <p className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-widest">{topic.totalQuestions} Questions Analyzed</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-red-500">{topic.accuracy.toFixed(1)}%</p>
                                        <p className="text-[9px] text-brand-text-secondary font-black uppercase tracking-widest">Accuracy</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hardest Questions */}
                    <div className="bg-brand-card/30 border border-brand-border rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                <AlertCircle size={20} className="text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-text">Highest Failure Rate</h3>
                                <p className="text-brand-text-secondary text-[10px] font-black uppercase tracking-widest mt-0.5">Most Failed Questions</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {painPoints.hardestQuestions.slice(0, 5).map((q, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-brand-bg/40 rounded-2xl border border-brand-border group hover:border-yellow-500/20 transition-all">
                                    <div className="max-w-[70%]">
                                        <p className="text-sm font-bold text-brand-text-secondary group-hover:text-brand-text truncate transition-colors">{q.title}</p>
                                        <p className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-widest">{q.type} • {q.difficulty}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-yellow-500">{q.failureRate.toFixed(1)}%</p>
                                        <p className="text-[9px] text-brand-text-secondary font-black uppercase tracking-widest">Fail Rate</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-brand-card border border-brand-border rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                            <Flag size={160} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-brand-text-secondary text-xs font-bold uppercase tracking-widest mb-1">User Feedback</h3>
                            <p className="text-sm text-brand-text-secondary/80 max-w-xs">Review questions flagged by students for quality issues.</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/questions/reports')}
                            className="relative z-10 p-4 bg-blue-600 text-white border border-blue-500/20 rounded-2xl hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            View Reports
                        </button>
                    </div>

                    <div className="p-8 bg-brand-card border border-brand-border rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                            <BarChart3 size={160} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-brand-text-secondary text-xs font-bold uppercase tracking-widest mb-1">Content Needs</h3>
                            <p className="text-sm text-brand-text-secondary/80 max-w-xs">Analyze topics with low question volume or high demand.</p>
                        </div>
                        <button className="relative z-10 p-4 bg-brand-secondary/5 border border-brand-border rounded-2xl hover:bg-brand-text hover:text-brand-bg transition-all text-brand-text">
                            View Trends
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
