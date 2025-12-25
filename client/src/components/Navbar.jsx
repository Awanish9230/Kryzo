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
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 glass rounded-[2rem] px-8 h-12 flex items-center justify-between shadow-2xl">
            <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
                <img src="/K_logo.png" alt="Kryzo" className="h-6 w-6 object-cover rounded-full" />
                <span className="text-sm font-black tracking-tighter">KRYZO</span>
            </Link>
            <div className="flex gap-6 items-center">
                <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="text-[10px] font-black uppercase tracking-widest px-5 py-2 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors">Join</Link>
            </div>
        </nav>
    );

    const isAdmin = user.role === 'admin';

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 glass rounded-[2.5rem] px-8 h-14 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-12">
                <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
                    <img src="/K_logo.png" alt="Kryzo" className="h-7 w-7 object-cover rounded-full" />
                    <span className="text-sm font-black tracking-tighter">KRYZO</span>
                </Link>
                <div className="hidden md:flex items-center gap-2">
                    {isAdmin ? (
                        <>
                            <NavLink to="/admin/dashboard" active={location.pathname === '/admin/dashboard'}>Console</NavLink>
                            <NavLink to="/admin/questions" active={location.pathname === '/admin/questions'}>Library</NavLink>
                            <NavLink to="/admin/documentation" active={location.pathname === '/admin/documentation'}>Docs</NavLink>
                            <NavLink to="/admin/users" active={location.pathname === '/admin/users'}>Roster</NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/student/dashboard" active={location.pathname === '/student/dashboard'}>Hub</NavLink>
                            <NavLink to="/student/test/custom" active={location.pathname === '/student/test/custom'}>Study</NavLink>
                            <NavLink to="/student/profile" active={location.pathname === '/student/profile'}>Profile</NavLink>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-white uppercase tracking-tight">{user.name}</span>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">{user.role}</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
};

const NavLink = ({ to, children, active }) => (
    <Link
        to={to}
        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
    >
        {children}
    </Link>
);

export default Navbar;
