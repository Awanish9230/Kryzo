import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle, Code } from 'lucide-react';
import { Editor } from '@monaco-editor/react';

const DailyTest = () => {
    const { dayNumber } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDailyTest();
    }, [dayNumber]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && test) {
            handleSubmit();
        }
    }, [timeLeft, test]);

    const fetchDailyTest = async () => {
        try {
            const { data } = await api.get(`/student/plan/day/${dayNumber}/questions`);
            setTest(data);
            setTimeLeft(data.duration * 60);

            // Initialize answers
            const initialAnswers = {};
            data.questions.forEach(q => {
                initialAnswers[q._id] = {
                    questionId: q._id,
                    selectedOption: null,
                    code: '',
                    languageId: 63, // JavaScript default
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
            navigate('/student/results');
        } catch (err) {
            alert('Failed to submit test: ' + (err.response?.data?.message || err.message));
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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 p-8 rounded-3xl text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Error Loading Test</h2>
                <p className="text-zinc-400 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    if (!test || !test.questions || test.questions.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-zinc-900 border border-white/5 p-8 rounded-3xl text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
                    <p className="text-zinc-400 mb-6">There are no questions available for Day {dayNumber} yet. Please check back later or study the documentation.</p>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = test.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion._id];

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Day {dayNumber} Practice Test</h1>
                        <p className="text-zinc-500">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Test'}
                        </button>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${currentQuestion.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                                currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-red-500/10 text-red-500'
                            }`}>
                            {currentQuestion.difficulty?.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${currentQuestion.type === 'MCQ' ? 'bg-purple-500/10 text-purple-500' :
                                'bg-blue-500/10 text-blue-500'
                            }`}>
                            {currentQuestion.type}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">{currentQuestion.title}</h2>
                    <p className="text-zinc-400 mb-8 whitespace-pre-wrap">{currentQuestion.description}</p>

                    {/* MCQ Options */}
                    {currentQuestion.type === 'MCQ' && (
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => updateAnswer(currentQuestion._id, 'selectedOption', idx)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${currentAnswer.selectedOption === idx
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${currentAnswer.selectedOption === idx
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-white/20'
                                            }`}>
                                            {currentAnswer.selectedOption === idx && (
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <span className="font-medium">{option.text}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Coding Editor */}
                    {currentQuestion.type === 'CODING' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {currentQuestion.inputFormat && (
                                    <div>
                                        <h4 className="font-bold text-zinc-400 mb-2">Input Format:</h4>
                                        <p className="text-zinc-500 whitespace-pre-wrap">{currentQuestion.inputFormat}</p>
                                    </div>
                                )}
                                {currentQuestion.outputFormat && (
                                    <div>
                                        <h4 className="font-bold text-zinc-400 mb-2">Output Format:</h4>
                                        <p className="text-zinc-500 whitespace-pre-wrap">{currentQuestion.outputFormat}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-bold">Code Editor</span>
                                    </div>
                                    <select
                                        value={currentAnswer.languageId}
                                        onChange={(e) => updateAnswer(currentQuestion._id, 'languageId', parseInt(e.target.value))}
                                        className="bg-zinc-800 border border-white/10 rounded px-3 py-1 text-sm"
                                    >
                                        <option value={63}>JavaScript</option>
                                        <option value={71}>Python</option>
                                        <option value={62}>Java</option>
                                        <option value={54}>C++</option>
                                    </select>
                                </div>
                                <Editor
                                    height="400px"
                                    defaultLanguage="javascript"
                                    theme="vs-dark"
                                    value={currentAnswer.code}
                                    onChange={(value) => updateAnswer(currentQuestion._id, 'code', value || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 bg-zinc-900 border border-white/10 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {test.questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-10 h-10 rounded-lg font-bold transition-all ${idx === currentQuestionIndex
                                        ? 'bg-blue-500 text-white'
                                        : answers[test.questions[idx]._id]?.selectedOption !== null || answers[test.questions[idx]._id]?.code
                                            ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                            : 'bg-white/5 text-zinc-500 border border-white/10'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentQuestionIndex(Math.min(test.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === test.questions.length - 1}
                        className="px-6 py-3 bg-zinc-900 border border-white/10 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyTest;
