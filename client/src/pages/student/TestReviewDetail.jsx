import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar, Award, Lightbulb, Code2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TestReviewDetail = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [generatingId, setGeneratingId] = useState(null);

    const handleGenerateExplanation = async (questionId) => {
        try {
            setGeneratingId(questionId);
            const { data } = await api.post(`/student/question/${questionId}/explain`);

            // Update local state to show the new explanation immediately
            setReview(prev => ({
                ...prev,
                questions: prev.questions.map(q =>
                    q.questionId === questionId
                        ? { ...q, explanation: data.explanation, showExplanation: true }
                        : q
                )
            }));
        } catch (err) {
            console.error(err);
            alert('Failed to generate explanation. Please try again.');
        } finally {
            setGeneratingId(null);
        }
    };

    useEffect(() => {
        fetchReview();
    }, [attemptId]);

    const fetchReview = async () => {
        try {
            const { data } = await api.get(`/student/attempt/${attemptId}`);
            setReview(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert('Failed to load test review');
            navigate('/student/reviews');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    const currentQuestion = review.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/student/reviews"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-sm font-bold"
                    >
                        <ArrowLeft size={16} />
                        Back to Reviews
                    </Link>
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">Test Review</h1>
                    <p className="text-zinc-500">{review.testType} Test • {formatDate(review.completedAt)}</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Award className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Score</span>
                        </div>
                        <div className="text-3xl font-black">{review.stats.percentage}%</div>
                        <div className="text-sm text-zinc-500 mt-1">{review.stats.score}/{review.stats.maxScore} points</div>
                    </div>

                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Correct</span>
                        </div>
                        <div className="text-3xl font-black text-green-500">{review.stats.correctCount}</div>
                        <div className="text-sm text-zinc-500 mt-1">out of {review.stats.totalQuestions}</div>
                    </div>

                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Wrong</span>
                        </div>
                        <div className="text-3xl font-black text-red-500">{review.stats.wrongCount}</div>
                        <div className="text-sm text-zinc-500 mt-1">to review</div>
                    </div>

                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Time</span>
                        </div>
                        <div className="text-3xl font-black">{formatTime(review.totalTime)}</div>
                        <div className="text-sm text-zinc-500 mt-1">total time</div>
                    </div>
                </div>

                {/* Question Navigator */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 mb-8">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Question Navigator</h3>
                    <div className="flex flex-wrap gap-2">
                        {review.questions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-12 h-12 rounded-lg font-bold text-sm transition-all ${idx === currentQuestionIndex
                                    ? 'bg-white text-black'
                                    : q.isCorrect
                                        ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-500 border border-red-500/30'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Detail */}
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-900 border border-white/5 rounded-3xl p-8 mb-8"
                >
                    {/* Question Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Question {currentQuestionIndex + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${currentQuestion.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                            currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                            {currentQuestion.difficulty}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${currentQuestion.type === 'MCQ' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            }`}>
                            {currentQuestion.type}
                        </span>
                        {currentQuestion.isCorrect ? (
                            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-bold text-green-500">Correct</span>
                            </div>
                        ) : (
                            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="text-sm font-bold text-red-500">Incorrect</span>
                            </div>
                        )}
                    </div>

                    {/* Question Title & Description */}
                    <h2 className="text-2xl font-bold mb-4">{currentQuestion.title}</h2>
                    <p className="text-zinc-400 mb-6 whitespace-pre-wrap">{currentQuestion.description}</p>

                    {/* Code Snippet */}
                    {currentQuestion.codeSnippet && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Code2 className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Code Snippet</span>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                <SyntaxHighlighter
                                    language={currentQuestion.codeLanguage || 'javascript'}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: '1.5rem',
                                        background: '#0a0a0a',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {currentQuestion.codeSnippet}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}

                    {/* MCQ Options */}
                    {currentQuestion.type === 'MCQ' && (
                        <div className="space-y-3 mb-6">
                            {currentQuestion.options?.map((option, idx) => {
                                const isUserAnswer = currentQuestion.selectedOption === idx;
                                const isCorrectAnswer = currentQuestion.correctAnswer?.index === idx;

                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border-2 transition-all ${isCorrectAnswer
                                            ? 'border-green-500 bg-green-500/10'
                                            : isUserAnswer
                                                ? 'border-red-500 bg-red-500/10'
                                                : 'border-white/10 bg-white/[0.02]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isCorrectAnswer
                                                ? 'border-green-500 bg-green-500 text-white'
                                                : isUserAnswer
                                                    ? 'border-red-500 bg-red-500 text-white'
                                                    : 'border-zinc-700 text-zinc-600'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`font-medium ${isCorrectAnswer || isUserAnswer ? 'text-white' : 'text-zinc-400'
                                                }`}>
                                                {option.text}
                                            </span>
                                            {isCorrectAnswer && (
                                                <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                            )}
                                            {isUserAnswer && !isCorrectAnswer && (
                                                <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Coding Answer */}
                    {currentQuestion.type === 'CODING' && currentQuestion.userCode && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Code2 className="w-4 h-4 text-purple-500" />
                                <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Your Code</span>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                <SyntaxHighlighter
                                    language="javascript"
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: '1.5rem',
                                        background: '#0a0a0a',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {currentQuestion.userCode}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}

                    {/* Explanation (only for wrong answers) */}
                    {currentQuestion.showExplanation && (
                        <div className="mt-6 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-lg font-bold text-blue-500 mb-2">Explanation</h4>
                                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {currentQuestion.explanation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!currentQuestion.showExplanation && !currentQuestion.isCorrect && (
                        <div className="mt-6 p-4 bg-zinc-800/50 border border-white/5 rounded-xl text-center">
                            <p className="text-sm text-zinc-500 mb-4">No explanation available for this question</p>
                            <button
                                onClick={() => handleGenerateExplanation(currentQuestion.questionId)}
                                disabled={generatingId === currentQuestion.questionId}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                            >
                                {generatingId === currentQuestion.questionId ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Generating Explanation...
                                    </>
                                ) : (
                                    <>
                                        <Lightbulb className="w-4 h-4" />
                                        Generate AI Explanation
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-white/10 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </button>

                    <span className="text-sm font-bold text-zinc-500">
                        {currentQuestionIndex + 1} / {review.questions.length}
                    </span>

                    <button
                        onClick={() => setCurrentQuestionIndex(Math.min(review.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === review.questions.length - 1}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-white/10 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestReviewDetail;
