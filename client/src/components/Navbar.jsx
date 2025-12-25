import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, LayoutDashboard, PlusCircle, BookOpen } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Hide Navbar on Test Attempt pages (Diagnostic & Specific Test)
    // We keep it for 'custom' (builder) and 'result' (analytics)
    const isTestAttempt = location.pathname.startsWith('/student/test/') &&
        !location.pathname.includes('/custom') &&
        !location.pathname.includes('/result');

    if (isTestAttempt) return null;

    if (!user) return (
        <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-3">
                    <img src="/K_logo.png" alt="Kryzo" className="h-10 w-10 object-cover rounded-full bg-white/5 p-1 border border-white/10" />
                    <span className="text-xl font-bold tracking-tighter">KRYZO</span>
                </Link>
                <div className="flex gap-4">
                    <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign In</Link>
                    <Link to="/register" className="text-sm font-medium px-4 py-1.5 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors">Get Started</Link>
                </div>
            </div>
        </nav>
    );

    const isAdmin = user.role === 'admin';

    return (
        <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/" className="mr-8 hover:opacity-80 transition-opacity flex items-center gap-3">
                        <img src="/K_logo.png" alt="Kryzo" className="h-10 w-10 object-cover rounded-full bg-white/5 p-1 border border-white/10" />
                        <span className="text-xl font-bold tracking-tighter">KRYZO</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-1">
                        {isAdmin ? (
                            <>
                                <NavLink to="/admin/dashboard" icon={<LayoutDashboard size={18} />} active={location.pathname === '/admin/dashboard'}>Dashboard</NavLink>
                                <NavLink to="/admin/questions" icon={<BookOpen size={18} />} active={location.pathname === '/admin/questions'}>Questions</NavLink>
                                <NavLink to="/admin/documentation" icon={<BookOpen size={18} />} active={location.pathname === '/admin/documentation'}>Documentation</NavLink>
                                <NavLink to="/admin/users" icon={<PlusCircle size={18} />} active={location.pathname === '/admin/users'}>Manage Users</NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink to="/" icon={<LayoutDashboard size={18} />} active={location.pathname === '/'}>Home</NavLink>
                                <NavLink to="/about" icon={<BookOpen size={18} />} active={location.pathname === '/about'}>About</NavLink>
                                <NavLink to="/contact" icon={<PlusCircle size={18} />} active={location.pathname === '/contact'}>Contact</NavLink>
                                <NavLink to="/student/dashboard" icon={<LayoutDashboard size={18} />} active={location.pathname === '/student/dashboard'}>Dashboard</NavLink>
                                <NavLink to="/student/test/custom" icon={<PlusCircle size={18} />} active={location.pathname === '/student/test/custom'}>Study</NavLink>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to={isAdmin ? "/admin/profile" : "/student/profile"}
                        className="hidden sm:flex flex-col items-end mr-2 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <span className="text-xs font-medium text-white">{user.name}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.role}</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all group relative"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, children, icon, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
    >
        {icon}
        {children}
    </Link>
);

export default Navbar;
