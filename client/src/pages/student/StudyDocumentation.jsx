import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, Clock, CheckCircle } from 'lucide-react';

const StudyDocumentation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const { data } = await api.get(`/student/documentation/${id}`);
                setDoc(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    if (!doc) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-2xl font-bold mb-4">Documentation not found</h1>
            <button onClick={() => navigate(-1)} className="text-blue-500 font-bold">Go Back</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                            {doc.topic}
                        </span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-6">{doc.title}</h1>
                    <div className="flex items-center gap-6 text-zinc-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Book size={16} />
                            <span>Comprehensive Guide</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>15 min read</span>
                        </div>
                    </div>
                </header>

                <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm">
                    <div className="prose prose-invert prose-zinc max-w-none">
                        <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed text-lg">
                            {doc.content}
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Mark as completed?</h3>
                            <p className="text-zinc-500 text-sm">Keep track of your learning progress.</p>
                        </div>
                        <button className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <CheckCircle size={20} />
                            Complete Lesson
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyDocumentation;
