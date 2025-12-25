import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar as CalendarIcon, Info } from 'lucide-react';
import api from '../utils/api';

const ActivityCalendar = () => {
    const [activityData, setActivityData] = useState([]);
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        try {
            const { data } = await api.get('/student/activity/log');
            setActivityData(data.activities);
            setStreak(data.streak);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // Generate last 35 days for a 7x5 grid
    const generateDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 34; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const activity = activityData.find(a => a.date === dateStr);
            days.push({
                date: d,
                dateStr,
                isToday: dateStr === today.toISOString().split('T')[0],
                completed: activity?.isCompleted || false,
                questions: activity?.questionsSolved || 0,
                time: activity?.timeSpent || 0
            });
        }
        return days;
    };

    if (loading) return null;

    const days = generateDays();

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <Flame size={28} className="text-orange-500 fill-orange-500/20" />
                    </div>
                    <div>
                        <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Current Streak</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white">{streak.current}</span>
                            <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Days</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <Trophy size={28} className="text-blue-500 fill-blue-500/20" />
                    </div>
                    <div>
                        <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Longest Streak</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white">{streak.longest}</span>
                            <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Days</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex flex-col items-end text-right">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                        <Info size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Daily Goal</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">30m study or 2 solved questions</p>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-3 md:gap-4">
                {days.map((day, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.01 }}
                        className="relative group"
                    >
                        <div className={`aspect-square rounded-xl md:rounded-2xl border transition-all flex flex-col items-center justify-center gap-1
                            ${day.completed
                                ? 'bg-orange-500 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                                : 'bg-white/5 border-white/5 hover:border-white/10'
                            }
                            ${day.isToday ? 'outline outline-2 outline-white/20 outline-offset-4' : ''}
                        `}>
                            <span className={`text-[10px] md:text-sm font-black ${day.completed ? 'text-white' : 'text-zinc-600'}`}>
                                {day.date.getDate()}
                            </span>
                            {day.completed && <Flame size={12} className="text-white fill-white/20" />}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-2xl">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                                {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-bold text-white">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {Math.floor(day.time / 60)} min spent
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-white">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    {day.questions} questions solved
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-white/5 border border-white/5" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Inactive</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-orange-500" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Completed</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarIcon size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Last 35 Days</span>
                </div>
            </div>
        </div>
    );
};

export default ActivityCalendar;
