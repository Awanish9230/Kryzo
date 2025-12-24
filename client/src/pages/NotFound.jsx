import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="flex-1 flex items-center justify-center p-6 pt-32">
                <div className="text-center max-w-lg mx-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-8 relative inline-block"
                    >
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                        <Ghost size={120} className="relative z-10 text-zinc-800 mx-auto" />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-bold text-white">404</span>
                    </motion.div>

                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Page not found</h1>
                    <p className="text-zinc-500 mb-10 text-lg">
                        Oops! The page you are looking for has vanished into the void or never existed.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Home size={18} />
                            Go Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-zinc-900 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NotFound;
