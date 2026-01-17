import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';


const Blog = () => {
    const { theme } = useTheme();
    const posts = [
        { title: "Mastering Dynamic Programming in 2024", date: "Dec 12, 2024", cat: "Engineering", read: "5 min read", img: "bg-blue-500" },
        { title: "How we scaled our database to 1M users", date: "Nov 30, 2024", cat: "Case Study", read: "8 min read", img: "bg-purple-500" },
        { title: "The future of technical interviews", date: "Nov 15, 2024", cat: "Culture", read: "4 min read", img: "bg-green-500" },
    ];

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300">
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-16">The Blog</h1>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <div className={`aspect-video rounded-3xl ${post.img}/10 mb-6 border border-brand-border overflow-hidden relative`}>
                                    <div className={`absolute inset-0 ${post.img}/20 blur-3xl`} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Placeholder for image */}
                                        <span className="font-bold text-brand-text/20 text-4xl">Kryzo</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-3">
                                    <span className="text-blue-500">{post.cat}</span>
                                    <span>•</span>
                                    <span>{post.read}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors text-brand-text">{post.title}</h3>
                                <p className="text-brand-text-secondary line-clamp-2">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Blog;
