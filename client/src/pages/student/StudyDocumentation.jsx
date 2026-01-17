import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, Clock, CheckCircle } from 'lucide-react';
import Loader from '../../components/Loader';

const StudyDocumentation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
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
        <Loader fullScreen />
    );

    if (!doc) return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-2xl font-bold mb-4 text-brand-text">Documentation not found</h1>
            <button onClick={() => navigate(-1)} className="text-blue-500 font-bold">Go Back</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text transition-colors mb-8 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                            {doc.topic}
                        </span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-6 text-brand-text">{doc.title}</h1>
                    <div className="flex items-center gap-6 text-brand-text-secondary text-sm">
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

                <div className="bg-brand-card/30 border border-brand-border rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm">
                    <div className="prose prose-invert prose-brand max-w-none">
                        <div className="whitespace-pre-wrap text-brand-text-secondary leading-relaxed text-lg">
                            {doc.content}
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-bold mb-1 text-brand-text">Mark as completed?</h3>
                            <p className="text-brand-text-secondary text-sm">Keep track of your learning progress.</p>
                        </div>
                        <button className="flex items-center gap-2 px-8 py-4 bg-brand-text text-brand-bg font-black rounded-2xl hover:opacity-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
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
