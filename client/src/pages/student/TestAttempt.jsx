import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Timer,
    ChevronLeft,
    ChevronRight,
    Flag,
    CheckCircle2,
    Code2,
    Play,
    Check
} from 'lucide-react';

const TestAttempt = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                let endpoint = '/student/test/diagnostic';
                if (testId && testId !== 'diagnostic') {
                    endpoint = `/student/test/${testId}`;
                }
                const { data } = await api.get(endpoint);
                setTest(data);
                setTimeLeft(data.duration * 60);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Could not start test. Please try again.');
                navigate('/student/dashboard');
            }
        };
        fetchTest();
    }, [testId, navigate]);

    useEffect(() => {
        if (timeLeft <= 0 || !test) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, test]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async () => {
        try {
            const submission = {
                testId: test._id,
                answers: Object.entries(answers).map(([qId, val]) => {
                    const q = test.questions.find(q => q._id === qId);
                    return {
                        questionId: qId,
                        [q.type === 'MCQ' ? 'selectedOption' : 'code']: val,
                        userAnswer: val // For diagnostic fallback
                    };
                })
            };
            await api.post('/student/test/submit', submission);
            navigate('/student/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to submit test');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    const currentQuestion = test.questions[currentIdx];

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <nav className="h-14 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-white font-bold tracking-tighter text-lg">KRYZO</span>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-zinc-500 font-medium text-xs uppercase tracking-widest">{test.title || 'Assessment'}</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <Timer size={14} className={timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-zinc-500'} />
                        <span className={`text-sm font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                    >
                        Finish Test
                    </button>
                </div>
            </nav>

            <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
                <aside className="w-full md:w-64 border-r border-white/5 bg-zinc-950/30 overflow-y-auto p-4 flex md:flex-col gap-2 shrink-0">
                    <div className="hidden md:block mb-4">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">Navigator</span>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                        {test.questions.map((q, idx) => (
                            <button
                                key={q._id}
                                onClick={() => setCurrentIdx(idx)}
                                className={`w-10 h-10 md:w-full md:h-auto md:px-4 md:py-3 rounded-xl flex items-center justify-center md:justify-start gap-3 transition-all shrink-0 ${currentIdx === idx
                                        ? 'bg-white text-black font-bold'
                                        : answers[q._id] !== undefined
                                            ? 'bg-zinc-800/50 text-white'
                                            : 'text-zinc-600 hover:text-zinc-300'
                                    }`}
                            >
                                <span className="text-sm">{idx + 1}</span>
                                <span className="hidden md:block text-xs truncate">
                                    {q.type === 'MCQ' ? 'Multiple Choice' : 'Coding Challenge'}
                                </span>
                                {answers[q._id] !== undefined && <Check className="hidden md:block ml-auto" size={12} />}
                            </button>
                        ))}
                    </div>
                </aside>

                <div className="flex-1 overflow-y-auto flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 md:p-12 max-w-4xl mx-auto w-full flex-1 flex flex-col"
                        >
                            <header className="mb-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest tracking-tighter">Question {currentIdx + 1}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${currentQuestion.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' : currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                                        }`}>
                                        {currentQuestion.difficulty}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-white mb-4 leading-relaxed">
                                    {currentQuestion.title}
                                </h1>
                                <div className="text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none">
                                    {currentQuestion.description}
                                </div>
                            </header>

                            <div className="mt-auto pt-10 border-t border-white/5">
                                {currentQuestion.type === 'MCQ' ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentQuestion.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswer(currentQuestion._id, idx)}
                                                className={`group p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${answers[currentQuestion._id] === idx
                                                        ? 'bg-white border-white text-black'
                                                        : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${answers[currentQuestion._id] === idx ? 'bg-black border-black text-white' : 'border-zinc-700'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="font-medium">{opt.text}</span>
                                                {answers[currentQuestion._id] === idx && <CheckCircle2 className="ml-auto" size={20} />}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
                                        <div className="bg-zinc-950 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Code2 size={16} />
                                                <span className="text-xs font-bold uppercase tracking-widest">Editor</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="px-4 py-1 bg-zinc-800 border border-white/5 rounded-lg text-[10px] font-bold text-white flex items-center gap-2 hover:bg-zinc-700 transition-all">
                                                    <Play size={12} className="text-green-500" />
                                                    Run Code
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            className="w-full h-96 p-8 bg-black text-white font-mono text-sm focus:outline-none resize-none"
                                            placeholder="// Write your solution here..."
                                            value={answers[currentQuestion._id] || ''}
                                            onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <footer className="h-20 border-t border-white/5 bg-zinc-950/50 px-8 flex items-center justify-between sticky bottom-0">
                        <button
                            type="button"
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(prev => prev - 1)}
                            className="flex items-center gap-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all font-bold text-sm"
                        >
                            <ChevronLeft size={20} />
                            Previous
                        </button>
                        <button type="button" className="flex items-center gap-2 text-zinc-600 hover:text-amber-500 transition-all font-bold text-sm">
                            <Flag size={18} />
                            Mark for Review
                        </button>
                        <button
                            type="button"
                            disabled={currentIdx === test.questions.length - 1}
                            onClick={() => setCurrentIdx(prev => prev + 1)}
                            className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2 text-sm shadow-xl"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default TestAttempt;
