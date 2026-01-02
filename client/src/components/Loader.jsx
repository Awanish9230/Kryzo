import { motion } from 'framer-motion';

const Loader = ({ size = 'medium', fullScreen = false, showText = true, className = "" }) => {
    // Size-based configuration
    const sizes = {
        small: { container: 'w-10 h-10', svg: 40, strokeWidth: 4, text: 'text-[10px]' },
        medium: { container: 'w-20 h-20', svg: 80, strokeWidth: 6, text: 'text-xs' },
        large: { container: 'w-32 h-32', svg: 120, strokeWidth: 8, text: 'text-sm' }
    };

    const s = sizes[size] || sizes.medium;
    const center = s.svg / 2;
    const radius = (s.svg - s.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const loaderContent = (
        <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
            <div className={`relative ${s.container} flex items-center justify-center`}>
                {/* Secondary static glow/background ring */}
                <svg width={s.svg} height={s.svg} className="absolute rotate-[-90deg]">
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth={s.strokeWidth}
                    />
                </svg>

                {/* Primary rotating gradient ring */}
                <motion.svg
                    width={s.svg}
                    height={s.svg}
                    viewBox={`0 0 ${s.svg} ${s.svg}`}
                    className="rotate-[-90deg]"
                    animate={{ rotate: 270 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <defs>
                        <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="url(#loaderGradient)"
                        strokeWidth={s.strokeWidth}
                        strokeLinecap="round"
                        filter="url(#glow)"
                        initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }}
                        animate={{
                            strokeDasharray: [
                                `1 ${circumference}`,
                                `${circumference * 0.7} ${circumference}`,
                                `1 ${circumference}`
                            ],
                            strokeDashoffset: [0, -circumference * 0.2, -circumference]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.svg>

                {/* Inner decorative pulse */}
                <motion.div
                    className="absolute bg-blue-500/10 rounded-full"
                    style={{ width: s.svg * 0.4, height: s.svg * 0.4 }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Premium Loading Text */}
            {showText && (
                <div className={`flex flex-col items-center gap-1`}>
                    <motion.div
                        className={`${s.text} font-black text-white tracking-[0.4em] uppercase opacity-40 select-none flex`}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {"LOADING".split("").map((letter, i) => (
                            <motion.span
                                key={i}
                                animate={{ y: [0, -2, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                    ease: "easeInOut"
                                }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </motion.div>
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-1 h-1 bg-blue-500 rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.2, 1, 0.2]
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-[100] overflow-hidden">
                {/* Background ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="relative z-10">{loaderContent}</div>
            </div>
        );
    }

    return loaderContent;
};

export default Loader;
