import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    AlertCircle,
    CheckCircle,
    Code,
    Play,
    X,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    Info,
    Send
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

const DailyTest = () => {
    const { dayNumber } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [runResults, setRunResults] = useState(null);
    const [showQuestionPanel, setShowQuestionPanel] = useState(true);
    const [activeTab, setActiveTab] = useState('testcases');

    useEffect(() => {
        fetchDailyTest();
    }, [dayNumber]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && test && !submitting) {
            handleSubmit();
        }
    }, [timeLeft, test]);

    const fetchDailyTest = async () => {
        try {
            const { data } = await api.get(`/student/plan/day/${dayNumber}/questions`);
            setTest(data);
            setTimeLeft(data.duration * 60);

            const initialAnswers = {};
            const prefLang = localStorage.getItem('preferred_language') || 'javascript';
            const langReverseMap = { 'javascript': 63, 'python': 71, 'java': 62, 'cpp': 54 };
            const initialLangId = langReverseMap[prefLang] || 63;

            data.questions.forEach(q => {
                initialAnswers[q._id] = {
                    questionId: q._id,
                    selectedOption: null,
                    code: q.codeSnippet || '',
                    languageId: initialLangId,
                    timeTaken: 0
                };
            });
            setAnswers(initialAnswers);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load daily test');
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const answersArray = Object.values(answers);
            await api.post('/student/test/submit', {
                testId: test._id,
                answers: answersArray
            });
            toast.success('Test submitted successfully');
            navigate('/student/test/result');
        } catch (err) {
            toast.error('Failed to submit test: ' + (err.response?.data?.message || err.message));
            setSubmitting(false);
        }
    };

    const updateAnswer = (questionId, field, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [field]: value
            }
        }));
    };

    const handleRunCode = async () => {
        if (isRunning) return;

        const currentQuestion = test.questions[currentQuestionIndex];
        const currentAnswer = answers[currentQuestion._id];

        const langMap = {
            63: 'JavaScript',
            71: 'Python',
            62: 'Java',
            54: 'C++'
        };

        const language = langMap[currentAnswer.languageId];
        const code = currentAnswer.code;

        if (!code || !language) {
            toast.error('Please write some code and select a language first.');
            return;
        }

        setIsRunning(true);
        setRunResults(null);
        setActiveTab('testcases');

        try {
            const { data } = await api.post('/compiler/run', {
                code: code,
                language: language,
                questionId: currentQuestion._id
            });
            setRunResults(data);
        } catch (err) {
            toast.error('Execution failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsRunning(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <Loader fullScreen />;

    if (error) return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-brand-card border border-red-500/20 p-8 rounded-3xl text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2 text-brand-text">Error Loading Test</h2>
                <p className="text-brand-text-secondary mb-6">{error}</p>
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="px-6 py-3 bg-brand-text text-brand-bg font-bold rounded-xl hover:opacity-90 transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    if (!test || !test.questions || test.questions.length === 0) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-brand-card border border-brand-border p-8 rounded-3xl text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2 text-brand-text">No Questions Available</h2>
                    <p className="text-brand-text-secondary mb-6">There are no questions available.</p>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="px-6 py-3 bg-brand-text text-brand-bg font-bold rounded-xl hover:opacity-90 transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = test.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion._id];
    const isCoding = currentQuestion.type === 'CODING';

    return (
        <div className="h-screen bg-brand-bg flex flex-col overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="h-14 border-b border-brand-border px-4 flex items-center justify-between bg-brand-card/50 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/student/dashboard')} className="p-2 text-brand-text-secondary hover:text-brand-text transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-4 w-px bg-brand-border mx-2"></div>
                    <span className="text-sm font-bold text-brand-text truncate max-w-[200px]">Day {dayNumber} Test</span>

                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-card border border-brand-border rounded-lg ml-4">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-mono font-bold text-brand-text text-sm">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="p-1.5 rounded-lg hover:bg-brand-card text-brand-text-secondary disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {test.questions.map((q, idx) => {
                        const ans = answers[q._id];
                        const isAnswered = ans?.selectedOption !== null || (ans?.code && ans.code.length > 20);
                        return (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative ${currentQuestionIndex === idx
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-brand-secondary/10 text-brand-text-secondary hover:bg-brand-secondary/20 hover:text-brand-text'
                                    }`}
                            >
                                {idx + 1}
                                {isAnswered && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center border-2 border-brand-bg">
                                        <CheckCircle2 size={6} className="text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setCurrentQuestionIndex(Math.min(test.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === test.questions.length - 1}
                        className="p-1.5 rounded-lg hover:bg-brand-card text-brand-text-secondary disabled:opacity-30"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
                    >
                        {submitting ? <Loader size="small" showText={false} /> : <Send size={14} />}
                        Submit Test
                    </button>
                </div>
            </div>

            {/* Main Content - Split Pane Layout for ALL question types */}
            <div className="flex-grow flex overflow-hidden">
                <PanelGroup direction="horizontal" autoSaveId="kryzo-workspace-v1">
                    {showQuestionPanel && (
                        <>
                            <Panel id="kryzo-question-panel" defaultSize={35} minSize={22} className="h-full border-r border-brand-border bg-brand-card/30 overflow-y-auto custom-scrollbar">
                                <div className="p-6 pb-20">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${currentQuestion.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                            currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}>
                                            {currentQuestion.difficulty}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                            {currentQuestion.type}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl font-bold text-brand-text mb-6 leading-tight">{currentQuestion.title}</h1>

                                    <div className="prose prose-invert prose-blue prose-sm max-w-none text-brand-text-secondary space-y-6 leading-relaxed">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {currentQuestion.description}
                                        </ReactMarkdown>
                                    </div>

                                    {isCoding && (
                                        <>
                                            {currentQuestion.inputFormat && (
                                                <div className="mt-6">
                                                    <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-2">Input Format</h3>
                                                    <div className="text-brand-text-secondary text-xs italic">{currentQuestion.inputFormat}</div>
                                                </div>
                                            )}
                                            {currentQuestion.outputFormat && (
                                                <div className="mt-4">
                                                    <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-2">Output Format</h3>
                                                    <div className="text-brand-text-secondary text-xs italic">{currentQuestion.outputFormat}</div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Panel>
                            <PanelResizeHandle className="w-1.5 bg-brand-bg hover:bg-blue-500/50 transition-colors flex flex-col justify-center items-center group cursor-col-resize z-50 border-x border-brand-border">
                                <div className="h-8 w-0.5 bg-brand-border rounded-full group-hover:bg-brand-text transition-colors" />
                            </PanelResizeHandle>
                        </>
                    )}

                    <Panel id="kryzo-editor-panel" defaultSize={65} minSize={30}>
                        {isCoding ? (
                            // Coding Question - Editor Layout
                            <div className="h-full flex flex-col bg-brand-bg overflow-hidden relative">
                                <div className="h-10 border-b border-brand-border bg-brand-card/20 flex items-center justify-between px-4 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                                            className="p-1.5 bg-brand-secondary/10 border border-brand-border rounded-lg text-brand-text-secondary hover:text-brand-text transition-all mr-2"
                                        >
                                            {showQuestionPanel ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                                        </button>
                                        <Code className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-bold text-brand-text">Code Editor</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={currentAnswer.languageId}
                                            onChange={(e) => {
                                                const newLangId = parseInt(e.target.value);
                                                updateAnswer(currentQuestion._id, 'languageId', newLangId);
                                                const langMap = { 63: 'javascript', 71: 'python', 62: 'java', 54: 'cpp' };
                                                localStorage.setItem('preferred_language', langMap[newLangId]);
                                            }}
                                            className="bg-brand-secondary/10 border border-brand-border text-[10px] font-bold text-brand-text-secondary rounded-lg px-2 py-1 focus:outline-none hover:text-brand-text cursor-pointer transition-colors uppercase tracking-wider"
                                        >
                                            <option value={63}>JavaScript</option>
                                            <option value={71}>Python</option>
                                            <option value={62}>Java</option>
                                            <option value={54}>C++</option>
                                        </select>
                                        <button
                                            onClick={handleRunCode}
                                            disabled={isRunning}
                                            className="px-3 py-1 bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-text text-[10px] font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isRunning ? <Loader size="small" showText={false} /> : <Play size={10} fill="currentColor" />}
                                            Run
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <Editor
                                        height="100%"
                                        language={
                                            currentAnswer.languageId === 63 ? 'javascript' :
                                                currentAnswer.languageId === 71 ? 'python' :
                                                    currentAnswer.languageId === 62 ? 'java' : 'cpp'
                                        }
                                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                        value={currentAnswer.code}
                                        onChange={(value) => updateAnswer(currentQuestion._id, 'code', value || '')}
                                        options={{
                                            fontSize: 14,
                                            minimap: { enabled: false },
                                            fontFamily: 'JetBrains Mono, Menlo, monospace',
                                            lineNumbers: 'on',
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            padding: { top: 16 }
                                        }}
                                    />
                                </div>

                                {(isRunning || runResults) && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: '40%' }}
                                        className="h-[40%] bg-brand-card border-t border-brand-border flex flex-col absolute bottom-0 left-0 right-0 z-10">
                                        <div className="flex items-center justify-between px-4 h-10 border-b border-brand-border shrink-0 bg-brand-card/20">
                                            <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Test Results</span>
                                            <button onClick={() => setRunResults(null)} className="text-brand-text-secondary hover:text-brand-text">
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm custom-scrollbar">
                                            {isRunning ? (
                                                <div className="text-blue-500 flex items-center gap-2 font-bold tracking-widest uppercase text-[10px] animate-pulse">
                                                    <Loader size="small" showText={false} />
                                                    Running Test Cases...
                                                </div>
                                            ) : !runResults ? (
                                                <div className="text-brand-text-secondary text-xs italic">Run your code to see output here.</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {runResults.results?.map((res, idx) => (
                                                        <div key={idx} className={`p-3 rounded-lg border ${res.passed ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">
                                                                    Test Case {idx + 1}
                                                                </span>
                                                                {res.passed ?
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-500">PASSED</span> :
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">FAILED</span>
                                                                }
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-[11px] text-brand-text-secondary">
                                                                <div><span className="opacity-50 block text-[9px] uppercase">Input</span>{res.input || 'N/A'}</div>
                                                                <div><span className="opacity-50 block text-[9px] uppercase">Expected</span>{res.expectedOutput || 'N/A'}</div>
                                                            </div>
                                                            {!res.passed && (
                                                                <div className="mt-2 text-[11px] text-red-400">
                                                                    <span className="opacity-50 block text-[9px] uppercase text-brand-text-secondary">Actual</span>
                                                                    {res.actualOutput || 'N/A'}
                                                                </div>
                                                            )}
                                                            {res.error && (
                                                                <div className="mt-2 p-2 bg-red-500/10 rounded text-[10px] text-red-400 font-mono border border-red-500/20">{res.error}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            // MCQ Question - Answer Selection Layout
                            <div className="h-full flex flex-col relative bg-brand-bg/50 overflow-hidden">
                                <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-bg/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                                    <button
                                        onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                                        className="p-1.5 bg-brand-secondary/10 border border-brand-border rounded-lg text-brand-text-secondary hover:text-brand-text transition-all"
                                    >
                                        {showQuestionPanel ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                                    </button>
                                    <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Select Answer</span>
                                </div>
                                <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-brand-bg/20">
                                    <div className="p-10 max-w-3xl mx-auto w-full pb-32">
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentQuestion.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => updateAnswer(currentQuestion._id, 'selectedOption', idx)}
                                                    className={`group p-6 rounded-3xl border text-left transition-all flex items-center gap-5 ${currentAnswer.selectedOption === idx
                                                        ? 'bg-brand-text border-brand-text text-brand-bg shadow-2xl shadow-brand-text/10'
                                                        : 'bg-brand-card/30 border-brand-border text-brand-text-secondary hover:border-brand-border/50 hover:bg-brand-card/50'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-colors ${currentAnswer.selectedOption === idx ? 'bg-brand-bg border-brand-bg text-brand-text' : 'border-brand-secondary/30 text-brand-text-secondary group-hover:border-brand-secondary'
                                                        }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="font-bold text-base">{opt.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
};

export default DailyTest;
