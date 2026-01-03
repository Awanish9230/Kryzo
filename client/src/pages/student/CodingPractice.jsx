import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Send,
    Layout,
    Maximize2,
    Minimize2,
    Code,
    CheckCircle2,
    XCircle,
    Info,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const CodingPractice = () => {
    const [searchParams] = useSearchParams();
    const topic = searchParams.get('topic');
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [codes, setCodes] = useState({});
    const [showQuestionPanel, setShowQuestionPanel] = useState(true);
    const [results, setResults] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState('');
    const [activeTab, setActiveTab] = useState('description'); // 'description' or 'testcases'
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [solvedQuestions, setSolvedQuestions] = useState(new Set());

    useEffect(() => {
        fetchQuestions();
        // Load layout preference
        const savedLayout = localStorage.getItem('practice_layout_expanded');
        if (savedLayout !== null) {
            setShowQuestionPanel(JSON.parse(savedLayout));
        }
    }, [topic]);

    const fetchQuestions = async () => {
        try {
            const { data } = await api.get(`/student/practice/coding?topic=${topic}`);
            setTest(data);
            // Initialize codes and solved status
            const initialCodes = {};
            const solvedIdxs = new Set();
            data.questions.forEach((q, idx) => {
                const savedCode = localStorage.getItem(`practice_code_${q._id}`);
                initialCodes[idx] = savedCode || q.codeSnippet || '// Write your code here...';
                if (q.isSolved) solvedIdxs.add(idx);
            });
            setCodes(initialCodes);
            setSolvedQuestions(solvedIdxs);

            // Load preferred language
            const prefLang = localStorage.getItem('preferred_language');
            if (prefLang) {
                setSelectedLanguage(prefLang);
            } else if (data.questions.length > 0) {
                setSelectedLanguage(data.questions[0].codeLanguage?.toLowerCase() || 'javascript');
            }
            if (data.questions.length > 1) {
                setLoading(false);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCodeChange = (value) => {
        setCodes(prev => ({ ...prev, [currentQuestionIdx]: value }));
        // Persist to localStorage
        const question = test.questions[currentQuestionIdx];
        if (question) {
            localStorage.setItem(`practice_code_${question._id}`, value);
        }
    };

    const togglePanel = () => {
        const newState = !showQuestionPanel;
        setShowQuestionPanel(newState);
        localStorage.setItem('practice_layout_expanded', JSON.stringify(newState));
    };

    const handleRunCode = async () => {
        setSubmitting(true);
        try {
            const question = test.questions[currentQuestionIdx];
            const { data } = await api.post('/compiler/run', {
                code: codes[currentQuestionIdx],
                language: selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1),
                questionId: question._id
            });
            setResults(prev => ({ ...prev, [currentQuestionIdx]: data.results }));
            setActiveTab('testcases');
        } catch (err) {
            console.error(err);
            setConsoleOutput('Error running code: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitCode = async () => {
        setSubmitting(true);
        try {
            const question = test.questions[currentQuestionIdx];
            const { data } = await api.post('/compiler/run', {
                code: codes[currentQuestionIdx],
                language: selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1),
                questionId: question._id
            });
            setResults(prev => ({ ...prev, [currentQuestionIdx]: data.results }));
            setActiveTab('testcases');

            // Find if all test cases passed
            const allPassed = data.results && data.results.length > 0 && data.results.every(r => r.passed);

            if (allPassed) {
                await api.post('/student/practice/submit', {
                    questionId: question._id,
                    isCorrect: true
                });
                setSolvedQuestions(prev => new Set([...prev, currentQuestionIdx]));
                toast.success('Congratulations! Question solved and submitted.');
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    navigate('/student/dashboard');
                }, 1500);
            } else {
                toast.error('Some test cases failed. Keep trying!');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error submitting code: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Loader fullScreen />
    );

    if (!test || test.questions.length === 0) return (
        <div className="min-h-screen bg-[#0a0a0a] pt-28 px-6 text-center">
            <Info className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No questions found</h2>
            <p className="text-zinc-500 mb-8">We couldn't find any coding questions for this topic.</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white text-black font-bold rounded-xl">Go Back</button>
        </div>
    );

    const question = test.questions[currentQuestionIdx];
    const currentResults = results[currentQuestionIdx] || [];

    return (
        <div className="h-screen bg-[#0a0a0a] pt-16 overflow-hidden flex flex-col">
            {/* Minimal Header */}
            <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-4 w-px bg-white/10 mx-2"></div>
                    <span className="text-sm font-bold text-white truncate max-w-[200px]">{test.title}</span>
                </div>

                <div className="flex items-center gap-2">
                    {test.questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentQuestionIdx(idx)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative ${currentQuestionIdx === idx
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
                                }`}
                        >
                            {idx + 1}
                            {solvedQuestions.has(idx) && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                                    <CheckCircle2 size={6} className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-2">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => {
                                const newLang = e.target.value;
                                setSelectedLanguage(newLang);
                                localStorage.setItem('preferred_language', newLang);
                            }}
                            className="bg-black/40 border border-white/10 text-[10px] font-black text-zinc-400 rounded-xl px-4 py-1.5 focus:outline-none hover:text-white cursor-pointer transition-colors appearance-none uppercase tracking-widest"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>
                    <button
                        onClick={togglePanel}
                        className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all border border-white/5"
                        title={showQuestionPanel ? "Collapse Panel" : "Expand Panel"}
                    >
                        {showQuestionPanel ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>
                    <button
                        onClick={handleRunCode}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-all"
                    >
                        {submitting ? <Loader size="small" showText={false} /> : <Play size={16} fill="currentColor" />}
                        Run
                    </button>
                    <button
                        onClick={handleSubmitCode}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-all"
                    >
                        {submitting ? <Loader size="small" showText={false} /> : <Send size={16} />}
                        Submit
                    </button>
                </div>
            </div>

            {/* Main Split Layout */}
            <div className="flex-grow flex overflow-hidden">
                {/* Left: Question Description Panel */}
                <AnimatePresence initial={false}>
                    {showQuestionPanel && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '40%', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="h-full border-r border-white/5 bg-zinc-900/30 overflow-y-auto"
                        >
                            <div className="p-8 pb-32">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${question.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        question.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                            'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                        {question.difficulty}
                                    </span>
                                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-tighter">{question.topic}</span>
                                </div>

                                <h1 className="text-2xl font-bold text-white mb-6 leading-tight">{question.title}</h1>

                                <div className="prose prose-invert prose-sm max-w-none text-zinc-400 space-y-6 leading-relaxed">
                                    <div className="whitespace-pre-wrap">{question.description}</div>

                                    {question.constraints && (
                                        <div className="mt-8">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Info size={14} className="text-blue-500" />
                                                Constraints
                                            </h3>
                                            <pre className="bg-black/50 p-4 rounded-2xl border border-white/5 text-xs text-zinc-500 font-mono">
                                                {question.constraints}
                                            </pre>
                                        </div>
                                    )}

                                    {question.inputFormat && (
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Input Format</h3>
                                            <div className="text-zinc-500 text-xs italic">{question.inputFormat}</div>
                                        </div>
                                    )}

                                    {question.outputFormat && (
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Output Format</h3>
                                            <div className="text-zinc-500 text-xs italic">{question.outputFormat}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right: Code Editor & Console */}
                <div className={`flex-grow h-full flex flex-col bg-black transition-all duration-300 ${!showQuestionPanel ? 'w-full' : 'w-[60%]'}`}>
                    <div className="flex-grow">
                        <Editor
                            height="100%"
                            language={question.codeLanguage?.toLowerCase() || 'javascript'}
                            theme="vs-dark"
                            value={codes[currentQuestionIdx]}
                            onChange={handleCodeChange}
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                padding: { top: 20 },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
                                fontLigatures: true,
                                cursorSmoothCaretAnimation: 'on',
                                smoothScrolling: true
                            }}
                        />
                    </div>

                    {/* Console / Test Results */}
                    <div className="h-64 border-t border-white/5 bg-[#0d0d0d] flex flex-col shrink-0">
                        <div className="flex items-center justify-between px-6 h-12 border-b border-white/5 shrink-0">
                            <div className="flex items-center gap-6 h-full">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`text-[10px] font-black uppercase tracking-widest h-full border-b-2 transition-all ${activeTab === 'description' ? 'text-blue-500 border-blue-500' : 'text-zinc-600 border-transparent'
                                        }`}
                                >
                                    Output
                                </button>
                                <button
                                    onClick={() => setActiveTab('testcases')}
                                    className={`text-[10px] font-black uppercase tracking-widest h-full border-b-2 transition-all flex items-center gap-2 ${activeTab === 'testcases' ? 'text-blue-500 border-blue-500' : 'text-zinc-600 border-transparent'
                                        }`}
                                >
                                    Test Cases
                                    {currentResults.length > 0 && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${currentResults.every(r => r.passed) ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 ml-auto pr-6">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => {
                                        const newLang = e.target.value;
                                        setSelectedLanguage(newLang);
                                        localStorage.setItem('preferred_language', newLang);
                                    }}
                                    className="bg-zinc-800 border border-white/5 text-[10px] font-bold text-zinc-300 rounded-lg px-3 py-1.5 focus:outline-none hover:text-white cursor-pointer transition-colors appearance-none uppercase tracking-wider mr-2"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                                <button
                                    onClick={handleRunCode}
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    {submitting ? <Loader size="small" showText={false} /> : <Play size={14} fill="currentColor" />}
                                    Run
                                </button>
                                <button
                                    onClick={handleSubmitCode}
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    {submitting ? <Loader size="small" showText={false} /> : <Send size={14} />}
                                    Submit
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 font-mono text-sm">
                            {activeTab === 'description' ? (
                                <div className="text-zinc-500">
                                    {consoleOutput || 'Click "Run Code" to see results...'}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {currentResults.length > 0 ? (
                                        currentResults.map((res, idx) => (
                                            <div key={idx} className={`p-4 rounded-xl border ${res.passed ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Case {idx + 1}</span>
                                                    {res.passed ?
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-500"><CheckCircle2 size={14} /> Passed</span> :
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-500"><XCircle size={14} /> Failed</span>
                                                    }
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <div className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Input</div>
                                                        <div className="bg-black/40 p-2 rounded text-xs text-zinc-400 border border-white/5">{res.input || 'None'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Expected</div>
                                                        <div className="bg-black/40 p-2 rounded text-xs text-zinc-400 border border-white/5">{res.expectedOutput || 'None'}</div>
                                                    </div>
                                                </div>
                                                {!res.passed && (
                                                    <div className="mt-4">
                                                        <div className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Your Output</div>
                                                        <div className="bg-red-500/10 p-2 rounded text-xs text-red-400 border border-red-500/10">{res.actualOutput || 'No output'}</div>
                                                    </div>
                                                )}
                                                {res.error && (
                                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/10 rounded-lg text-xs text-red-400 font-mono">
                                                        {res.error}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-zinc-600 italic">No test cases to display yet. Run your code to check against test cases.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CodingPractice;
