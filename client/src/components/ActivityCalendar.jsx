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

    // return (
    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] p-5 backdrop-blur-sm w-full max-w-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <Flame size={20} className="text-orange-500 fill-orange-500/20" />
                    </div>
                    <div>
                        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-0.5">Current Streak</h3>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-white">{streak.current}</span>
                            <span className="text-zinc-500 font-bold uppercase text-[8px] tracking-widest">Days</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <Trophy size={20} className="text-blue-500 fill-blue-500/20" />
                    </div>
                    <div>
                        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-0.5">Longest Streak</h3>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-white">{streak.longest}</span>
                            <span className="text-zinc-500 font-bold uppercase text-[8px] tracking-widest">Days</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex flex-col items-end text-right">
                    <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                        <Info size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Daily Goal</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">30m study or 2 questions</p>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                {days.map((day, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.01 }}
                        className="relative group"
                    >
                        <div className={`aspect-square rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5
                            ${day.completed
                                ? 'bg-orange-500 border-orange-400'
                                : 'bg-white/5 border-white/5 hover:border-white/10'
                            }
                            ${day.isToday ? 'outline outline-1 outline-white/20 outline-offset-2' : ''}
                        `}>
                            <span className={`text-[9px] font-black ${day.completed ? 'text-white' : 'text-zinc-600'}`}>
                                {day.date.getDate()}
                            </span>
                            {day.completed && <Flame size={8} className="text-white fill-white/20" />}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-zinc-800 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-2xl">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">
                                {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white">
                                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                                    {Math.floor(day.time / 60)}m spent
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white">
                                    <div className="w-1 h-1 rounded-full bg-purple-500" />
                                    {day.questions} solved
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-white/5 border border-white/5" />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">Inactive</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-orange-500" />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">Completed</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <CalendarIcon size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">35 Days</span>
                </div>
            </div>
        </div>
    );
};

export default ActivityCalendar;
