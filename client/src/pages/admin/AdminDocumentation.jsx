import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import TOPICS_DATA from '../../utils/topicsData';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Book,
    Edit2
} from 'lucide-react';

const AdminDocumentation = () => {
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: null,
        topic: '',
        title: '',
        content: '', // Simple markdown text for now
        difficulty: 'Beginner'
    });

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const { data } = await api.get('/admin/documentation');
            setDocs(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/documentation', formData);
            toast.success('Documentation saved');
            fetchDocs();
            setIsEditing(false);
            resetForm();
        } catch (err) {
            toast.error('Failed to save documentation');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this documentation?')) return;
        try {
            await api.delete(`/admin/documentation/${id}`);
            setDocs(docs.filter(d => d._id !== id));
            toast.success('Deleted successfully');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleEdit = (doc) => {
        setFormData({
            id: doc._id,
            topic: doc.topic,
            title: doc.title,
            content: doc.content,
            difficulty: doc.difficulty || 'Beginner'
        });
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ id: null, topic: '', title: '', content: '', difficulty: 'Beginner' });
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">Documentation</h1>
                        <p className="text-zinc-500">Manage topic resources for student improvement plans.</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Doc
                    </button>
                </header>

                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold">
                                {formData.id ? 'Edit Documentation' : 'New Documentation'}
                            </h2>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-zinc-500 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">Topic</label>
                                    <select
                                        required
                                        className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none"
                                        value={formData.topic}
                                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                    >
                                        <option value="">Select Topic</option>
                                        {Object.keys(TOPICS_DATA).map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">Difficulty</label>
                                    <select
                                        className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none"
                                        value={formData.difficulty}
                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 ml-1">Title</label>
                                <input
                                    required
                                    placeholder="e.g., Introduction to Arrays"
                                    className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 ml-1">Content (Markdown)</label>
                                <textarea
                                    required
                                    rows={10}
                                    placeholder="# Introduction\n\nArrays are..."
                                    className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none font-mono text-sm"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                                    <Save size={20} />
                                    Save Documentation
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docs.map(doc => (
                        <div key={doc._id} className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <Book size={24} className="text-zinc-400 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(doc)}
                                        className="p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc._id)}
                                        className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2 line-clamp-1">{doc.title}</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] uppercase font-bold text-zinc-500">
                                    {doc.topic}
                                </span>
                                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/10 rounded text-[10px] uppercase font-bold">
                                    {doc.difficulty}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm line-clamp-3">
                                {doc.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentation;
