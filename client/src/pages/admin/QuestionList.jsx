import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Tag,
    Code,
    FileText
} from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

const QuestionList = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchQuestions();
        // eslint-disable-next-line
    }, [page, searchTerm, statusFilter, difficultyFilter, typeFilter]); // Fetch when params change

    const fetchQuestions = async () => {
        try {
            let query = `/admin/questions?pageNumber=${page}&keyword=${searchTerm}`;
            if (statusFilter) query += `&status=${statusFilter}`;
            if (difficultyFilter) query += `&difficulty=${difficultyFilter}`;
            if (typeFilter) query += `&type=${typeFilter}`;

            const { data } = await api.get(query);
            setQuestions(data.questions || []);
            setPages(data.pages || 1);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-zinc-900 border border-white/10 shadow-2xl rounded-3xl pointer-events-auto flex flex-col overflow-hidden`}>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Delete Question?</h3>
                            <p className="text-zinc-500 text-xs">This action is irreversible.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-950 p-4 flex gap-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const loadingToast = toast.loading('Deleting question...');
                            try {
                                await api.delete(`/admin/questions/${id}`);
                                setQuestions(questions.filter(q => q._id !== id));
                                toast.success('Question deleted', { id: loadingToast });
                            } catch (err) {
                                toast.error('Failed to delete', { id: loadingToast });
                            }
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    if (loading) return (
        <Loader fullScreen />
    );

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">Question Bank</h1>
                        <p className="text-zinc-500">Manage and publish your assessment content.</p>
                    </div>
                    <Link
                        to="/admin/questions/add"
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        <Plus size={20} />
                        Create Question
                    </Link>
                </header>

                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by title..."
                                className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-white/5 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-zinc-700"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1); // Reset to page 1 on search
                                }}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 bg-zinc-900 border border-white/5 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${showFilters ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <Filter size={18} />
                            Filters
                        </button>
                    </div>

                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 focus:text-white focus:outline-none focus:border-white/20 w-full"
                            >
                                <option value="">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>

                            <select
                                value={difficultyFilter}
                                onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
                                className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 focus:text-white focus:outline-none focus:border-white/20 w-full"
                            >
                                <option value="">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                                className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 focus:text-white focus:outline-none focus:border-white/20 w-full"
                            >
                                <option value="">All Types</option>
                                <option value="MCQ">MCQ</option>
                                <option value="CODING">Coding</option>
                            </select>

                            <button
                                onClick={() => {
                                    setStatusFilter('');
                                    setDifficultyFilter('');
                                    setTypeFilter('');
                                    setPage(1);
                                }}
                                className="px-4 py-2 text-zinc-500 hover:text-white text-sm font-medium transition-colors w-full text-center"
                            >
                                Reset Filters
                            </button>
                        </motion.div>
                    )}
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-4">No.</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Question</th>
                                    <th className="px-8 py-4">Type</th>
                                    <th className="px-8 py-4">Difficulty</th>
                                    <th className="px-8 py-4">Topic</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {questions.map((q, idx) => (
                                    <motion.tr
                                        key={q._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-white/[0.01] transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-black text-zinc-400">
                                                #{q.questionNumber || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter rounded-full border ${q.status === 'published'
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                                }`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold tracking-tight mb-1">{q.title}</span>
                                                <span className="text-xs text-zinc-600 font-mono">ID: {q._id.substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                {q.type === 'CODING' ? <Code size={14} className="text-purple-400" /> : <FileText size={14} className="text-blue-400" />}
                                                <span className="text-xs font-bold uppercase tracking-tight">{q.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-xs font-bold uppercase ${q.difficulty === 'hard' ? 'text-red-500' : q.difficulty === 'medium' ? 'text-yellow-500' : 'text-green-500'
                                                }`}>
                                                {q.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {q.topic && q.subtopic ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-white">{q.topic}</span>
                                                    <span className="text-[10px] text-zinc-500">→ {q.subtopic}</span>
                                                </div>
                                            ) : q.topics && q.topics.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {q.topics.slice(0, 2).map(t => (
                                                        <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-zinc-500 uppercase">{t}</span>
                                                    ))}
                                                    {q.topics.length > 2 && <span className="text-[9px] text-zinc-700 font-bold">+{q.topics.length - 2}</span>}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-700">No topic</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/questions/edit/${q._id}`} className="p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(q._id)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {pages > 1 && (
                        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-xs font-bold text-zinc-500">
                                Page {page} of {pages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pages, p + 1))}
                                disabled={page === pages}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionList;
