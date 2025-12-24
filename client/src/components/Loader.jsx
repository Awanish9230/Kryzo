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
        <div className="flex flex-col items-center gap-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={`rounded-full border-zinc-700 border-t-white ${getSize()}`}
            />
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
