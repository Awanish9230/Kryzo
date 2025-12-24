import { useContext } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Mail } from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const AdminProfile = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">Admin Profile</h1>
                    <p className="text-zinc-500">Manage your account details and preferences.</p>
                </header>

                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-32 h-32 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center text-purple-500"
                        >
                            <User size={64} />
                        </motion.div>

                        <div className="flex-1 text-center md:text-left space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight mb-2">{user?.name || 'Admin User'}</h2>
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Shield size={12} />
                                        Administrator
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-zinc-900 border border-white/5 p-4 rounded-2xl">
                                    <div className="flex items-center gap-3 text-zinc-400 mb-1">
                                        <Mail size={16} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Email</span>
                                    </div>
                                    <p className="text-white font-medium">{user?.email}</p>
                                </div>
                                {/* Add more fields as needed */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
