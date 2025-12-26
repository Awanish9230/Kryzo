import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import TOPICS_DATA from '../../utils/topicsData';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    HelpCircle,
    Settings,
    Plus,
    Trash2,
    Save,
    Code,
    CheckCircle2,
    Lightbulb,
    Play,
    Loader2,
    Check,
    X as CloseIcon
} from 'lucide-react';

const AddQuestion = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('MCQ');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedSubtopic, setSelectedSubtopic] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        status: 'published',
        expectedTime: 10,
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
        let time = 10;
        if (type === 'MCQ') {
            time = 2;
        } else if (type === 'CODING') {
            if (formData.difficulty === 'easy') time = 5;
            else if (formData.difficulty === 'medium') time = 10;
            else if (formData.difficulty === 'hard') time = 20;
        } else if (type === 'DEVELOPMENT') {
            time = 10;
        } else if (type === 'CODE_SNIPPET') {
            time = 5;
        }
        setFormData(prev => ({ ...prev, expectedTime: time }));
    }, [type, formData.difficulty]);

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
            alert('Please provide some code to test');
            return;
        }
        if (formData.testCases.length === 0 || !formData.testCases[0].input) {
            alert('Please add at least one test case with input/output');
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
            alert('Testing failed. Check console or test cases format.');
        } finally {
            setIsTesting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                type,
                topic: selectedTopic,
                subtopic: selectedSubtopic,
                evaluationCriteria: formData.evaluationCriteria.filter(c => c.trim()),
                expectedDeliverables: formData.expectedDeliverables.filter(d => d.trim())
            };
            await api.post('/admin/questions', payload);
            navigate('/admin/questions');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating question');
        }
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 text-zinc-500 hover:text-white bg-white/5 border border-white/5 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-2 p-1 bg-zinc-900 border border-white/5 rounded-2xl">
                        {['MCQ', 'CODING', 'DEVELOPMENT', 'CODE_SNIPPET'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${type === t ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                {t === 'CODE_SNIPPET' ? 'Code Snippet' : t}
                            </button>
                        ))}
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                <Settings size={20} />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Question Details</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 ml-1">Title</label>
                                <input name="title" required placeholder="Question Title" className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all" value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 ml-1">Description</label>
                                <textarea name="description" required rows={4} placeholder="Problem description..." className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all resize-none" value={formData.description} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">Difficulty</label>
                                    <select name="difficulty" className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none" value={formData.difficulty} onChange={handleChange}>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">Time (mins)</label>
                                    <input name="expectedTime" type="number" className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none" value={formData.expectedTime} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">Topic</label>
                                    <select
                                        className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none"
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
                                    <label className="text-sm font-medium text-zinc-400 ml-1">Subtopic</label>
                                    <select
                                        className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none"
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

                    {type === 'MCQ' && (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                                    <HelpCircle size={20} />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Options</h2>
                            </div>
                            <div className="space-y-4">
                                {formData.options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <button
                                            type="button"
                                            onClick={() => handleCorrectOption(idx)}
                                            className={`p-4 border rounded-2xl transition-all ${opt.isCorrect
                                                ? 'bg-green-500/10 border-green-500 text-green-500'
                                                : 'bg-zinc-950 border-white/10 text-zinc-600'
                                                }`}
                                        >
                                            <CheckCircle2 size={24} />
                                        </button>
                                        <input
                                            placeholder={`Option ${idx + 1}`}
                                            className="flex-1 px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none"
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Explanation Field for MCQ */}
                            <div className="space-y-2 mt-6 pt-6 border-t border-white/5">
                                <label className="text-sm font-medium text-zinc-400 ml-1">
                                    Explanation (Optional)
                                    <span className="text-zinc-600 ml-2">Shown for wrong answers during review</span>
                                </label>
                                <textarea
                                    name="explanation"
                                    rows={3}
                                    placeholder="Explain why the correct answer is correct..."
                                    className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                                    value={formData.explanation}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {type === 'CODING' && (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500">
                                    <Code size={20} />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Coding Config</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Constraints</label>
                                    <textarea name="constraints" className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none resize-none" rows={3} value={formData.constraints} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Input Format</label>
                                        <textarea name="inputFormat" className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none resize-none" rows={3} value={formData.inputFormat} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Output Format</label>
                                        <textarea name="outputFormat" className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none resize-none" rows={3} value={formData.outputFormat} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold">Test Cases</h3>
                                        <button type="button" onClick={addTestCase} className="p-2 bg-white/5 border border-white/5 rounded-xl hover:text-blue-500">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    {formData.testCases.map((tc, idx) => (
                                        <div key={idx} className="p-6 bg-zinc-950 border border-white/5 rounded-3xl space-y-4 relative group">
                                            <button type="button" onClick={() => removeTestCase(idx)} className="absolute top-4 right-4 p-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="grid grid-cols-2 gap-4">
                                                <textarea placeholder="Input" className="bg-black/50 border border-white/10 p-3 rounded-xl text-sm w-full focus:outline-none resize-none font-mono" rows={3} value={tc.input} onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)} />
                                                <textarea placeholder="Output" className="bg-black/50 border border-white/10 p-3 rounded-xl text-sm w-full focus:outline-none resize-none font-mono" rows={3} value={tc.output} onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)} />
                                            </div>
                                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                                <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)} />
                                                Hidden Test Case
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {/* Real-time Testing Section for Admin */}
                                <div className="space-y-4 pt-8 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                                <Play size={16} />
                                            </div>
                                            <h3 className="font-bold text-white">Real-time Testing</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleTestCode}
                                            disabled={isTesting}
                                            className="px-6 py-2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center gap-3 disabled:opacity-50"
                                        >
                                            {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                            {isTesting ? 'Testing...' : 'Test Code'}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-xs font-medium text-zinc-500">Sample Solution / Test Code</label>
                                                <select
                                                    className="bg-black border border-white/10 text-[10px] font-black text-zinc-400 rounded-lg px-3 py-1 focus:outline-none"
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
                                                className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl text-white font-mono text-sm focus:outline-none focus:border-blue-500/50 resize-none h-48"
                                                placeholder="Paste a solution to verify your test cases..."
                                                value={testCode}
                                                onChange={(e) => setTestCode(e.target.value)}
                                            />
                                        </div>

                                        {testResults && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden"
                                            >
                                                <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Test Results</span>
                                                    <div className="flex gap-4">
                                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Passed: {testResults.summary.passed}</span>
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Failed: {testResults.summary.failed}</span>
                                                    </div>
                                                </div>
                                                <div className="p-6 space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                                                    {testResults.results.map((res, idx) => (
                                                        <div key={idx} className={`p-4 rounded-2xl border ${res.passed ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Case {idx + 1}</span>
                                                                {res.passed ? <Check size={14} className="text-green-500" /> : <CloseIcon size={14} className="text-red-500" />}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
                                                                <div>
                                                                    <span className="text-zinc-600 block mb-1 uppercase text-[8px]">Actual</span>
                                                                    <span className="text-zinc-400 break-all">{res.actualOutput || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-zinc-600 block mb-1 uppercase text-[8px]">Expected</span>
                                                                    <span className="text-zinc-400 break-all">{res.expectedOutput || 'N/A'}</span>
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

                                {/* Explanation Field for CODING */}
                                <div className="space-y-2 mt-6 pt-6 border-t border-white/5">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">
                                        Explanation (Optional)
                                        <span className="text-zinc-600 ml-2">Shown for wrong answers during review</span>
                                    </label>
                                    <textarea
                                        name="explanation"
                                        rows={3}
                                        placeholder="Explain the approach or solution..."
                                        className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                                        value={formData.explanation}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {type === 'DEVELOPMENT' && (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                                    <Code size={20} />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Development Project</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Project Requirements</label>
                                    <textarea name="projectRequirements" className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none resize-none" rows={4} value={formData.projectRequirements} onChange={handleChange} placeholder="Describe the project requirements..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Submission Guidelines</label>
                                    <textarea name="submissionGuidelines" className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none resize-none" rows={3} value={formData.submissionGuidelines} onChange={handleChange} placeholder="How should students submit their work?" />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-zinc-400">Evaluation Criteria</label>
                                        <button type="button" onClick={() => addArrayField('evaluationCriteria')} className="p-2 bg-white/5 border border-white/5 rounded-xl hover:text-blue-500">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    {formData.evaluationCriteria.map((criterion, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                placeholder={`Criterion ${idx + 1}`}
                                                className="flex-1 px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none"
                                                value={criterion}
                                                onChange={(e) => handleArrayFieldChange('evaluationCriteria', idx, e.target.value)}
                                            />
                                            {formData.evaluationCriteria.length > 1 && (
                                                <button type="button" onClick={() => removeArrayField('evaluationCriteria', idx)} className="p-3 text-zinc-600 hover:text-red-500 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-zinc-400">Expected Deliverables</label>
                                        <button type="button" onClick={() => addArrayField('expectedDeliverables')} className="p-2 bg-white/5 border border-white/5 rounded-xl hover:text-blue-500">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    {formData.expectedDeliverables.map((deliverable, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                placeholder={`Deliverable ${idx + 1}`}
                                                className="flex-1 px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none"
                                                value={deliverable}
                                                onChange={(e) => handleArrayFieldChange('expectedDeliverables', idx, e.target.value)}
                                            />
                                            {formData.expectedDeliverables.length > 1 && (
                                                <button type="button" onClick={() => removeArrayField('expectedDeliverables', idx)} className="p-3 text-zinc-600 hover:text-red-500 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Explanation Field for DEVELOPMENT */}
                                <div className="space-y-2 mt-6 pt-6 border-t border-white/5">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">
                                        Explanation (Optional)
                                        <span className="text-zinc-600 ml-2">Shown for wrong answers during review</span>
                                    </label>
                                    <textarea
                                        name="explanation"
                                        rows={3}
                                        placeholder="Explain the evaluation criteria or approach..."
                                        className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                                        value={formData.explanation}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {type === 'CODE_SNIPPET' && (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                                    <Code size={20} />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Code Snippet Details</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400 ml-1">Programming Language</label>
                                        <select
                                            name="codeLanguage"
                                            className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none"
                                            value={formData.codeLanguage}
                                            onChange={handleChange}
                                        >
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="java">Java</option>
                                            <option value="cpp">C++</option>
                                            <option value="c">C</option>
                                            <option value="html">HTML</option>
                                            <option value="css">CSS</option>
                                            <option value="sql">SQL</option>
                                            <option value="typescript">TypeScript</option>
                                            <option value="go">Go</option>
                                            <option value="rust">Rust</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400 ml-1">Snippet Category</label>
                                        <select
                                            className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none"
                                            value={selectedSubtopic}
                                            onChange={(e) => setSelectedSubtopic(e.target.value)}
                                        >
                                            <option value="">Select Category (Optional)</option>
                                            {selectedTopic && TOPICS_DATA[selectedTopic]?.map(subtopic => (
                                                <option key={subtopic} value={subtopic}>{subtopic}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">
                                        Code
                                        <span className="text-zinc-600 ml-2">Will be displayed with syntax highlighting</span>
                                    </label>
                                    <textarea
                                        name="codeSnippet"
                                        rows={15}
                                        placeholder="Paste your code snippet here..."
                                        className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all resize-none font-mono text-sm"
                                        value={formData.codeSnippet}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Explanation for Code Snippet */}
                                <div className="space-y-2 pt-6 border-t border-white/5">
                                    <label className="text-sm font-medium text-zinc-400 ml-1">
                                        Explanation (Optional)
                                        <span className="text-zinc-600 ml-2">Explain what this code does</span>
                                    </label>
                                    <textarea
                                        name="explanation"
                                        rows={4}
                                        placeholder="Explain what this code snippet demonstrates..."
                                        className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                                        value={formData.explanation}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-8 border-t border-white/5">
                        <button type="submit" className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-3">
                            <Save size={20} />
                            Save Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddQuestion;
