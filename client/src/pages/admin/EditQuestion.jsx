import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    FileText
} from 'lucide-react';

const EditQuestion = () => {
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
            alert('Failed to load question');
            navigate('/admin/questions');
        }
    };

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
            navigate('/admin/questions');
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating question');
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
                <header className="mb-12 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 text-zinc-500 hover:text-white bg-white/5 border border-white/5 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-2xl">
                        {formData.type === 'MCQ' && <HelpCircle size={18} className="text-blue-500" />}
                        {formData.type === 'CODING' && <Code size={18} className="text-purple-500" />}
                        {formData.type === 'DEVELOPMENT' && <FileText size={18} className="text-green-500" />}
                        <span className="text-sm font-bold text-white">{formData.type}</span>
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

                    {formData.type === 'MCQ' && (
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
                        </div>
                    )}

                    {formData.type === 'CODING' && (
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
                                                <input placeholder="Input" className="bg-black/50 border border-white/10 p-3 rounded-xl text-sm" value={tc.input} onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)} />
                                                <input placeholder="Output" className="bg-black/50 border border-white/10 p-3 rounded-xl text-sm" value={tc.output} onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)} />
                                            </div>
                                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                                <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)} />
                                                Hidden Test Case
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.type === 'DEVELOPMENT' && (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                                    <FileText size={20} />
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
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-8 border-t border-white/5">
                        <button type="submit" className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-3">
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
