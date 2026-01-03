import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TOPICS_DATA from '../../utils/topicsData';
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
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const CustomTestBuilder = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [config, setConfig] = useState({
        numQuestions: 5,
        duration: 30, // Estimated duration, will be recalculated by backend
        difficulty: 'medium',
        type: 'mixed' // mcq, coding, mixed
    });
    const [loading, setLoading] = useState(true);

    // Dynamic Options based on Type
    const getQuestionOptions = () => {
        switch (config.type) {
            case 'mcq': return [5, 10, 20];
            case 'coding': return [2, 3, 5];
            case 'mixed': return [10, 20, 30];
            default: return [5, 10, 20];
        }
    };

    useEffect(() => {
        // Load topics from static data directly
        setTopics(Object.keys(TOPICS_DATA));
        setLoading(false);
    }, []);

    // Reset numQuestions when type changes to ensure valid selection
    useEffect(() => {
        const options = getQuestionOptions();
        if (!options.includes(config.numQuestions)) {
            setConfig(prev => ({ ...prev, numQuestions: options[0] }));
        }
    }, [config.type]);

    const toggleTopic = (e) => {
        const value = e.target.value;
        if (!value) return;
        setSelectedTopics(prev =>
            prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
        );
        e.target.value = ""; // Reset selector
    };

    const removeTopic = (topic) => {
        setSelectedTopics(prev => prev.filter(t => t !== topic));
    };

    const handleCreate = async () => {
        if (selectedTopics.length === 0) {
            toast.error('Please select at least one topic');
            return;
        }
        try {
            const { data } = await api.post('/student/test/custom', {
                topics: selectedTopics,
                ...config
            });
            navigate(`/student/test/${data._id}`);
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Failed to generate test. Make sure enough questions exist for selected topics.';
            toast.error(message);
        }
    };

    if (loading) return (
        <Loader fullScreen />
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
                    <p className="text-zinc-500 text-lg">Taylor your practice session by selecting specific topics, difficulty, and question type.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Topic Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Zap className="text-yellow-500" size={20} />
                                Select Topics
                            </h2>

                            {/* Topic Dropdown */}
                            <div className="mb-6 relative">
                                <select
                                    onChange={toggleTopic}
                                    className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-white appearance-none cursor-pointer focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select a topic to add...</option>
                                    {topics.map(topic => (
                                        <option key={topic} value={topic} disabled={selectedTopics.includes(topic)}>
                                            {topic}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                    ▼
                                </div>
                            </div>

                            {/* Selected Tags */}
                            <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
                                {selectedTopics.length > 0 ? (
                                    selectedTopics.map(topic => (
                                        <button
                                            key={topic}
                                            onClick={() => removeTopic(topic)}
                                            className="px-4 py-2 rounded-full bg-white text-black font-bold text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors group"
                                        >
                                            {topic}
                                            <div className="bg-black/10 rounded-full p-0.5 group-hover:bg-black/20">
                                                <Zap size={10} className="rotate-45" />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-zinc-600 italic">No topics selected yet.</p>
                                )}
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
                                {/* Question Type */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Type</label>
                                    <div className="flex gap-2">
                                        {['mcq', 'coding', 'mixed'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setConfig({ ...config, type })}
                                                className={`flex-1 py-3 rounded-xl border text-sm font-bold uppercase transition-all ${config.type === type ? 'bg-white border-white text-black' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Questions</label>
                                    <div className="flex gap-2">
                                        {getQuestionOptions().map(n => (
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
