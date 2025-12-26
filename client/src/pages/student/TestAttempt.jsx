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
    Check,
    CheckCircle,
    Info,
    AlertTriangle,
    Flag as FlagIcon,
    AlertCircle,
    X
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const TestAttempt = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [visited, setVisited] = useState(new Set([0]));
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [runResults, setRunResults] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    const handleRunCode = async () => {
        const currentQ = test.questions[currentIdx];
        if (!answers[currentQ._id]) {
            alert('Please write some code first!');
            return;
        }

        setIsRunning(true);
        setRunResults(null);
        try {
            const { data } = await api.post('/compiler/run', {
                code: answers[currentQ._id],
                language: selectedLanguage === 'javascript' ? 'JavaScript' : selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1),
                questionId: currentQ._id
            });
            setRunResults(data);
        } catch (err) {
            console.error(err);
            alert('Compilation failed or server error');
        } finally {
            setIsRunning(false);
        }
    };

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

    useEffect(() => {
        if (test) {
            setVisited(prev => new Set([...prev, currentIdx]));
        }
    }, [currentIdx, test]);

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
                        userAnswer: val
                    };
                })
            };
            await api.post('/student/test/submit', submission);
            navigate('/student/test/result');
        } catch (err) {
            console.error(err);
            alert('Failed to submit test');
        }
    };

    const handleReport = async () => {
        if (!reportReason.trim()) return;
        setIsReporting(true);
        try {
            await api.post('/student/question/report', {
                questionId: currentQuestion._id,
                reason: reportReason
            });
            setShowReportModal(false);
            setReportReason('');
            alert('Question reported successfully. Thank you!');
        } catch (err) {
            console.error(err);
            alert('Failed to report question');
        } finally {
            setIsReporting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    const currentQuestion = test.questions[currentIdx];
    const mcqs = test.questions.map((q, i) => ({ ...q, originalIdx: i })).filter(q => q.type === 'MCQ');
    const coding = test.questions.map((q, i) => ({ ...q, originalIdx: i })).filter(q => q.type === 'CODING');

    const stats = {
        total: test.questions.length,
        attempted: Object.keys(answers).length,
        visited: visited.size,
        remaining: test.questions.length - Object.keys(answers).length
    };

    const QuestionButton = ({ q, idx }) => {
        const isAnswered = answers[q._id] !== undefined;
        const isVisited = visited.has(q.originalIdx);
        const isActive = currentIdx === q.originalIdx;

        let bgColor = 'bg-zinc-800 text-zinc-500 border-white/5';
        if (isActive) bgColor = 'bg-white text-black border-white shadow-lg shadow-white/10';
        else if (isAnswered) bgColor = 'bg-green-600 text-white border-green-500';
        else if (isVisited) bgColor = 'bg-amber-600 text-white border-amber-500';

        return (
            <button
                onClick={() => setCurrentIdx(q.originalIdx)}
                className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${bgColor}`}
            >
                {q.originalIdx + 1}
            </button>
        );
    };

    return (
        <div className="h-screen bg-black flex flex-col overflow-hidden">
            {/* Navbar */}
            <nav className="h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-white font-black tracking-tighter text-xl">KRYZO</span>
                    <div className="h-5 w-px bg-white/10" />
                    <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">{test.title || 'Assessment'}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-2xl">
                        <Timer size={16} className={timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-zinc-400'} />
                        <span className={`text-sm font-mono font-black ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                        title="Report Question"
                    >
                        <FlagIcon size={18} />
                    </button>
                    <div className="h-5 w-px bg-white/10" />
                    <button
                        onClick={() => setShowSummaryModal(true)}
                        className="px-5 py-1.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                    >
                        Finish Test
                    </button>
                </div>
            </nav>

            <main className="flex-1 overflow-hidden flex">
                {/* Compact Sidebar */}
                <aside className="w-72 border-r border-white/5 bg-zinc-950/50 flex flex-col shrink-0">
                    <div className="p-5 flex-1 overflow-y-auto space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <CheckCircle2 size={12} className="text-blue-500" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Multiple Choice</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {mcqs.map((q) => <QuestionButton key={q._id} q={q} />)}
                            </div>
                        </div>

                        {coding.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <Code2 size={12} className="text-purple-500" />
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Coding Challenges</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {coding.map((q) => <QuestionButton key={q._id} q={q} />)}
                                </div>
                            </div>
                        )}

                        <div className="pt-8 border-t border-white/5 space-y-3">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Legend</span>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/30" />
                                    <span className="text-[10px] text-zinc-500 font-bold">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/30" />
                                    <span className="text-[10px] text-zinc-500 font-bold">Visited</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-zinc-800/30 border border-white/5" />
                                    <span className="text-[10px] text-zinc-500 font-bold">Not Visited</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-white border border-white" />
                                    <span className="text-[10px] text-zinc-500 font-bold">Current</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col relative bg-zinc-950/20">
                    <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-10 max-w-5xl mx-auto w-full pb-32"
                            >
                                <header className="mb-12">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Question {currentIdx + 1}</span>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] ${currentQuestion.difficulty === 'hard' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                            }`}>
                                            {currentQuestion.difficulty}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-black tracking-tight text-white mb-6 leading-tight">
                                        {currentQuestion.title}
                                    </h1>
                                    <div className="text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none">
                                        {currentQuestion.description}
                                    </div>
                                </header>

                                <div className="border-t border-white/5 pt-12">
                                    {currentQuestion.type === 'MCQ' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentQuestion.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswer(currentQuestion._id, idx)}
                                                    className={`group p-6 rounded-3xl border text-left transition-all flex items-center gap-5 ${answers[currentQuestion._id] === idx
                                                        ? 'bg-white border-white text-black shadow-2xl shadow-white/10'
                                                        : 'bg-zinc-900/30 border-white/5 text-zinc-400 hover:border-white/20 hover:bg-zinc-900/50'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-colors ${answers[currentQuestion._id] === idx ? 'bg-black border-black text-white' : 'border-zinc-700 text-zinc-600 group-hover:border-zinc-500'
                                                        }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="font-bold text-base">{opt.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-[550px]">
                                                <div className="bg-zinc-950/50 px-8 py-4 border-b border-white/5 flex items-center justify-between shrink-0 backdrop-blur-md">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-purple-500/10 rounded-xl">
                                                            <Code2 size={16} className="text-purple-500" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Editor</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <select
                                                            className="bg-black border border-white/10 text-[10px] font-black text-zinc-400 rounded-xl px-4 py-2 focus:outline-none hover:text-white cursor-pointer transition-colors appearance-none uppercase tracking-widest"
                                                            value={selectedLanguage}
                                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                                        >
                                                            <option value="javascript">JavaScript</option>
                                                            <option value="python">Python</option>
                                                            <option value="java">Java</option>
                                                            <option value="cpp">C++</option>
                                                        </select>
                                                        <button
                                                            onClick={handleRunCode}
                                                            disabled={isRunning}
                                                            className="px-6 py-2 bg-zinc-800 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3 hover:bg-zinc-700 transition-all disabled:opacity-50"
                                                        >
                                                            {isRunning ? (
                                                                <div className="w-3 h-3 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                                                            ) : (
                                                                <Play size={10} className="text-blue-500 fill-blue-500" />
                                                            )}
                                                            {isRunning ? 'Executing' : 'Run Code'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-h-[450px] bg-zinc-950/30">
                                                    <Editor
                                                        height="100%"
                                                        language={selectedLanguage}
                                                        theme="vs-dark"
                                                        value={answers[currentQuestion._id] || ''}
                                                        onChange={(val) => handleAnswer(currentQuestion._id, val)}
                                                        options={{
                                                            minimap: { enabled: false },
                                                            fontSize: 14,
                                                            lineNumbers: 'on',
                                                            roundedSelection: false,
                                                            scrollBeyondLastLine: false,
                                                            readOnly: false,
                                                            automaticLayout: true,
                                                            padding: { top: 20, bottom: 20 }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Minimal Console */}
                                            {(isRunning || runResults) && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-zinc-900/50 border border-white/5 rounded-[2rem] overflow-hidden"
                                                >
                                                    <div className="px-8 py-4 bg-zinc-950/50 border-b border-white/5 flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Execution Console</span>
                                                        {runResults && (
                                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${runResults.summary.passed === runResults.summary.total ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                                {runResults.summary.passed} / {runResults.summary.total} Test Cases Passed
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="p-8 font-mono text-xs max-h-64 overflow-y-auto custom-scrollbar">
                                                        {!runResults && isRunning && <div className="text-blue-500 animate-pulse font-bold tracking-widest uppercase">Processing Request...</div>}
                                                        {runResults && runResults.results.map((res, idx) => (
                                                            <div key={idx} className="mb-6 last:mb-0 border-l-2 border-white/5 pl-6">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    {res.passed ? <CheckCircle size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
                                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Test Case {idx + 1}</span>
                                                                </div>
                                                                <div className="space-y-2 text-zinc-400">
                                                                    <div className="flex gap-4"><span className="w-16 text-zinc-600 shrink-0">Input:</span><span>{res.input || "None"}</span></div>
                                                                    <div className="flex gap-4"><span className="w-16 text-zinc-600 shrink-0">Output:</span><span className={res.passed ? "text-green-400/80" : "text-red-400/80"}>{res.actualOutput || (res.error ? "Error" : "Empty")}</span></div>
                                                                    {!res.passed && <div className="flex gap-4"><span className="w-16 text-zinc-600 shrink-0">Expected:</span><span className="text-zinc-500">{res.expectedOutput}</span></div>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom Action Bar */}
                    <footer className="h-20 border-t border-white/5 bg-zinc-950/80 backdrop-blur-md px-10 flex items-center justify-between shrink-0 absolute bottom-0 left-0 right-0">
                        <button
                            type="button"
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(prev => prev - 1)}
                            className="flex items-center gap-3 text-zinc-500 hover:text-white disabled:opacity-20 transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        <div className="flex items-center gap-8">
                            <button type="button" className="flex items-center gap-3 text-zinc-600 hover:text-amber-500 transition-all font-bold text-xs uppercase tracking-widest">
                                <Flag size={14} />
                                Flag
                            </button>
                            <div className="h-4 w-px bg-white/5" />
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                {currentIdx + 1} of {test.questions.length}
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={currentIdx === test.questions.length - 1}
                            onClick={() => setCurrentIdx(prev => prev + 1)}
                            className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 disabled:opacity-20 transition-all flex items-center gap-4 text-xs shadow-xl shadow-white/5"
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </footer>
                </div>
            </main>

            {/* Summary Modal */}
            <AnimatePresence>
                {showSummaryModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSummaryModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 relative z-10 shadow-3xl shadow-blue-500/5"
                        >
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Finish Assessment?</h2>
                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Review your progress before final submission</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-10">
                                <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 text-center">
                                    <div className="text-2xl font-black text-white mb-1">{stats.attempted}</div>
                                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Answered</div>
                                </div>
                                <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 text-center">
                                    <div className="text-2xl font-black text-white mb-1">{stats.attempted}</div>
                                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Answered</div>
                                </div>
                                <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 text-center">
                                    <div className={`text-2xl font-black mb-1 ${stats.remaining > 0 ? 'text-amber-500' : 'text-zinc-400'}`}>{stats.remaining}</div>
                                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Unanswered</div>
                                </div>
                                <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 text-center">
                                    <div className="text-2xl font-black text-blue-500 mb-1">{((stats.attempted / stats.total) * 100).toFixed(0)}%</div>
                                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Completion</div>
                                </div>
                            </div>

                            {stats.remaining > 0 && (
                                <div className="mb-10 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                                    <AlertCircle size={24} className="text-amber-500 shrink-0" />
                                    <p className="text-xs font-bold text-amber-500/90 leading-relaxed">
                                        You have <span className="underline">{stats.remaining}</span> unattempted questions. Are you sure you want to exit?
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20"
                                >
                                    Confirm Submission
                                </button>
                                <button
                                    onClick={() => setShowSummaryModal(false)}
                                    className="w-full py-5 bg-zinc-800 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-700 transition-all"
                                >
                                    Back to Questions
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReportModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 relative z-10"
                        >
                            <div className="mb-6 text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                    <AlertTriangle className="text-red-500" size={28} />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Report Issue</h2>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Question ID: {currentQuestion._id}</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Reason for report</label>
                                    <textarea
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        placeholder="Explain the issue (Options incorrect, wrong sample output, vague description...)"
                                        className="w-full h-32 bg-black border border-white/10 rounded-3xl p-6 text-sm text-zinc-300 focus:outline-none focus:border-red-500/50 transition-all resize-none leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleReport}
                                    disabled={isReporting || !reportReason.trim()}
                                    className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
                                >
                                    {isReporting ? 'Submitting Report...' : 'Submit Report'}
                                </button>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="w-full py-4 bg-zinc-800 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
            `}</style>
        </div>
    );
};

export default TestAttempt;
