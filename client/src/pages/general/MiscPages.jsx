import InfoPageLayout from './InfoPageLayout';
import { motion } from 'framer-motion';
import Footer from '../../components/Footer';

export const Integrations = () => (
    <div className="min-h-screen bg-black text-white">
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Integrations</h1>
            <p className="text-xl text-zinc-400 mb-20">Connect Kryzo with your favorite tools.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {['GitHub', 'GitLab', 'Slack', 'Discord', 'Notion', 'VS Code', 'Jira', 'Linear'].map(tool => (
                    <div key={tool} className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center font-bold text-xl">
                        {tool}
                    </div>
                ))}
            </div>
        </div>
        <Footer />
    </div>
);

export const Changelog = () => (
    <InfoPageLayout title="Changelog" date="v2.4.0">
        <h3>December 2024 - v2.4.0</h3>
        <ul>
            <li>**New Feature**: Added Custom Test Builder with multi-topic selection.</li>
            <li>**Improvement**: Enhanced Coding Question analysis in results.</li>
            <li>**Fix**: Resolved latency issues in real-time collaboration.</li>
        </ul>
        <h3>November 2024 - v2.3.0</h3>
        <ul>
            <li>**New Feature**: System Design playground beta launch.</li>
        </ul>
    </InfoPageLayout>
);

export const HelpCenter = () => (
    <div className="min-h-screen bg-black text-white">
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-8">How can we help?</h1>
            <input type="text" placeholder="Search for help articles..." className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-2xl p-6 text-lg focus:border-blue-500 focus:outline-none mb-12" />

            <div className="grid md:grid-cols-3 gap-6 text-left">
                {['Account & Billing', 'Course Content', 'Technical Issues'].map(cat => (
                    <div key={cat} className="p-6 rounded-2xl border border-white/5 hover:bg-zinc-900/50 cursor-pointer">
                        <h3 className="font-bold mb-2">{cat}</h3>
                        <p className="text-sm text-zinc-500">Manage settings, payments and more.</p>
                    </div>
                ))}
            </div>
        </div>
        <Footer />
    </div>
);

export const Documentation = () => (
    <InfoPageLayout title="Kryzo Documentation">
        <p>Welcome to the Kryzo developer documentation. Here you'll find comprehensive guides and documentation to help you start working with Kryzo as quickly as possible, as well as support if you get stuck.</p>
        <h3>Getting Started</h3>
        <p>If you are new to programming or looking to prepare for interviews, check out our <strong>Diagnostic Test</strong> to assess your current level.</p>
        <h3>API Reference</h3>
        <p>Our API is designed around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.</p>
    </InfoPageLayout>
);
