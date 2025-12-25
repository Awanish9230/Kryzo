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
    Calendar
} from 'lucide-react';
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
    Tooltip
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
                                            {profile.user.college || 'Full Stack University'}
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-sm text-zinc-300">
                                            <Calendar size={16} className="text-purple-500" />
                                            Class of {profile.user.passingYear || '2026'}
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-sm text-zinc-300">
                                            <MapPin size={16} className="text-red-500" />
                                            {profile.user.state || 'Global'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Level Badge & Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {/* Level Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="md:col-span-2 bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm relative overflow-hidden"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${levelColors[level]} opacity-10`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-4 bg-gradient-to-br ${levelColors[level]} rounded-2xl text-white`}>
                                    {levelIcons[level]}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Level</p>
                                    <h2 className="text-3xl font-bold tracking-tight">{level}</h2>
                                </div>
                            </div>
                            <p className="text-zinc-400 text-sm">
                                {level === 'Beginner' && 'Keep practicing to reach Intermediate!'}
                                {level === 'Intermediate' && 'Great progress! Aim for Advanced level.'}
                                {level === 'Advanced' && 'Excellent work! Expert level is within reach.'}
                                {level === 'Expert' && 'Outstanding! You\'re at the top of your game.'}
                            </p>
                        </div>
                    </motion.div>

                    {/* Tests Taken */}
                    <StatCard
                        icon={<CheckCircle2 className="text-green-500" />}
                        label="Tests Taken"
                        value={profile.stats?.testsTaken || profile.testsTaken}
                        delay={0.1}
                    />

                    {/* Questions Solved - NEW */}
                    <StatCard
                        icon={<Target className="text-purple-500" />}
                        label="Questions Solved"
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
                                    className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-white text-lg">{topic.topic}</h3>
                                        <span className={`text-xl font-bold ${topic.accuracy >= 80 ? 'text-green-500' : topic.accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
                                            }`}>
                                            {topic.accuracy}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
                                        <div
                                            className={`h-2 rounded-full transition-all ${topic.accuracy >= 80 ? 'bg-green-500' : topic.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${topic.accuracy}%` }}
                                        ></div>
                                    </div>

                                    {/* Breakdown */}
                                    {topic.breakdown && (
                                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Easy</p>
                                                <p className={`font-bold ${topic.breakdown.easy.accuracy >= 80 ? 'text-green-500' : 'text-zinc-400'}`}>{topic.breakdown.easy.accuracy}%</p>
                                            </div>
                                            <div className="text-center border-l border-r border-white/5">
                                                <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Medium</p>
                                                <p className={`font-bold ${topic.breakdown.medium.accuracy >= 80 ? 'text-yellow-500' : 'text-zinc-400'}`}>{topic.breakdown.medium.accuracy}%</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Hard</p>
                                                <p className={`font-bold ${topic.breakdown.hard.accuracy >= 80 ? 'text-red-500' : 'text-zinc-400'}`}>{topic.breakdown.hard.accuracy}%</p>
                                            </div>
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

                {/* Recent Activity */}
                {profile.recentAttempts && profile.recentAttempts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Activity</h2>
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-sm">
                            <div className="divide-y divide-white/5">
                                {profile.recentAttempts.map((attempt, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + idx * 0.1 }}
                                        className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-xl">
                                                <Clock size={20} className="text-zinc-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">Test Completed</p>
                                                <p className="text-xs text-zinc-600">
                                                    {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{attempt.score}</p>
                                            <p className="text-xs text-zinc-600">Score</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
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
