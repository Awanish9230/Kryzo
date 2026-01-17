import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
    const { theme } = useTheme();

    useEffect(() => {
        console.warn('[MATCH-FAIL] Hit Catch-all route. Current URL:', window.location.pathname);
    }, []);
    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 text-center"
            >
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-6"
                >
                    <div className="p-4 bg-brand-card rounded-full border border-brand-border shadow-2xl shadow-blue-500/10 relative group">
                        <AlertCircle size={48} className="text-brand-text-secondary group-hover:text-blue-500 transition-colors" />
                        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </motion.div>

                <motion.h1
                    className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-brand-text to-brand-text-secondary mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    404
                </motion.h1>

                <motion.h2
                    className="text-2xl md:text-3xl font-semibold text-brand-text mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Page Not Found
                </motion.h2>

                <motion.p
                    className="text-brand-text-secondary max-w-md mx-auto mb-10 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Oops! The page you're looking for doesn't exist or has been moved.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-brand-text text-brand-bg rounded-xl font-bold hover:opacity-80 transition-all active:scale-95"
                    >
                        <Home size={20} />
                        Go Back Home
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NotFound;
