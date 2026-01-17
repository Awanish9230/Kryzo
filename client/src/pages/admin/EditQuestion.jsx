import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import TOPICS_DATA from '../../utils/topicsData';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
    ArrowLeft,
    HelpCircle,
    Settings,
    Plus,
    Trash2,
    Save,
    Code,
    CheckCircle2,
    FileText,
    Lightbulb,
    Play,
    Check,
    X as CloseIcon
} from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const EditQuestion = () => {
    const { theme } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedSubtopic, setSelectedSubtopic] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        status: 'published',
        expectedTime: 10,
        type: 'MCQ',
        explanation: '',
        codeSnippet: '',
        codeLanguage: 'javascript',
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ],
        constraints: '',
        inputFormat: '',
        outputFormat: '',
        testCases: [{ input: '', output: '', isHidden: false }],
        projectRequirements: '',
        evaluationCriteria: [''],
        submissionGuidelines: '',
        expectedDeliverables: ['']
    });

    const [isTesting, setIsTesting] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [testCode, setTestCode] = useState('');

    useEffect(() => {
        if (loading) return; // Don't trigger while initial loading

        let time = 10;
        if (formData.type === 'MCQ') {
            time = 2;
        } else if (formData.type === 'CODING') {
            if (formData.difficulty === 'easy') time = 5;
            else if (formData.difficulty === 'medium') time = 10;
            else if (formData.difficulty === 'hard') time = 20;
        } else if (formData.type === 'DEVELOPMENT') {
            time = 10;
        }
        setFormData(prev => ({ ...prev, expectedTime: time }));
    }, [formData.type, formData.difficulty]);

    const fetchQuestion = async () => {
        try {
            const { data } = await api.get(`/admin/questions/${id}`);
            setFormData({
                ...data,
                topics: data.topics?.join(', ') || '',
                evaluationCriteria: data.evaluationCriteria || [''],
                expectedDeliverables: data.expectedDeliverables || ['']
            });
            // Set topic and subtopic from data
            if (data.topic) setSelectedTopic(data.topic);
            if (data.subtopic) setSelectedSubtopic(data.subtopic);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load question');
            navigate('/admin/questions');
        }
    };

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleCorrectOption = (index) => {
        const newOptions = formData.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        }));
        setFormData({ ...formData, options: newOptions });
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...formData.testCases];
        newTestCases[index][field] = value;
        setFormData({ ...formData, testCases: newTestCases });
    };

    const addTestCase = () => {
        setFormData({
            ...formData,
            testCases: [...formData.testCases, { input: '', output: '', isHidden: false }]
        });
    };

    const removeTestCase = (index) => {
        const newTestCases = formData.testCases.filter((_, i) => i !== index);
        setFormData({ ...formData, testCases: newTestCases });
    };

    const handleArrayFieldChange = (field, index, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayField = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayField = (field, index) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArray });
    };

    const handleTestCode = async () => {
        if (!testCode.trim()) {
            toast.error('Please provide some code to test');
            return;
        }
        if (formData.testCases.length === 0 || !formData.testCases[0].input) {
            toast.error('Please add at least one test case with input/output');
            return;
        }

        setIsTesting(true);
        setTestResults(null);
        try {
            const { data } = await api.post('/compiler/run', {
                code: testCode,
                language: formData.codeLanguage,
                customTestCases: formData.testCases
            });
            setTestResults(data);
        } catch (error) {
            console.error(error);
            toast.error('Testing failed. Check console or test cases format.');
        } finally {
            setIsTesting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                topic: selectedTopic,
                subtopic: selectedSubtopic,
                evaluationCriteria: formData.evaluationCriteria.filter(c => c.trim()),
                expectedDeliverables: formData.expectedDeliverables.filter(d => d.trim())
            };
            await api.put(`/admin/questions/${id}`, payload);
            toast.success('Question updated successfully');
            navigate('/admin/questions');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating question');
        }
    };

    if (loading) return (
        <Loader fullScreen />
    );

    return (
        <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 text-brand-text-secondary hover:text-brand-text bg-brand-secondary/10 border border-brand-border rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-card border border-brand-border rounded-2xl">
                        {formData.type === 'MCQ' && <HelpCircle size={18} className="text-blue-500" />}
                        {formData.type === 'CODING' && <Code size={18} className="text-purple-500" />}
                        {formData.type === 'DEVELOPMENT' && <FileText size={18} className="text-green-500" />}
                        <span className="text-sm font-bold text-brand-text">{formData.type}</span>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-brand-card/30 border border-brand-border rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                <Settings size={20} />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-brand-text">Question Details</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-brand-text-secondary ml-1">Title</label>
                                <input name="title" required placeholder="Question Title" className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none focus:border-blue-500 transition-all placeholder:text-brand-text-secondary/50" value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-brand-text-secondary ml-1">Description</label>
                                <textarea name="description" required rows={4} placeholder="Problem description..." className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-brand-text-secondary/50" value={formData.description} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1">Difficulty</label>
                                    <select name="difficulty" className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none" value={formData.difficulty} onChange={handleChange}>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1">Time (mins)</label>
                                    <input name="expectedTime" type="number" className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none" value={formData.expectedTime} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1">Topic</label>
                                    <select
                                        className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none"
                                        value={selectedTopic}
                                        onChange={(e) => {
                                            setSelectedTopic(e.target.value);
                                            setSelectedSubtopic(''); // Reset subtopic when topic changes
                                        }}
                                    >
                                        <option value="">Select Topic</option>
                                        {Object.keys(TOPICS_DATA).map(topic => (
                                            <option key={topic} value={topic}>{topic}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1">Subtopic</label>
                                    <select
                                        className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none"
                                        value={selectedSubtopic}
                                        onChange={(e) => setSelectedSubtopic(e.target.value)}
                                        disabled={!selectedTopic}
                                    >
                                        <option value="">Select Subtopic</option>
                                        {selectedTopic && TOPICS_DATA[selectedTopic]?.map(subtopic => (
                                            <option key={subtopic} value={subtopic}>{subtopic}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {formData.type === 'MCQ' && (
                        <div className="bg-brand-card/30 border border-brand-border rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                                    <HelpCircle size={20} />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-brand-text">Options</h2>
                            </div>
                            <div className="space-y-4">
                                {formData.options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <button
                                            type="button"
                                            onClick={() => handleCorrectOption(idx)}
                                            className={`p-4 border rounded-2xl transition-all ${opt.isCorrect
                                                ? 'bg-green-500/10 border-green-500 text-green-500'
                                                : 'bg-brand-bg border-brand-border text-brand-text-secondary'
                                                }`}
                                        >
                                            <CheckCircle2 size={24} />
                                        </button>
                                        <input
                                            placeholder={`Option ${idx + 1}`}
                                            className="flex-1 px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none placeholder:text-brand-text-secondary/50"
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Explanation Field for MCQ */}
                            <div className="space-y-2 mt-6 pt-6 border-t border-brand-border">
                                <label className="text-sm font-medium text-brand-text-secondary ml-1">
                                    Explanation (Optional)
                                    <span className="text-brand-text-secondary/70 ml-2">Shown for wrong answers during review</span>
                                </label>
                                <textarea
                                    name="explanation"
                                    rows={3}
                                    placeholder="Explain why the correct answer is correct..."
                                    className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-brand-text-secondary/50"
                                    value={formData.explanation || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {formData.type === 'CODING' && (
                        <div className="bg-brand-card/30 border border-brand-border rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500">
                                    <Code size={20} />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-brand-text">Coding Config</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-brand-text-secondary">Constraints</label>
                                    <textarea name="constraints" className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none resize-none placeholder:text-brand-text-secondary/50" rows={3} value={formData.constraints} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-brand-text-secondary">Input Format</label>
                                        <textarea name="inputFormat" className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none resize-none placeholder:text-brand-text-secondary/50" rows={3} value={formData.inputFormat} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-brand-text-secondary">Output Format</label>
                                        <textarea name="outputFormat" className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none resize-none placeholder:text-brand-text-secondary/50" rows={3} value={formData.outputFormat} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-brand-text">Test Cases</h3>
                                        <button type="button" onClick={addTestCase} className="p-2 bg-brand-secondary/10 border border-brand-border rounded-xl hover:text-blue-500 transition-colors">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    {formData.testCases.map((tc, idx) => (
                                        <div key={idx} className="p-6 bg-brand-bg border border-brand-border rounded-3xl space-y-4 relative group">
                                            <button type="button" onClick={() => removeTestCase(idx)} className="absolute top-4 right-4 p-2 text-brand-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="grid grid-cols-2 gap-4">
                                                <textarea placeholder="Input" className="bg-brand-card border border-brand-border p-3 rounded-xl text-sm w-full focus:outline-none resize-none font-mono text-brand-text placeholder:text-brand-text-secondary/50" rows={3} value={tc.input} onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)} />
                                                <textarea placeholder="Output" className="bg-brand-card border border-brand-border p-3 rounded-xl text-sm w-full focus:outline-none resize-none font-mono text-brand-text placeholder:text-brand-text-secondary/50" rows={3} value={tc.output} onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)} />
                                            </div>
                                            <label className="flex items-center gap-2 text-xs font-bold text-brand-text-secondary">
                                                <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)} />
                                                Hidden Test Case
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {/* Real-time Testing Section for Admin */}
                                <div className="space-y-4 pt-8 border-t border-brand-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                                <Play size={16} />
                                            </div>
                                            <h3 className="font-bold text-brand-text">Real-time Testing</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleTestCode}
                                            disabled={isTesting}
                                            className="px-6 py-2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center gap-3 disabled:opacity-50"
                                        >
                                            {isTesting ? <Loader size="small" showText={false} /> : <Play size={14} />}
                                            {isTesting ? 'Testing...' : 'Test Code'}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-xs font-medium text-brand-text-secondary">Sample Solution / Test Code</label>
                                                <select
                                                    className="bg-brand-bg border border-brand-border text-[10px] font-black text-brand-text-secondary rounded-lg px-3 py-1 focus:outline-none"
                                                    value={formData.codeLanguage}
                                                    onChange={(e) => setFormData({ ...formData, codeLanguage: e.target.value })}
                                                >
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                </select>
                                            </div>
                                            <textarea
                                                className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text font-mono text-sm focus:outline-none focus:border-blue-500/50 resize-none h-48 placeholder:text-brand-text-secondary/50"
                                                placeholder="Paste a solution to verify your test cases..."
                                                value={testCode}
                                                onChange={(e) => setTestCode(e.target.value)}
                                            />
                                        </div>

                                        {testResults && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden"
                                            >
                                                <div className="px-6 py-3 border-b border-brand-border flex items-center justify-between bg-brand-bg/[0.02]">
                                                    <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Test Results</span>
                                                    <div className="flex gap-4">
                                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Passed: {testResults.summary.passed}</span>
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Failed: {testResults.summary.failed}</span>
                                                    </div>
                                                </div>
                                                <div className="p-6 space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                                                    {testResults.results.map((res, idx) => (
                                                        <div key={idx} className={`p-4 rounded-2xl border ${res.passed ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Case {idx + 1}</span>
                                                                {res.passed ? <Check size={14} className="text-green-500" /> : <CloseIcon size={14} className="text-red-500" />}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
                                                                <div>
                                                                    <span className="text-brand-text-secondary block mb-1 uppercase text-[8px]">Actual</span>
                                                                    <span className="text-brand-text-secondary/70 break-all">{res.actualOutput || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-brand-text-secondary block mb-1 uppercase text-[8px]">Expected</span>
                                                                    <span className="text-brand-text-secondary/70 break-all">{res.expectedOutput || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                            {res.error && <div className="mt-2 p-2 bg-red-500/10 text-red-400 text-[10px] rounded-lg border border-red-500/20">{res.error}</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.type === 'DEVELOPMENT' && (
                        <div className="bg-brand-card/30 border border-brand-border rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-brand-text">Development Project</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-brand-text-secondary">Project Requirements</label>
                                    <textarea name="projectRequirements" className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none resize-none placeholder:text-brand-text-secondary/50" rows={4} value={formData.projectRequirements} onChange={handleChange} placeholder="Describe the project requirements..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-brand-text-secondary">Submission Guidelines</label>
                                    <textarea name="submissionGuidelines" className="w-full px-5 py-4 bg-brand-bg border border-brand-border rounded-2xl text-brand-text focus:outline-none resize-none placeholder:text-brand-text-secondary/50" rows={3} value={formData.submissionGuidelines} onChange={handleChange} placeholder="How should students submit their work?" />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-brand-text-secondary">Evaluation Criteria</label>
                                        <button type="button" onClick={() => addArrayField('evaluationCriteria')} className="p-2 bg-brand-secondary/10 border border-brand-border rounded-xl hover:text-blue-500 transition-colors">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    {formData.evaluationCriteria.map((criterion, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                placeholder={`Criterion ${idx + 1}`}
                                                className="flex-1 px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none placeholder:text-brand-text-secondary/50"
                                                value={criterion}
                                                onChange={(e) => handleArrayFieldChange('evaluationCriteria', idx, e.target.value)}
                                            />
                                            {formData.evaluationCriteria.length > 1 && (
                                                <button type="button" onClick={() => removeArrayField('evaluationCriteria', idx)} className="p-3 text-brand-text-secondary hover:text-red-500 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-brand-text-secondary">Expected Deliverables</label>
                                        <button type="button" onClick={() => addArrayField('expectedDeliverables')} className="p-2 bg-brand-secondary/10 border border-brand-border rounded-xl hover:text-blue-500 transition-colors">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    {formData.expectedDeliverables.map((deliverable, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                placeholder={`Deliverable ${idx + 1}`}
                                                className="flex-1 px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none placeholder:text-brand-text-secondary/50"
                                                value={deliverable}
                                                onChange={(e) => handleArrayFieldChange('expectedDeliverables', idx, e.target.value)}
                                            />
                                            {formData.expectedDeliverables.length > 1 && (
                                                <button type="button" onClick={() => removeArrayField('expectedDeliverables', idx)} className="p-3 text-brand-text-secondary hover:text-red-500 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-8 border-t border-brand-border">
                        <button type="submit" className="px-10 py-4 bg-brand-text text-brand-bg font-bold rounded-2xl hover:opacity-90 transition-all flex items-center gap-3">
                            <Save size={20} />
                            Update Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditQuestion;
