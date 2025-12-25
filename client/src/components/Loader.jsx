import { motion } from 'framer-motion';

const Loader = ({ size = 'medium', fullScreen = false }) => {
    const getSize = () => {
        switch (size) {
            case 'small': return 'w-5 h-5 border-2';
            case 'large': return 'w-12 h-12 border-4';
            default: return 'w-8 h-8 border-2';
        }
    };

    const loaderContent = (
        <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                        borderRadius: ["20%", "50%", "20%"]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 blur-md opacity-50 absolute inset-0 ${getSize()}`}
                />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className={`relative rounded-xl border-t-2 border-r-2 border-b-2 border-transparent border-t-white border-r-blue-400 ${getSize()}`}
                />
            </div>
            <motion.p
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                className="text-zinc-500 text-sm font-medium tracking-widest uppercase"
            >
                Loading
            </motion.p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
};

export default Loader;
