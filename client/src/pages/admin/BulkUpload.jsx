import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Save,
    Trash2,
    Download
} from 'lucide-react';

const BulkUpload = () => {
    const navigate = useNavigate();
    const [previewData, setPreviewData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setLoading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            // Basic mapping/cleaning
            const formatted = json.map(row => ({
                type: row.type || 'MCQ',
                title: row.title || '',
                description: row.description || '',
                difficulty: (row.difficulty || 'easy').toLowerCase(),
                topic: row.topic || '',
                subtopic: row.subtopic || '',
                topics: row.topics ? row.topics.split(',').map(t => t.trim()) : [],
                expectedTime: parseInt(row.expectedTime) || 5,
                status: 'published',
                // MCQ Specific
                options: row.options ? JSON.parse(row.options) : [],
                // Coding Specific
                constraints: row.constraints || '',
                inputFormat: row.inputFormat || '',
                outputFormat: row.outputFormat || '',
                testCases: row.testCases ? JSON.parse(row.testCases) : []
            }));

            setPreviewData(formatted);
            setLoading(false);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleUpload = async () => {
        if (previewData.length === 0) return;
        setUploading(true);
        const loadingToast = toast.loading('Uploading questions...');
        try {
            await api.post('/admin/questions/bulk', previewData);
            navigate('/admin/questions');
            toast.success('Bulk upload successful!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to bulk upload');
        } finally {
            setUploading(false);
            toast.dismiss(loadingToast);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                type: 'MCQ',
                title: 'Sample MCQ',
                description: 'What is 1+1?',
                difficulty: 'easy',
                topic: 'Math',
                subtopic: 'Arithmetic',
                topics: 'Math, Arithmetic',
                expectedTime: 2,
                options: JSON.stringify([
                    { text: '1', isCorrect: false },
                    { text: '2', isCorrect: true }
                ])
            },
            {
                type: 'CODING',
                title: 'Sum of Two',
                description: 'Return a+b',
                difficulty: 'easy',
                topic: 'Basic',
                topics: 'Basic, Math',
                expectedTime: 10,
                constraints: 'None',
                inputFormat: 'Two integers',
                outputFormat: 'One integer',
                testCases: JSON.stringify([
                    { input: '1 2', output: '3', isHidden: false }
                ])
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, "Kryzo_Bulk_Template.xlsx");
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 font-bold text-xs uppercase tracking-widest">
                            <ArrowLeft size={16} />
                            Back to dashboard
                        </button>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">Bulk Upload</h1>
                        <p className="text-zinc-500 text-sm">Upload multiple questions at once using Excel or CSV templates.</p>
                    </div>
                    <button
                        onClick={downloadTemplate}
                        className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 font-bold text-sm"
                    >
                        <Download size={18} />
                        Download Template
                    </button>
                </header>

                {previewData.length === 0 ? (
                    <div className="max-w-xl mx-auto">
                        <label className="group relative block cursor-pointer">
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <div className="border-2 border-dashed border-white/5 rounded-[3rem] p-20 text-center bg-zinc-900/20 group-hover:bg-zinc-900/40 group-hover:border-white/10 transition-all">
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Upload size={32} className="text-zinc-400 group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Select your file</h3>
                                <p className="text-zinc-500 text-sm mb-8">Click to browse or drag and drop your spreadsheet here.</p>
                                <span className="px-6 py-3 bg-white text-black font-bold rounded-2xl">
                                    Browse Files
                                </span>
                            </div>
                        </label>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-3xl backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/10 rounded-2xl">
                                    <FileSpreadsheet className="text-green-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold">{fileName}</h3>
                                    <p className="text-xs text-zinc-500">{previewData.length} questions identified in file.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setPreviewData([])}
                                    className="px-6 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Discard
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-10 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : <><Save size={18} /> Confirm & Upload</>}
                                </button>
                            </div>
                        </div>

                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Title</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Topic</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Difficulty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {previewData.map((q, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${q.type === 'MCQ' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                                                    }`}>
                                                    {q.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">{q.title}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-400">{q.topic}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${q.difficulty === 'easy' ? 'text-green-500' :
                                                    q.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default BulkUpload;
