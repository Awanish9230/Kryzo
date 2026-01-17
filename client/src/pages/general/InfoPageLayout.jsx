import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const InfoPageLayout = ({ title, date, children }) => {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300">
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-brand-text">{title}</h1>
                        {date && <p className="text-brand-text-secondary mb-12">Last updated: {date}</p>}

                        <div className="prose prose-invert prose-lg max-w-none text-brand-text-secondary">
                            {children}
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default InfoPageLayout;
