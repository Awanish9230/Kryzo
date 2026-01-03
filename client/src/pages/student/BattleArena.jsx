import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import Editor from "@monaco-editor/react";
import { Play, CheckCircle, XCircle, Trophy, AlertTriangle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const BattleArena = () => {
    const { roomId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { socket } = useSocket();

    // If no state (direct link access), ideally fetch room info from server
    // For V1, redirect to lobby if no state to avoid complexity
    useEffect(() => {
        if (!state?.battleData && !socket) {
            navigate('/student/battle');
        }
    }, [state, socket, navigate]);

    const matchingData = state?.battleData || {};
    const question = matchingData.question;
    const opponentId = matchingData.opponentId;

    const BOILERPLATES = {
        javascript: `// Write your solution here\nfunction solve(input) {\n    // console.log(input);\n    return "";\n}\n`,
        python: `# Write your solution here\nimport sys\n\ndef solve():\n    # input_data = sys.stdin.read()\n    print("Hello")\n\nif __name__ == "__main__":\n    solve()\n`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println("Hello");\n    }\n}\n`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    cout << "Hello" << endl;\n    return 0;\n}\n`
    };

    const [selectedLanguage, setSelectedLanguage] = useState(matchingData.selectedLanguage || 'javascript');
    const [code, setCode] = useState(BOILERPLATES[matchingData.selectedLanguage || 'javascript']);
    const [myProgress, setMyProgress] = useState(0); // 0 to 100
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [gameResult, setGameResult] = useState(null); // 'WIN' | 'LOSS'

    // Reset code when language changes if it's still the boilerplate
    const handleLanguageChange = (newLang) => {
        const oldBoilerplate = BOILERPLATES[selectedLanguage];
        if (code === oldBoilerplate || code === question?.codeSnippet || code === '// Write your solution here') {
            setCode(BOILERPLATES[newLang]);
        }
        setSelectedLanguage(newLang);
    };

    // Redirect if no question data (direct access safety)
    if (!question) return <div className="p-8 text-zinc-500 font-black flex items-center justify-center min-h-screen">Initializing Arena Link...</div>;

    useEffect(() => {
        if (!socket) return;

        socket.on('opponent_progress', (data) => {
            setOpponentProgress(data.progress);
        });

        socket.on('game_over', (data) => {
            const myUserId = JSON.parse(localStorage.getItem('user'))._id;
            if (data.winnerId === myUserId) {
                setGameResult('WIN');
                if (data.reason === 'opponent_left') {
                    toast.success('🏆 VICTORY! Opponent fled the arena.', { duration: 6000 });
                } else {
                    toast.success('🏆 VICTORY!', { duration: 5000 });
                }
            } else {
                setGameResult('LOSS');
                toast.error('💀 DEFEAT', { duration: 5000 });
            }
        });

        socket.on('opponent_disconnected', () => {
            toast('Opponent disconnected. You win by default!');
            setGameResult('WIN');
        });

        return () => {
            socket.off('opponent_progress');
            socket.off('game_over');
            socket.off('opponent_disconnected');
        };
    }, [socket]);

    const executeCode = async (isSubmit = false) => {
        if (isRunning || gameResult) return;
        setIsRunning(true);
        setLogs([]);

        try {
            const testCases = question.testCases || [];
            if (testCases.length === 0) {
                toast.error('No test cases found for validation.');
                setIsRunning(false);
                return;
            }

            // Map frontend language to backend casing
            const langMap = {
                javascript: 'JavaScript',
                python: 'Python',
                java: 'Java',
                cpp: 'Cpp'
            };

            const { data } = await api.post('/compiler/run', {
                code,
                language: langMap[selectedLanguage],
                questionId: question._id
            });

            const results = data.results || [];
            const passed = results.filter(r => r.passed).length;
            const total = results.length;

            setLogs(results.map((r, idx) => ({
                case: idx + 1,
                status: r.passed ? 'Pass' : 'Fail',
                output: r.actualOutput,
                error: r.error
            })));

            // Calculate Progress
            const progress = Math.round((passed / total) * 100);

            if (isSubmit) {
                setMyProgress(progress);
                socket.emit('update_progress', { roomId, progress });

                if (progress === 100) {
                    toast.success('All test cases passed!');
                } else {
                    toast.error(`Only ${passed}/${total} test cases passed.`);
                }
            } else {
                toast.success(`Ran ${total} test cases. ${passed} passed.`);
            }

        } catch (error) {
            console.error(error);
            toast.error('Execution Failed');
            setLogs([{ case: 'Error', status: 'Fail', error: error.response?.data?.message || error.message }]);
        } finally {
            setIsRunning(false);
        }
    };

    const handleExit = () => {
        if (gameResult) {
            navigate('/student/battle');
            return;
        }

        if (window.confirm('Are you sure you want to exit? You will forfeit the match.')) {
            socket.emit('leave_battle', { roomId });
            navigate('/student/battle');
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] bg-black text-white flex flex-col">
            {/* Header / Status Bar */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">You</span>
                            <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${myProgress}%` }}
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                        </div>
                        <div className="text-xl font-black italic text-zinc-800 tracking-tighter">VS</div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Opponent</span>
                            <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${opponentProgress}%` }}
                                    className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2" />
                </div>

                <div className="flex items-center gap-6">
                    <div className="font-mono text-xs font-black uppercase tracking-[0.3em]">
                        {gameResult === 'WIN' && <span className="text-green-500 animate-pulse">Victory Achieved</span>}
                        {gameResult === 'LOSS' && <span className="text-red-500 animate-pulse">Battle Lost</span>}
                        {!gameResult && <span className="text-zinc-500">Live Duel</span>}
                    </div>

                    <button
                        onClick={handleExit}
                        className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Exit Battle
                    </button>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Question */}
                <div className="w-1/3 border-r border-white/5 p-8 overflow-y-auto bg-zinc-950/50 custom-scrollbar">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-black text-blue-400 uppercase tracking-widest">Coding Duel</span>
                        <span className="px-2 py-0.5 bg-zinc-800 border border-white/5 rounded text-[9px] font-black text-zinc-400 uppercase tracking-widest">15 Points</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-6 leading-tight tracking-tight">
                        {question.title}
                    </h2>
                    <div className="prose prose-invert max-w-none text-zinc-400 text-sm leading-relaxed mb-8">
                        {question.description}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-50">Example Cases</h3>
                        {question.testCases && question.testCases.slice(0, 2).map((tc, idx) => (
                            <div key={idx} className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5 space-y-3">
                                <div>
                                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Input</div>
                                    <div className="font-mono text-xs text-zinc-300 bg-black/30 p-2 rounded-lg">{tc.input || 'None'}</div>
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Expected Output</div>
                                    <div className="font-mono text-xs text-green-400/80 bg-green-400/5 p-2 rounded-lg border border-green-400/10">{tc.output}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Editor */}
                <div className="flex-1 flex flex-col bg-zinc-950">
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            language={selectedLanguage}
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', monospace",
                                padding: { top: 24 },
                                lineNumbersMinChars: 3,
                                smoothScrolling: true,
                                cursorSmoothCaretAnimation: "on",
                                automaticLayout: true
                            }}
                        />
                        {/* Result Overlay */}
                        <AnimatePresence>
                            {gameResult && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
                                >
                                    <div className="text-center max-w-md w-full">
                                        <motion.div
                                            initial={{ scale: 0.5, y: 20 }}
                                            animate={{ scale: 1, y: 0 }}
                                            className="mb-8"
                                        >
                                            {gameResult === 'WIN' ? (
                                                <div className="relative">
                                                    <Trophy size={100} className="mx-auto text-yellow-500 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" />
                                                    <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic">VICTORY</h1>
                                                    <p className="text-zinc-400 font-medium">Extraordinary performance! You've claimed the arena.</p>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <XCircle size={100} className="mx-auto text-red-500 mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]" />
                                                    <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic">DEFEAT</h1>
                                                    <p className="text-zinc-400 font-medium">The opponent was faster this time. Reflect and refine.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                        <button
                                            onClick={handleExit}
                                            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95"
                                        >
                                            Return to Lobby
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Editor Footer / Console */}
                    <div className="h-64 bg-zinc-950 border-t border-white/5 flex flex-col">
                        <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Execution Console</span>
                                <div className="h-4 w-px bg-white/10 mx-2" />
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="bg-black/40 border border-white/10 text-[9px] font-black text-zinc-400 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500/30 transition-all uppercase tracking-widest cursor-pointer hover:text-white"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => executeCode(false)}
                                    disabled={isRunning || !!gameResult}
                                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-[10px] font-black text-zinc-300 uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all border border-white/5 disabled:opacity-50"
                                >
                                    {isRunning ? <div className="w-3 h-3 border-2 border-zinc-500 border-t-white rounded-full animate-spin" /> : <Play size={10} fill="currentColor" />}
                                    Run
                                </button>
                                <button
                                    onClick={() => executeCode(true)}
                                    disabled={isRunning || !!gameResult}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {isRunning ? <div className="w-3 h-3 border-2 border-blue-300 border-t-white rounded-full animate-spin" /> : <CheckCircle size={12} />}
                                    Submit Solution
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-[11px] custom-scrollbar">
                            {logs.length === 0 && !isRunning && (
                                <div className="text-zinc-700 italic border-2 border-dashed border-white/5 rounded-2xl p-8 text-center bg-zinc-900/10">
                                    Ready for deployment. Run code to initialize validation...
                                </div>
                            )}
                            {isRunning && (
                                <div className="flex items-center gap-4 text-blue-500 font-black uppercase tracking-widest animate-pulse">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    Analyzing Solution through Neural Grid...
                                </div>
                            )}
                            {logs.map((log, idx) => (
                                <div key={idx} className="group flex items-start gap-4 p-4 bg-zinc-900/30 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className={`mt-0.5 p-1 rounded-md ${log.status === 'Pass' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {log.status === 'Pass' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-[10px] text-zinc-500 uppercase tracking-widest">Verification Segment {log.case}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${log.status === 'Pass' ? 'text-green-500' : 'text-red-500'}`}>{log.status}ed</span>
                                        </div>
                                        {log.error && (
                                            <div className="text-red-400 bg-red-950/30 p-3 rounded-xl mb-2 whitespace-pre-wrap border border-red-500/10 font-mono text-[10px]">{log.error}</div>
                                        )}
                                        {log.output && (
                                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Standard Output</span>
                                                <span className="text-zinc-400 block break-all">{log.output.trim()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BattleArena;
