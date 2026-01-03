import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext'; // Ensure this matches actual context export
import { motion } from 'framer-motion';
import { Swords, Users, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const BattleLobby = () => {
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [status, setStatus] = useState('Idle');
    const [queueTime, setQueueTime] = useState(0);
    const [activeUsers, setActiveUsers] = useState(1);

    // Verify socket connection on mount
    useEffect(() => {
        if (!socket) return;

        // Custom namespace socket might be needed if we used /battle namespace
        // For simplicity in V1, let's assume we are using the main socket or handle namespace in context.
        // Wait! The backend used io.of('/battle').
        // The standard useSocket() might return the default '/' namespace socket.
        // We might need to connect to the battle namespace specifically here or update SocketContext.

        // Let's assume for now we need a specific connection.
        // ACTUALLY, checking SocketContext.jsx, it connects to '/' by default.
        // We should probably create a specific socket for battle or update context to support multiple namespaces.
        // Or, simpler for V1: Just use the main namespace in backend too? 
        // No, namespaces are cleaner. Let's create a temporary socket here for /battle.

        // HOWEVER, to keep it fast, let's handle the namespace logic inside the component 
        // using a separate io connection if needed, OR just update the backend to use the main namespace for now
        // to avoid Context refactoring complexity.

        // DECISION: I will update the backend handler to use the ROOT namespace for V1 
        // to save time on refactoring the client context. Use `io.on` instead of `io.of`.

    }, [socket]);

    // ... (Wait, I'll update the backend handle in the next step to user root namespace for simplicity)

    useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => {
            console.log('BattleLobby: Connected to server!');
            setIsSearching(false);
            setStatus('Idle');
        });

        socket.on('disconnect', () => {
            console.log('BattleLobby: Disconnected from server');
            setIsSearching(false);
            setStatus('Offline');
        });

        socket.on('queue_joined', (data) => {
            console.log('BattleLobby: queue_joined received', data);
            setIsSearching(true);
            setStatus('Searching for opponent...');
            setQueueTime(0);
        });

        socket.on('match_found', (data) => {
            console.log('BattleLobby: match_found received', data);
            setIsSearching(false);
            setStatus('Match Found! Redirecting...');
            toast.success('Match Found! Entering Arena...');
            setTimeout(() => {
                navigate(`/student/battle/${data.roomId}`, { state: { battleData: data } });
            }, 1500);
        });

        socket.on('battle_users_count', (count) => {
            console.log('BattleLobby: battle_users_count', count);
            setActiveUsers(count);
        });

        socket.on('error', (err) => {
            console.error('BattleLobby: Socket error', err);
            toast.error(err.message || 'An error occurred');
            setIsSearching(false);
            setStatus('Idle');
        });

        return () => {
            socket.off('queue_joined');
            socket.off('match_found');
            socket.off('battle_users_count');
            socket.off('error');
        };
    }, [socket, navigate]);

    useEffect(() => {
        let interval;
        if (isSearching) {
            interval = setInterval(() => {
                setQueueTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSearching]);

    const handleFindMatch = () => {
        if (!socket) {
            console.error('BattleLobby: No socket instance found');
            toast.error('Connection lost. Reloading...');
            window.location.reload();
            return;
        }
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('BattleLobby: Emitting join_queue for user', user._id);
        socket.emit('join_queue', { userId: user._id });
        setStatus('Connecting to queue...');
    };

    const handleCancel = () => {
        if (socket) socket.emit('leave_queue');
        setIsSearching(false);
        setStatus('Idle');
        setQueueTime(0);
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center pt-24 pb-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl px-6 flex-grow flex flex-col justify-center">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-4 bg-zinc-900/50 border border-white/10 rounded-3xl mb-6 shadow-2xl shadow-blue-500/10"
                    >
                        <Swords size={48} className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        1v1 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Battle Arena</span>
                    </h1>
                    <p className="text-zinc-500 text-lg font-medium">
                        Challenge other students in real-time coding duels.
                    </p>
                </div>

                <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                    {/* Status Indicator */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-20" />

                    <div className="space-y-8">
                        {isSearching ? (
                            <div className="text-center py-8">
                                <div className="relative w-32 h-32 mx-auto mb-8">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-full h-full border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-black text-white font-mono">{formatTime(queueTime)}</span>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">{status}</h2>
                                <p className="text-zinc-500 text-sm">Finding worthy opponent...</p>

                                <button
                                    onClick={handleCancel}
                                    className="mt-8 px-8 py-3 bg-red-500/10 text-red-500 font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all text-xs border border-red-500/20"
                                >
                                    Cancel Search
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
                                    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                                        <Zap className="text-amber-500 mb-2" size={24} />
                                        <div className="text-2xl font-black text-white">Fast</div>
                                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Matchmaking</div>
                                    </div>
                                    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                                        <Clock className="text-blue-500 mb-2" size={24} />
                                        <div className="text-2xl font-black text-white">15m</div>
                                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Time Limit</div>
                                    </div>
                                    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                                        <Users className="text-purple-500 mb-2" size={24} />
                                        <div className="text-2xl font-black text-white">{activeUsers}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Online Gladiators</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleFindMatch}
                                    className="w-full py-6 bg-white text-black text-xl font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/10 relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        <Swords size={24} />
                                        Find Match
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BattleLobby;
