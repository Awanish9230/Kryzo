import { motion } from 'framer-motion';

const Loader = ({ size = 'medium', fullScreen = false }) => {

    // Ticks for the spinner
    const ticks = Array.from({ length: 12 });

    const loaderContent = (
        <div className="flex flex-col items-center gap-4">
            {/* Tick Spinner */}
            <div className="relative w-12 h-12">
                {ticks.map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute left-1/2 top-0 w-[3px] h-3.5 bg-zinc-600 rounded-full origin-[50%_24px]"
                        style={{
                            rotate: i * 30,
                            translateX: '-50%',
                        }}
                        animate={{
                            backgroundColor: ['#52525b', '#ffffff', '#52525b'], // zinc-600 to white to zinc-600
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.083,
                            ease: "linear" // Linear easing is smoother for this sequential spinner
                        }}
                    />
                ))}
            </div>

            {/* Loading Text with Animated Dots */}
            <div className="flex items-center text-zinc-500 text-sm font-semibold tracking-[0.2em] uppercase ml-3">
                <span>Loading</span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0 }}
                >.</motion.span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.2 }}
                >.</motion.span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.4 }}
                >.</motion.span>
            </div>
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
