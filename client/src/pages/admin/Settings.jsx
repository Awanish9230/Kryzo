import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Globe,
    Zap,
    Users,
    Share2,
    Palette,
    Save,
    Lock,
    ShieldAlert,
    Mail,
    BarChart3,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import api from '../../utils/api';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('global');
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/admin/settings');
            setSettings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings', settings);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
        </div>
    );

    const tabs = [
        { id: 'global', label: 'Global Config', icon: Globe },
        { id: 'ai', label: 'AI Tuning', icon: Zap },
        { id: 'users', label: 'User Access', icon: Users },
        { id: 'system', label: 'System & Logs', icon: Share2 },
        { id: 'branding', label: 'Visual Identity', icon: Palette },
    ];

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Side Navigation */}
                    <div className="w-full md:w-64 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                        : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                                    }`}
                            >
                                <tab.icon size={18} />
                                <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Main Content Pane */}
                    <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                            }`}
                                    >
                                        {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                        {message.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mb-10">
                            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
                                {tabs.find(t => t.id === activeTab).label}
                            </h1>
                            <p className="text-zinc-500 text-sm">Configure your platform behaviors and global variables.</p>
                        </div>

                        <div className="space-y-8">
                            {activeTab === 'global' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">MCQ Point Value</label>
                                            <input
                                                type="number"
                                                value={settings.global.mcqPoints}
                                                onChange={(e) => setSettings({ ...settings, global: { ...settings.global, mcqPoints: Number(e.target.value) } })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Coding Point Value</label>
                                            <input
                                                type="number"
                                                value={settings.global.codingPoints}
                                                onChange={(e) => setSettings({ ...settings, global: { ...settings.global, codingPoints: Number(e.target.value) } })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Toggle
                                            label="Negative Marking"
                                            description="Deduct points for incorrect MCQ answers"
                                            enabled={settings.global.negativeMarking}
                                            onChange={(val) => setSettings({ ...settings, global: { ...settings.global, negativeMarking: val } })}
                                        />
                                        <Toggle
                                            label="Maintenance Mode"
                                            description="Restrict student access for system updates"
                                            enabled={settings.global.maintenanceMode}
                                            onChange={(val) => setSettings({ ...settings, global: { ...settings.global, maintenanceMode: val } })}
                                        />
                                        <Toggle
                                            label="Copy-Paste Protection"
                                            description="Disable clipboard actions during tests"
                                            enabled={settings.global.copyPasteProtection}
                                            onChange={(val) => setSettings({ ...settings, global: { ...settings.global, copyPasteProtection: val } })}
                                        />
                                        <Toggle
                                            label="Window Blur Detection"
                                            description="Trigger warning when student leaves test tab"
                                            enabled={settings.global.windowBlurDetection}
                                            onChange={(val) => setSettings({ ...settings, global: { ...settings.global, windowBlurDetection: val } })}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ai' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Lock size={10} /> Gemini API Key
                                        </label>
                                        <input
                                            type="password"
                                            value={settings.ai.geminiApiKey}
                                            onChange={(e) => setSettings({ ...settings, ai: { ...settings.ai, geminiApiKey: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="sk-..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <Slider
                                            label="AI Temperature"
                                            description="Higher = More Creative explanations"
                                            value={settings.ai.promptTemperature}
                                            onChange={(val) => setSettings({ ...settings, ai: { ...settings.ai, promptTemperature: val } })}
                                        />
                                        <Slider
                                            label="Weakness Sensitivity"
                                            description="How heavily to weight skipped questions"
                                            value={settings.ai.weaknessSensitivity}
                                            onChange={(val) => setSettings({ ...settings, ai: { ...settings.ai, weaknessSensitivity: val } })}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="space-y-8">
                                    <Toggle
                                        label="Public Registration"
                                        description="Allow new student registrations"
                                        enabled={settings.user.registrationOpen}
                                        onChange={(val) => setSettings({ ...settings, user: { ...settings.user, registrationOpen: val } })}
                                    />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Allowed Email Domains</label>
                                        <textarea
                                            value={settings.user.allowedDomains.join(', ')}
                                            onChange={(e) => setSettings({ ...settings, user: { ...settings.user, allowedDomains: e.target.value.split(',').map(d => d.trim()).filter(d => d) } })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                                            placeholder="college.edu, university.org"
                                        />
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Separate domains with commas. Leave empty for no restriction.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'system' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SystemCard
                                        icon={<Mail className="text-blue-500" size={20} />}
                                        title="Email Templates"
                                        description="Customize system transactional emails"
                                        action="Manage"
                                    />
                                    <SystemCard
                                        icon={<BarChart3 className="text-purple-500" size={20} />}
                                        title="Analytics API"
                                        description="Configure GA4 or Mixpanel tracking"
                                        action="Configure"
                                    />
                                    <SystemCard
                                        icon={<ShieldAlert className="text-orange-500" size={20} />}
                                        title="Audit Logs"
                                        description="View administrative action history"
                                        action="View Logs"
                                    />
                                </div>
                            )}

                            {activeTab === 'branding' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Primary Logo URL</label>
                                            <input
                                                type="text"
                                                value={settings.branding.logoUrl}
                                                onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, logoUrl: e.target.value } })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Theme Colors</label>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2">
                                                    <input
                                                        type="color"
                                                        value={settings.branding.primaryColor}
                                                        onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
                                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                                    />
                                                    <span className="text-xs font-mono">{settings.branding.primaryColor}</span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2">
                                                    <input
                                                        type="color"
                                                        value={settings.branding.secondaryColor}
                                                        onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, secondaryColor: e.target.value } })}
                                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                                    />
                                                    <span className="text-xs font-mono">{settings.branding.secondaryColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-zinc-800/50 rounded-3xl border border-white/5 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Live Preview</p>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="px-6 py-2 rounded-xl font-bold text-sm shadow-xl"
                                                    style={{ backgroundColor: settings.branding.primaryColor, color: '#fff' }}
                                                >
                                                    Primary Button
                                                </div>
                                                <div
                                                    className="px-6 py-2 rounded-xl font-bold text-sm shadow-xl"
                                                    style={{ backgroundColor: settings.branding.secondaryColor, color: '#fff' }}
                                                >
                                                    Secondary
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                SAVE CHANGES
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Toggle = ({ label, description, enabled, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
        <div>
            <h4 className="text-sm font-bold text-white tracking-tight">{label}</h4>
            <p className="text-[10px] text-zinc-500 font-medium">{description}</p>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`w-12 h-6 rounded-full p-1 transition-all ${enabled ? 'bg-blue-600' : 'bg-zinc-700'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

const Slider = ({ label, description, value, onChange }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-end">
            <div>
                <h4 className="text-sm font-bold text-white tracking-tight">{label}</h4>
                <p className="text-[10px] text-zinc-500 font-medium">{description}</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-500">{(value * 10).toFixed(0)}/10</span>
        </div>
        <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
    </div>
);

const SystemCard = ({ icon, title, description, action }) => (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-zinc-900 rounded-xl">{icon}</div>
            <h4 className="font-bold text-sm text-white">{title}</h4>
        </div>
        <p className="text-xs text-zinc-500 font-medium mb-6 leading-relaxed">{description}</p>
        <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
            {action} →
        </button>
    </div>
);

export default SettingsPage;
