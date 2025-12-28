import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import {
    User,
    Award,
    Target,
    TrendingUp,
    Clock,
    CheckCircle2,
    Trophy,
    Zap,
    Edit2,
    Save,
    X,
    Camera,
    MapPin,
    GraduationCap,
    Calendar,
    Activity
} from 'lucide-react';
import ActivityCalendar from '../../components/ActivityCalendar';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/student/profile');
            setProfile(data);
            setFormData({
                name: data.user.name,
                college: data.user.college || '',
                collegeId: data.user.collegeId || '',
                passingYear: data.user.passingYear || '',
                state: data.user.state || '',
                profileImage: data.user.profileImage || ''
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500000) { // 500KB limit
                alert("File too large. Please upload an image under 500KB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const { data } = await api.put('/student/profile', formData);
            // Update local profile state with returned user data
            setProfile(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    name: data.name,
                    college: data.college,
                    collegeId: data.collegeId,
                    passingYear: data.passingYear,
                    state: data.state,
                    profileImage: data.profileImage
                }
            }));
            setIsEditing(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update profile');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <p className="text-zinc-500">Unable to load profile</p>
            </div>
        </div>
    );

    const level = profile.stats?.level || 'Beginner';

    const levelColors = {
        'Beginner': 'from-zinc-500 to-zinc-600',
        'Intermediate': 'from-blue-500 to-blue-600',
        'Advanced': 'from-purple-500 to-purple-600',
        'Expert': 'from-yellow-500 to-yellow-600'
    };

    const levelIcons = {
        'Beginner': <Target size={24} />,
        'Intermediate': <Zap size={24} />,
        'Advanced': <Award size={24} />,
        'Expert': <Trophy size={24} />
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header Profile Section */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm mb-12 relative overflow-hidden group">
                    {/* Edit Button */}
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`absolute top-8 right-8 z-20 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xl ${isEditing
                            ? 'bg-white text-black hover:bg-zinc-200'
                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                    >
                        {isEditing ? (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        ) : (
                            <>
                                <Edit2 size={18} />
                                Edit Profile
                            </>
                        )}
                    </button>
                    {isEditing && (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-8 right-44 z-20 p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                        >
                            <X size={18} />
                        </button>
                    )}

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        {/* Profile Image */}
                        <div className="relative group/image">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black bg-zinc-800 overflow-hidden shadow-2xl relative">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                        <User size={64} className="text-zinc-600" />
                                    </div>
                                )}
                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all cursor-pointer">
                                        <Camera size={24} className="text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                            <div className={`absolute bottom-2 right-2 p-2 rounded-full border-4 border-black ${levelColors[level].replace('to-', 'bg-')}`}>
                                {levelIcons[level]}
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="flex-1 text-center md:text-left space-y-4 w-full">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Full Name</label>
                                        <input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">College ID</label>
                                        <input
                                            value={formData.collegeId}
                                            onChange={e => setFormData({ ...formData, collegeId: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="College ID"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">College Name</label>
                                        <input
                                            value={formData.college}
                                            onChange={e => setFormData({ ...formData, college: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="Enter College Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Passing Year</label>
                                        <input
                                            value={formData.passingYear}
                                            onChange={e => setFormData({ ...formData, passingYear: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="e.g. 2026"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">State</label>
                                        <input
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="e.g. California"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h1 className="text-4xl font-bold tracking-tight mb-2">{profile.user.name}</h1>
                                        <p className="text-zinc-500 font-medium">{profile.user.email}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-sm text-zinc-300">
                                            <GraduationCap size={16} className="text-blue-500" />
                                            {profile.user.college || 'Kryzo'}
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-sm text-zinc-300">
                                            <Calendar size={16} className="text-purple-500" />
                                            Class of {profile.user.passingYear || '2025'}
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-sm text-zinc-300">
                                            <Zap size={16} className="text-yellow-500" />
                                            {profile.user.currentStreak || 0} Day Streak
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-sm text-zinc-300">
                                            <MapPin size={16} className="text-red-500" />
                                            {profile.user.state || 'India'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Overview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Weekly Activity Chart */}
                    <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                    <Activity size={18} />
                                </div>
                                <h3 className="font-bold text-lg">Weekly Activity</h3>
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Time Spent (Mins)</span>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={profile.dailyActivity || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#52525b"
                                        fontSize={10}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                    />
                                    <Bar dataKey="timeSpent" radius={[4, 4, 0, 0]}>
                                        {profile.dailyActivity?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.timeSpent > 30 ? '#3b82f6' : '#52525b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Stats Column */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Global Rank</p>
                                <p className="text-3xl font-black text-white">#{profile.stats.globalRank || '---'}</p>
                            </div>
                            <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500">
                                <Trophy size={24} />
                            </div>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Avg. Accuracy</p>
                                <p className="text-3xl font-black text-white">{Math.round((profile.stats.totalQuestionsSolved / profile.stats.totalQuestionsAttempted) * 100) || 0}%</p>
                            </div>
                            <div className="p-4 bg-green-500/10 rounded-2xl text-green-500">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Tracker Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <Activity className="text-orange-500" size={24} />
                        <h2 className="text-2xl font-bold tracking-tight">Daily Activity Tracker</h2>
                    </div>
                    <ActivityCalendar />
                </div>

                {/* Level Badge & Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {/* Level Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="md:col-span-2 bg-zinc-900/50 border border-white/5 rounded-[2.2rem] p-8 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-all"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${levelColors[level]} opacity-5 group-hover:opacity-10 transition-all`}></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className={`p-6 bg-gradient-to-br ${levelColors[level]} rounded-3xl text-white shadow-2xl`}>
                                {levelIcons[level]}
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Rank Standing</p>
                                <h2 className="text-4xl font-black tracking-tighter mb-2">{level}</h2>
                                <p className="text-zinc-400 text-xs font-medium max-w-xs">
                                    {level === 'Beginner' && 'The journey of a thousand code blocks begins with a single line.'}
                                    {level === 'Intermediate' && 'You\'ve mastered the basics. The complex logic awaits your command.'}
                                    {level === 'Advanced' && 'Architecture and performance are now your second language.'}
                                    {level === 'Expert' && 'A grandmaster of the digital realm. Nothing is impossible.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tests Taken */}
                    <StatCard
                        icon={<CheckCircle2 className="text-green-500" size={20} />}
                        label="Certifications"
                        value={profile.stats?.testsTaken || 0}
                        delay={0.1}
                    />

                    {/* Questions Solved */}
                    <StatCard
                        icon={<Target className="text-purple-500" size={20} />}
                        label="Problems Slain"
                        value={profile.stats?.totalQuestionsSolved || 0}
                        delay={0.15}
                    />
                </div>

                {/* Percentile Ranking */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-[2rem] p-8 mb-12"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Performance Trend</p>
                            <div className="h-64 w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={profile.scoreTrend}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={profile.topicMastery.slice(0, 6)}>
                                        <PolarGrid stroke="#27272a" />
                                        <PolarAngleAxis dataKey="topic" tick={{ fill: '#71717a', fontSize: 10 }} />
                                        <Radar name="Accuracy" dataKey="accuracy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2 text-center">Skill Map (Top Topics)</p>
                        </div>
                    </div>
                </motion.div>

                {/* Learning Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-green-500/5 border border-green-500/10 rounded-[2rem] p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
                                <TrendingUp size={16} />
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Top Strength</h4>
                        </div>
                        <p className="text-xl font-black text-white mb-1">
                            {profile.topicMastery[0]?.topic || 'N/A'}
                        </p>
                        <p className="text-xs font-medium text-zinc-500">
                            Mastery: {profile.topicMastery[0]?.accuracy || 0}%
                        </p>
                    </div>

                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2rem] p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                <Target size={16} />
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Focus Area</h4>
                        </div>
                        <p className="text-xl font-black text-white mb-1">
                            {profile.topicMastery[profile.topicMastery.length - 1]?.topic || 'N/A'}
                        </p>
                        <p className="text-xs font-medium text-zinc-500">
                            Current Accuracy: {profile.topicMastery[profile.topicMastery.length - 1]?.accuracy || 0}%
                        </p>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                <Zap size={16} />
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Growth Trend</h4>
                        </div>
                        <p className="text-xl font-black text-white mb-1">
                            {profile.scoreTrend[profile.scoreTrend.length - 1]?.score > (profile.stats.averageScore || 0) ? 'Trending Up' : 'Steady Pace'}
                        </p>
                        <p className="text-xs font-medium text-zinc-500">
                            Based on last 10 attempts
                        </p>
                    </div>
                </div>

                {/* Topic Mastery */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Topic Mastery</h2>
                    {profile.topicMastery.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.topicMastery.map((topic, idx) => (
                                <motion.div
                                    key={topic.topic}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.05 }}
                                    className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm group hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${topic.accuracy >= 80 ? 'bg-green-500' : topic.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                            <h3 className="font-bold text-white uppercase text-[11px] tracking-widest">{topic.topic}</h3>
                                        </div>
                                        <span className={`text-xl font-black ${topic.accuracy >= 80 ? 'text-green-500' : topic.accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {topic.accuracy}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-6 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${topic.accuracy}%` }}
                                            className={`h-full rounded-full transition-all ${topic.accuracy >= 80 ? 'bg-green-500' : topic.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        />
                                    </div>

                                    {/* Breakdown */}
                                    {topic.breakdown && (
                                        <div className="grid grid-cols-3 gap-4">
                                            {['easy', 'medium', 'hard'].map((diff) => (
                                                <div key={diff} className="text-center">
                                                    <p className="text-[9px] uppercase text-zinc-500 font-black tracking-tighter mb-1">{diff}</p>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className={`text-xs font-black ${topic.breakdown[diff].accuracy >= 80 ? 'text-green-500' : topic.breakdown[diff].accuracy >= 50 ? 'text-yellow-500' : 'text-zinc-500'}`}>
                                                            {topic.breakdown[diff].accuracy}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center">
                            <p className="text-zinc-500">No topic data available yet. Take more tests to see your mastery!</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity Overhaul */}
                {profile.recentAttempts && profile.recentAttempts.length > 0 && (
                    <div className="mb-20">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                    <Clock size={18} />
                                </div>
                                <h2 className="text-2xl font-black tracking-tighter">Recent Transmissions</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {profile.recentAttempts.map((attempt, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                    className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 hover:bg-zinc-900/60 hover:border-white/10 transition-all flex flex-col md:flex-row items-center gap-6"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl bg-gradient-to-br ${attempt.score / (attempt.maxScore || 1) >= 0.8 ? 'from-green-500/20 to-green-600/20 text-green-500' : 'from-blue-500/20 to-blue-600/20 text-blue-500'}`}>
                                            {Math.round((attempt.score / (attempt.maxScore || 1)) * 100)}%
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-white mb-1">{attempt.testTitle}</h4>
                                            <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
                                                <span>{new Date(attempt.date).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                                <span>{attempt.totalCount} Questions</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-8 px-8 border-x border-white/5">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Correct</p>
                                            <p className="font-black text-green-500">{attempt.correctCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total</p>
                                            <p className="font-black text-white">{attempt.totalCount}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pr-2">
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-white">{attempt.score}</p>
                                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Points earned</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/student/review/${attempt._id}`)}
                                            className="p-4 bg-white/5 text-white rounded-2xl hover:bg-white hover:text-black transition-all"
                                        >
                                            <TrendingUp size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};

const StatCard = ({ icon, label, value, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm hover:border-white/10 transition-all"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-2xl">
                {icon}
            </div>
        </div>
        <h3 className="text-zinc-500 text-xs font-medium mb-1 uppercase tracking-widest">{label}</h3>
        <p className="text-3xl font-bold tracking-tighter">{value}</p>
    </motion.div>
);

export default Profile;
