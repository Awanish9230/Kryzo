import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import Editor from "@monaco-editor/react";
import { Play, CheckCircle, XCircle, Trophy, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

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

    const [code, setCode] = useState(question?.codeSnippet || '// Write your solution here');
    const [myProgress, setMyProgress] = useState(0); // 0 to 100
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [gameResult, setGameResult] = useState(null); // 'WIN' | 'LOSS'

    // Redirect if no question data (direct access safety)
    if (!question) return <div className="p-8 text-white">Loading Arena...</div>;

    useEffect(() => {
        if (!socket) return;

        socket.on('opponent_progress', (data) => {
            setOpponentProgress(data.progress);
        });

        socket.on('game_over', (data) => {
            const myUserId = JSON.parse(localStorage.getItem('user'))._id;
            if (data.winnerId === myUserId) {
                setGameResult('WIN');
                toast.success('🏆 VICTORY!', { duration: 5000 });
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

    const runCode = async () => {
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

            let passed = 0;
            const newLogs = [];

            // Run locally via Judge0 (client-side calls for V1 speed, ideally server-side proxy)
            // Note: In production, proxy through backend to hide API keys
            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                const cleanCode = code; // In real app, might need to wrap in main function depending on language

                // Call Judge0 (using similar logic to TestAttempt)
                const options = {
                    method: 'POST',
                    url: 'https://judge0-ce.p.rapidapi.com/submissions',
                    params: { base64_encoded: 'false', wait: 'true' },
                    headers: {
                        'content-type': 'application/json',
                        'Content-Type': 'application/json',
                        'X-RapidAPI-Key': import.meta.env.VITE_JUDGE0_KEY || 'YOUR_RAPIDAPI_KEY',
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                    },
                    data: {
                        language_id: 63, // JavaScript
                        source_code: cleanCode,
                        stdin: tc.input,
                        expected_output: tc.output
                    }
                };

                const response = await axios.request(options);
                const result = response.data;

                const isSuccess = result.status.id === 3; // Accepted
                if (isSuccess) passed++;

                newLogs.push({
                    case: i + 1,
                    status: isSuccess ? 'Pass' : 'Fail',
                    output: result.stdout,
                    error: result.stderr || result.compile_output
                });
            }

            setLogs(newLogs);

            // Calculate Progress
            const progress = Math.round((passed / testCases.length) * 100);
            setMyProgress(progress);

            // Emit to Server
            socket.emit('update_progress', { roomId, progress });

            if (progress === 100) {
                toast.loading('Verifying Victory...');
                // Server listens to update_progress -> 100 and declares winner
            }

        } catch (error) {
            console.error(error);
            toast.error('Execution Failed');
            setLogs(prev => [...prev, { case: 'Error', status: 'Fail', error: error.message }]);
        } finally {
            setIsRunning(false);
        }
    };

    const handleLeave = () => {
        navigate('/student/battle');
    };

    return (
        <div className="h-[calc(100vh-64px)] bg-black text-white flex flex-col">
            {/* Header / Status Bar */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase font-bold">You</span>
                        <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${myProgress}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-2xl font-black italic text-zinc-700">VS</div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-zinc-500 uppercase font-bold">Opponent</span>
                        <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-red-500 transition-all duration-500"
                                style={{ width: `${opponentProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="font-mono text-xl font-bold text-white">
                    {gameResult === 'WIN' && <span className="text-green-500">VICTORY</span>}
                    {gameResult === 'LOSS' && <span className="text-red-500">DEFEAT</span>}
                    {!gameResult && <span className="text-zinc-400">Battle in Progress</span>}
                </div>

                <button
                    onClick={handleLeave}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                >
                    Surrender
                </button>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Question */}
                <div className="w-1/3 border-r border-white/10 p-6 overflow-y-auto bg-zinc-950">
                    <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {question.title}
                    </h2>
                    <div className="prose prose-invert max-w-none text-zinc-400 text-sm">
                        <p>{question.description}</p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Examples</h3>
                        {question.testCases && question.testCases.slice(0, 2).map((tc, idx) => (
                            <div key={idx} className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-xs font-mono">
                                <div className="mb-2">
                                    <span className="text-zinc-500">Input:</span> <span className="text-white">{tc.input}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Output:</span> <span className="text-green-400">{tc.output}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Editor */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', monospace",
                                padding: { top: 20 }
                            }}
                        />
                        {/* Result Overlay */}
                        {gameResult && (
                            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                                <div className="text-center animate-in zoom-in duration-300">
                                    {gameResult === 'WIN' ? (
                                        <>
                                            <Trophy size={80} className="mx-auto text-yellow-500 mb-4" />
                                            <h1 className="text-6xl font-black text-white mb-2">VICTORY!</h1>
                                            <p className="text-zinc-400">You crushed your opponent.</p>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={80} className="mx-auto text-red-500 mb-4" />
                                            <h1 className="text-6xl font-black text-white mb-2">DEFEAT</h1>
                                            <p className="text-zinc-400">Better luck next time.</p>
                                        </>
                                    )}
                                    <button
                                        onClick={handleLeave}
                                        className="mt-8 px-8 py-3 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform"
                                    >
                                        Return to Lobby
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Editor Footer / Console */}
                    <div className="h-48 bg-zinc-900 border-t border-white/10 flex flex-col">
                        <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-950">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Console Output</span>
                            <button
                                onClick={runCode}
                                disabled={isRunning || !!gameResult}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${isRunning
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                                    }`}
                            >
                                {isRunning ? (
                                    <>Running...</>
                                ) : (
                                    <><Play size={12} fill="currentColor" /> Run Code</>
                                )}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                            {logs.length === 0 && (
                                <div className="text-zinc-600 italic">Run your code to see output results here...</div>
                            )}
                            {logs.map((log, idx) => (
                                <div key={idx} className="flex items-start gap-3 border-b border-white/5 pb-2 last:border-0">
                                    <div className={`mt-0.5 ${log.status === 'Pass' ? 'text-green-500' : 'text-red-500'}`}>
                                        {log.status === 'Pass' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-zinc-400">Test Case {log.case}</span>
                                            <span className={log.status === 'Pass' ? 'text-green-500' : 'text-red-500'}>{log.status}</span>
                                        </div>
                                        {log.error && (
                                            <div className="text-red-400 bg-red-900/10 p-2 rounded mb-1 whitespace-pre-wrap">{log.error}</div>
                                        )}
                                        {log.output && (
                                            <div className="text-zinc-500">Output: <span className="text-zinc-300">{log.output.trim()}</span></div>
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
