import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, List, Play, CheckCircle, AlertTriangle, XCircle, Activity, User, Monitor } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

const SystemLogs = () => {
    const { socket } = useSocket();
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const logsEndRef = useRef(null);
    const [stats, setStats] = useState({
        auth: 0,
        tests: 0,
        battles: 0,
        errors: 0
    });

    useEffect(() => {
        // Fetch initial logs and stats
        const fetchInitialData = async () => {
            try {
                const { data } = await api.get('/admin/logs');
                setLogs(data.logs);
                setStats(data.stats);
                setTimeout(scrollToBottom, 100);
            } catch (err) {
                console.error('Failed to fetch logs:', err);
            }
        };

        fetchInitialData();

        if (socket) {
            const handleNewLog = (log) => {
                setLogs(prev => [...prev, log].slice(-100)); // Keep last 100
                updateStats(log.type);
                setTimeout(scrollToBottom, 100);
            };

            socket.on('system_log', handleNewLog);
            return () => socket.off('system_log', handleNewLog);
        }
    }, [socket]);

    const updateStats = (type) => {
        setStats(prev => {
            const newStats = { ...prev };
            if (type === 'AUTH') newStats.auth++;
            if (type === 'TEST' || type === 'CUSTOM') newStats.tests++;
            if (type === 'BATTLE') newStats.battles++;
            if (type === 'ERROR') newStats.errors++;
            return newStats;
        });
    };

    const scrollToBottom = () => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'AUTH': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'TEST': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'BATTLE': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'ERROR': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'ADMIN': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'AUTH': return <User size={14} />;
            case 'TEST': return <CheckCircle size={14} />;
            case 'BATTLE': return <Activity size={14} />;
            case 'ERROR': return <AlertTriangle size={14} />;
            default: return <Monitor size={14} />;
        }
    };

    const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.type === filter);

    return (
        <div className="pt-24 min-h-screen bg-black px-4 md:px-8 pb-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Auth Events', count: stats.auth, icon: <User />, color: 'bg-blue-500' },
                        { label: 'Tests Taken', count: stats.tests, icon: <List />, color: 'bg-green-500' },
                        { label: 'Battles Fought', count: stats.battles, icon: <Activity />, color: 'bg-purple-500' },
                        { label: 'System Errors', count: stats.errors, icon: <AlertTriangle />, color: 'bg-red-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all ${stat.color} blur-xl rounded-bl-3xl w-24 h-24`} />
                            <div className="flex items-center gap-4 mb-2">
                                <div className={`p-2 rounded-lg bg-white/5 text-white`}>{stat.icon}</div>
                                <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
                            </div>
                            <div className="text-3xl font-black text-white">{stat.count}</div>
                        </div>
                    ))}
                </div>

                {/* Main Terminal Window */}
                <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">

                    {/* Toolbar */}
                    <div className="h-14 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            <div className="ml-4 flex items-center gap-2 text-zinc-400 text-xs font-mono">
                                <Terminal size={14} />
                                <span>kryzo-system-logs ~ root</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {['ALL', 'AUTH', 'TEST', 'BATTLE', 'ERROR'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all ${filter === f ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Log Stream */}
                    <div className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-2 custom-scrollbar bg-black/50">
                        <AnimatePresence>
                            {filteredLogs.length === 0 && (
                                <div className="text-zinc-600 italic text-center mt-20">Waiting for system events...</div>
                            )}
                            {filteredLogs.map((log, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-4 group"
                                >
                                    <div className="text-zinc-600 min-w-[80px] text-xs pt-1">
                                        {new Date(log.createdAt || Date.now()).toLocaleTimeString()}
                                    </div>
                                    <div className={`p-1 px-2 rounded text-[10px] font-bold border flex items-center gap-1 min-w-[80px] justify-center ${getTypeColor(log.type)}`}>
                                        {getTypeIcon(log.type)}
                                        {log.type}
                                    </div>
                                    <div className="text-zinc-300 break-all flex-1">
                                        <span className="mr-2">{log.message}</span>
                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                            <span className="text-zinc-600 text-xs">
                                                {JSON.stringify(log.metadata)}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={logsEndRef} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SystemLogs;
