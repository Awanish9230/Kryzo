import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import {
    Zap,
    Settings2,
    Layers,
    Clock,
    ArrowRight,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const CustomTestBuilder = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [config, setConfig] = useState({
        numQuestions: 10,
        duration: 30,
        difficulty: 'medium'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const { data } = await api.get('/student/topics');
                setTopics(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchTopics();
    }, []);

    const toggleTopic = (topic) => {
        setSelectedTopics(prev =>
            prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
        );
    };

    const handleCreate = async () => {
        if (selectedTopics.length === 0) {
            alert('Please select at least one topic');
            return;
        }
        try {
            const { data } = await api.post('/student/test/custom', {
                topics: selectedTopics,
                ...config
            });
            navigate(`/student/test/${data._id}`);
        } catch (err) {
            alert('Failed to generate test. Make sure enough questions exist for selected topics.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Layers size={24} />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Custom Challenge</h1>
                    </div>
                    <p className="text-zinc-500 text-lg">Taylor your practice session by selecting specific topics and difficulty.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Topic Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Zap className="text-yellow-500" size={20} />
                                Select Topics
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {topics.map(topic => (
                                    <button
                                        key={topic}
                                        onClick={() => toggleTopic(topic)}
                                        className={`p-4 rounded-2xl border text-sm font-bold transition-all text-left flex items-center justify-between group ${selectedTopics.includes(topic)
                                                ? 'bg-white border-white text-black'
                                                : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/20'
                                            }`}
                                    >
                                        <span className="truncate">{topic}</span>
                                        {selectedTopics.includes(topic) && <CheckCircle2 size={16} />}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right: Configuration */}
                    <div className="space-y-6">
                        <section className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm sticky top-28">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                                <Settings2 className="text-blue-500" size={20} />
                                Configuration
                            </h2>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Questions</label>
                                    <div className="flex gap-2">
                                        {[5, 10, 20].map(n => (
                                            <button
                                                key={n}
                                                onClick={() => setConfig({ ...config, numQuestions: n })}
                                                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${config.numQuestions === n ? 'bg-white border-white text-black' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white'
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Duration (Mins)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                                            value={config.duration}
                                            onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Difficulty</label>
                                    <select
                                        className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
                                        value={config.difficulty}
                                        onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleCreate}
                                        className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 group"
                                    >
                                        Generate Test
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <p className="mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-1">
                                        <AlertCircle size={10} />
                                        Requires question availability
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomTestBuilder;
