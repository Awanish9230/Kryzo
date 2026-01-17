import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, XCircle, Trophy, AlertTriangle, Send, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const BattleArena = () => {
    const { roomId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { theme } = useTheme();

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
        python: `# Write your solution here\nimport sys\n\ndef solve():\n    # input_data = sys.stdin.read().split()\n    # Use map(int, input_data) for numbers\n    print("Hello")\n\nif __name__ == "__main__":\n    solve()\n`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n        // Standard pattern for competitive programming:\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt(); // Read array/data size\n            // Read your data and solve...\n        }\n    }\n}\n`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        // Read elements and solve\n    }\n    return 0;\n}\n`
    };

    const [selectedLanguage, setSelectedLanguage] = useState(matchingData.selectedLanguage || 'javascript');
    const [code, setCode] = useState(BOILERPLATES[matchingData.selectedLanguage || 'javascript']);
    const [myProgress, setMyProgress] = useState(0); // 0 to 100
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [gameResult, setGameResult] = useState(null); // 'WIN' | 'LOSS'
    const [names, setNames] = useState({
        me: matchingData.myName || JSON.parse(localStorage.getItem('user'))?.name || 'You',
        opponent: matchingData.opponentName || 'Opponent'
    });
    const [rematchStatus, setRematchStatus] = useState('idle'); // 'idle' | 'sent' | 'received'
    const [showQuestionPanel, setShowQuestionPanel] = useState(true);

    // Reset code when language changes if it's still the boilerplate
    const handleLanguageChange = (newLang) => {
        const oldBoilerplate = BOILERPLATES[selectedLanguage];
        if (code === oldBoilerplate || code === question?.codeSnippet || code === '// Write your solution here') {
            setCode(BOILERPLATES[newLang]);
        }
        setSelectedLanguage(newLang);
    };

    // Redirect if no question data (direct access safety)
    if (!question) return <div className="p-8 text-brand-text-secondary font-black flex items-center justify-center min-h-screen">Initializing Arena Link...</div>;

    useEffect(() => {
        if (!socket) return;

        // Ensure we are in the socket room for this battle
        socket.emit('join_battle_room', { roomId });

        socket.on('room_sync', (data) => {
            console.log('BattleArena: room_sync received', data);
            const myId = JSON.parse(localStorage.getItem('user'))._id;
            const isP1 = String(data.p1.userId) === String(myId);
            setNames({
                me: isP1 ? data.p1.userName : data.p2.userName,
                opponent: isP1 ? data.p2.userName : data.p1.userName
            });
            setOpponentProgress(isP1 ? data.p2.progress : data.p1.progress);
            setMyProgress(isP1 ? data.p1.progress : data.p2.progress);
        });

        socket.on('opponent_progress', (data) => {
            setOpponentProgress(data.progress);
        });

        socket.on('game_over', (data) => {
            console.log('BattleArena: game_over received', data);
            const myUserId = JSON.parse(localStorage.getItem('user'))._id;

            // Robust comparison (ensure both are strings)
            if (String(data.winnerId) === String(myUserId)) {
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

        socket.on('rematch_requested', (data) => {
            console.log('BattleArena: rematch_requested', data);
            setRematchStatus('received');
            toast('⚔️ Opponent challenged you to a rematch!', { icon: '🤝' });
        });

        socket.on('rematch_started', (data) => {
            console.log('BattleArena: rematch_started', data);
            toast.success('Rematch Started! New Question Assigned.');

            // Navigate to new room with updated data
            navigate(`/student/battle/${data.newRoomId}`, {
                replace: true, // Replace history to avoid back-button loop
                state: {
                    battleData: {
                        roomId: data.newRoomId,
                        opponentId,
                        opponentName: names.opponent,
                        myName: names.me,
                        question: data.question,
                        selectedLanguage
                    }
                }
            });

            // Reset local states for the new match
            setGameResult(null);
            setMyProgress(0);
            setOpponentProgress(0);
            setLogs([]);
            setRematchStatus('idle');
            // Code is usually kept or reset? Let's keep it for now but maybe reset to boilerplate
            setCode(BOILERPLATES[selectedLanguage]);
        });

        return () => {
            socket.off('opponent_progress');
            socket.off('game_over');
            socket.off('opponent_disconnected');
            socket.off('rematch_requested');
            socket.off('rematch_started');
        };
    }, [socket, roomId, navigate, names, opponentId, selectedLanguage]);

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
                input: r.input,
                sanitizedInput: r.sanitizedInput, // Map for UI visibility
                output: r.actualOutput,
                error: r.error,
                isHidden: r.isHidden // Pass isHidden through
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

        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-brand-card border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] rounded-3xl pointer-events-auto flex flex-col overflow-hidden`}>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-brand-text uppercase tracking-tight">Forfeit Match?</h3>
                            <p className="text-brand-text-secondary text-[10px] font-black uppercase tracking-widest">Victory is still within reach.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-brand-bg p-4 flex gap-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 px-4 py-2 bg-brand-secondary/10 text-brand-text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-brand-text transition-all"
                    >
                        Stay & Fight
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            socket.emit('leave_battle', { roomId });
                            toast.error('Match Forfeited');
                            navigate('/student/battle');
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-500/20"
                    >
                        Abandon Arena
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const handleRematch = () => {
        if (!socket) return;
        setRematchStatus('sent');
        socket.emit('rematch_request', { roomId, opponentId });
        toast.success('Rematch request sent!');
    };

    return (
        <div className="h-screen bg-brand-bg text-brand-text flex flex-col transition-colors duration-300">
            {/* Header / Status Bar */}
            <div className="h-16 border-b border-brand-border flex items-center justify-between px-6 bg-brand-card/50 backdrop-blur shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-brand-text-secondary uppercase font-black tracking-widest">{names.me}</span>
                            <div className="w-32 h-1.5 bg-brand-secondary/20 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${myProgress}%` }}
                                    className="h-full bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                        </div>
                        <div className="text-xl font-black italic text-brand-text tracking-tighter">VS</div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-brand-text-secondary uppercase font-black tracking-widest">{names.opponent}</span>
                            <div className="w-32 h-1.5 bg-brand-secondary/20 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${opponentProgress}%` }}
                                    className="h-full bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-brand-border mx-2" />
                </div>

                <div className="flex items-center gap-6">
                    <div className="font-mono text-xs font-black uppercase tracking-[0.3em]">
                        {gameResult === 'WIN' && <span className="text-green-500 animate-pulse">Victory Achieved</span>}
                        {gameResult === 'LOSS' && <span className="text-red-500 animate-pulse">Battle Lost</span>}
                        {!gameResult && <span className="text-brand-text-secondary">Live Duel</span>}
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
                <PanelGroup direction="horizontal" autoSaveId="kryzo-workspace-v1">
                    {showQuestionPanel && (
                        <>
                            <Panel id="kryzo-question-panel" defaultSize={35} minSize={22} className="border-r border-brand-border p-8 overflow-y-auto bg-brand-card/30 custom-scrollbar">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-black text-blue-500 uppercase tracking-widest">Coding Duel</span>
                                    <span className="px-2 py-0.5 bg-brand-secondary/10 border border-brand-border rounded text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">15 Points</span>
                                </div>
                                <h2 className="text-2xl font-black text-brand-text mb-6 leading-tight tracking-tight">
                                    {question.title}
                                </h2>
                                <div className="prose prose-invert max-w-none text-brand-text-secondary text-sm leading-relaxed mb-8">
                                    {question.description}
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-brand-text uppercase tracking-[0.2em] opacity-50">Example Cases</h3>
                                    {question.testCases && question.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                                        <div key={idx} className="bg-brand-bg/40 p-5 rounded-2xl border border-brand-border space-y-3">
                                            <div>
                                                <div className="text-[8px] font-black text-brand-text-secondary uppercase tracking-widest mb-1">Input</div>
                                                <div className="font-mono text-xs text-brand-text-secondary bg-brand-bg/30 p-2 rounded-lg">{tc.input || 'None'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] font-black text-brand-text-secondary uppercase tracking-widest mb-1">Expected Output</div>
                                                <div className="font-mono text-xs text-green-500/80 bg-green-500/5 p-2 rounded-lg border border-green-500/10">{tc.output}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                            <PanelResizeHandle className="w-1.5 bg-brand-bg hover:bg-blue-500/50 transition-colors flex flex-col justify-center items-center group cursor-col-resize z-50 border-x border-brand-border">
                                <div className="h-8 w-0.5 bg-brand-border rounded-full group-hover:bg-brand-text transition-colors" />
                            </PanelResizeHandle>
                        </>
                    )}

                    {/* Right: Editor */}
                    <Panel id="kryzo-editor-panel" defaultSize={65} minSize={30}>
                        <div className="h-full flex flex-col bg-brand-bg overflow-hidden relative">
                            <div className="flex-1 relative">
                                <div className="absolute top-4 left-4 z-50">
                                    <button
                                        onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                                        className="p-1.5 bg-brand-card/80 backdrop-blur border border-brand-border rounded-lg text-brand-text-secondary hover:text-brand-text transition-all"
                                    >
                                        {showQuestionPanel ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                                    </button>
                                </div>
                                <Editor
                                    height="100%"
                                    language={selectedLanguage}
                                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
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
                                            className="absolute inset-0 z-[100] bg-brand-bg/95 backdrop-blur-md flex items-center justify-center p-6"
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
                                                            <h1 className="text-6xl font-black text-brand-text mb-4 tracking-tighter italic">VICTORY</h1>
                                                            <p className="text-brand-text-secondary font-medium">Extraordinary performance! You've claimed the arena.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <XCircle size={100} className="mx-auto text-red-500 mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]" />
                                                            <h1 className="text-6xl font-black text-brand-text mb-4 tracking-tighter italic">DEFEAT</h1>
                                                            <p className="text-brand-text-secondary font-medium">The opponent was faster this time. Reflect and refine.</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                                <button
                                                    onClick={handleExit}
                                                    className="w-full py-4 bg-brand-text text-brand-bg font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-brand-text/5 active:scale-95"
                                                >
                                                    Return to Lobby
                                                </button>

                                                <div className="mt-4 flex gap-3">
                                                    {rematchStatus === 'idle' && (
                                                        <button
                                                            onClick={handleRematch}
                                                            className="flex-1 py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-500 transition-all border border-blue-400/20 active:scale-95"
                                                        >
                                                            Request Rematch
                                                        </button>
                                                    )}

                                                    {rematchStatus === 'sent' && (
                                                        <div className="flex-1 py-4 bg-zinc-800 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-white/5 animate-pulse">
                                                            Waiting for Opponent...
                                                        </div>
                                                    )}

                                                    {rematchStatus === 'received' && (
                                                        <button
                                                            onClick={handleRematch}
                                                            className="flex-1 py-4 bg-green-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-green-500 transition-all border border-green-400/20 shadow-lg shadow-green-500/20 active:scale-95"
                                                        >
                                                            Accept Rematch
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Editor Footer / Console */}
                            {(isRunning || logs.length > 0) && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: '40%' }}
                                    className="h-[40%] bg-brand-bg border-t border-brand-border flex flex-col absolute bottom-0 left-0 right-0 z-[60]"
                                >
                                    <div className="px-6 py-3 border-b border-brand-border flex items-center justify-between bg-brand-card/20 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest pl-1">Execution Console</span>
                                            <div className="h-4 w-px bg-brand-border mx-2" />
                                            <select
                                                value={selectedLanguage}
                                                onChange={(e) => handleLanguageChange(e.target.value)}
                                                className="bg-brand-bg/40 border border-brand-border text-[9px] font-black text-brand-text-secondary rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500/30 transition-all uppercase tracking-widest cursor-pointer hover:text-brand-text"
                                            >
                                                <option value="javascript">JavaScript</option>
                                                <option value="python">Python</option>
                                                <option value="java">Java</option>
                                                <option value="cpp">C++</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setLogs([])}
                                                className="text-brand-text-secondary hover:text-brand-text transition-colors p-1"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-[11px] custom-scrollbar">
                                        {isRunning && (
                                            <div className="flex items-center gap-4 text-blue-500 font-black uppercase tracking-widest animate-pulse">
                                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                Analyzing Solution through Neural Grid...
                                            </div>
                                        )}
                                        {logs.map((log, idx) => (
                                            <div key={idx} className="group flex items-start gap-4 p-4 bg-brand-card/30 rounded-2xl border border-brand-border hover:border-brand-border/50 transition-colors">
                                                <div className={`mt-0.5 p-1 rounded-md ${log.status === 'Pass' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {log.status === 'Pass' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-black text-[10px] text-brand-text-secondary uppercase tracking-widest">
                                                            {log.isHidden ? `Verification Segment ${log.case} (Hidden)` : `Verification Segment ${log.case}`}
                                                        </span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${log.status === 'Pass' ? 'text-green-500' : 'text-red-500'}`}>{log.status}ed</span>
                                                    </div>

                                                    {!log.isHidden ? (
                                                        <>
                                                            {log.sanitizedInput && log.status === 'Fail' && (
                                                                <div className="bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 mb-2">
                                                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-1">Incoming Stdin</span>
                                                                    <span className="text-brand-text-secondary font-mono text-[9px]">{log.sanitizedInput}</span>
                                                                </div>
                                                            )}
                                                            {log.error && (
                                                                <div className="text-red-400 bg-red-950/30 p-3 rounded-xl mb-2 whitespace-pre-wrap border border-red-500/10 font-mono text-[10px]">{log.error}</div>
                                                            )}
                                                            {log.output && (
                                                                <div className="bg-brand-bg/30 p-3 rounded-xl border border-brand-border">
                                                                    <span className="text-[9px] font-black text-brand-text-secondary uppercase tracking-widest block mb-1">Standard Output</span>
                                                                    <span className="text-brand-text-secondary block break-all">{log.output.trim()}</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-[9px] text-brand-text-secondary italic py-1 pl-1">
                                                            Inputs and outputs are hidden for this test segment.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* persistent Action Bar if no results */}
                            {!isRunning && logs.length === 0 && (
                                <div className="px-6 py-3 border-t border-brand-border flex items-center justify-end gap-3 bg-brand-card/20 shrink-0">
                                    <button
                                        onClick={() => executeCode(false)}
                                        disabled={isRunning || !!gameResult}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-secondary/10 text-[10px] font-black text-brand-text-secondary uppercase tracking-widest rounded-xl hover:bg-brand-secondary/20 transition-all border border-brand-border disabled:opacity-50"
                                    >
                                        <Play size={10} fill="currentColor" />
                                        Run
                                    </button>
                                    <button
                                        onClick={() => executeCode(true)}
                                        disabled={isRunning || !!gameResult}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        <CheckCircle size={12} />
                                        Submit Solution
                                    </button>
                                </div>
                            )}
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
};

export default BattleArena;
