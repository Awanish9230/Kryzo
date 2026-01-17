import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Trash2,
    Edit2,
    Users,
    Shield,
    GraduationCap,
    X,
    Save
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const { theme } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get(`/admin/users?role=${roleFilter}`);
            setUsers(data.users || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-zinc-900 border border-white/10 shadow-2xl rounded-3xl pointer-events-auto flex flex-col overflow-hidden`}>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Delete User?</h3>
                            <p className="text-zinc-500 text-xs">Removing <span className="text-zinc-300 font-bold">"{name}"</span> is permanent.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-950 p-4 flex gap-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const loadingToast = toast.loading(`Deleting ${name}...`);
                            try {
                                await api.delete(`/admin/users/${id}`);
                                setUsers(users.filter(u => u._id !== id));
                                toast.success(`User "${name}" removed`, { id: loadingToast });
                            } catch (err) {
                                toast.error(err.response?.data?.message || 'Failed to delete user', { id: loadingToast });
                            }
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 transition-all font-mono"
                    >
                        PERFORM_DELETE
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            const { data } = await api.put(`/admin/users/${editingUser._id}`, {
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
                collegeId: editingUser.collegeId
            });
            setUsers(users.map(u => u._id === data._id ? { ...u, ...data } : u));
            setShowEditModal(false);
            setEditingUser(null);
            toast.success('User updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update user');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.collegeId && u.collegeId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        collegeId: ''
    });

    const { onlineUsers } = useSocket();

    const handleAddUser = async () => {
        try {
            const { data } = await api.post('/admin/users', newUser);
            setUsers([data, ...users]);
            setShowAddModal(false);
            setNewUser({
                name: '',
                email: '',
                password: '',
                role: 'student',
                collegeId: ''
            });
            toast.success('User created successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create user');
        }
    };

    if (loading) return (
        <Loader fullScreen />
    );

    return (
        <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-brand-text">User Management</h1>
                            <p className="text-brand-text-secondary">Manage platform users and their permissions</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-brand-text text-brand-bg font-bold rounded-2xl hover:bg-brand-text/90 transition-all flex items-center gap-2"
                    >
                        <Users size={20} />
                        Add New User
                    </button>
                </header>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary group-focus-within:text-brand-text transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or college ID..."
                            className="w-full pl-12 pr-4 py-3 bg-brand-card/30 border border-brand-border rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-brand-text placeholder:text-brand-text-secondary/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-6 py-3 bg-brand-card/30 border border-brand-border rounded-2xl text-brand-text focus:outline-none appearance-none cursor-pointer font-medium"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="student">Students</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-brand-card/30 border border-brand-border rounded-2xl p-6">
                        <p className="text-brand-text-secondary text-xs font-bold uppercase tracking-widest mb-2">Total Users</p>
                        <p className="text-3xl font-bold text-brand-text">{users.length}</p>
                    </div>
                    <div className="bg-brand-card/30 border border-brand-border rounded-2xl p-6">
                        <p className="text-brand-text-secondary text-xs font-bold uppercase tracking-widest mb-2">Students</p>
                        <p className="text-3xl font-bold text-brand-text">{users.filter(u => u.role === 'student').length}</p>
                    </div>
                    <div className="bg-brand-card/30 border border-brand-border rounded-2xl p-6">
                        <p className="text-brand-text-secondary text-xs font-bold uppercase tracking-widest mb-2">Admins</p>
                        <p className="text-3xl font-bold text-brand-text">{users.filter(u => u.role === 'admin').length}</p>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-brand-card/30 border border-brand-border rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-brand-bg/[0.02] text-brand-text-secondary text-[10px] font-bold uppercase tracking-widest border-b border-brand-border">
                                <tr>
                                    <th className="px-8 py-4">User</th>
                                    <th className="px-8 py-4">Role</th>
                                    <th className="px-8 py-4">College ID</th>
                                    <th className="px-8 py-4">Tests</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {filteredUsers.map((user, idx) => {
                                    const isOnline = onlineUsers?.includes(user._id);
                                    return (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-brand-bg/[0.01] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-brand-text font-bold tracking-tight">{user.name}</span>
                                                        {isOnline && (
                                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-brand-text-secondary">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {user.role === 'admin' ? (
                                                        <>
                                                            <Shield size={14} className="text-purple-500" />
                                                            <span className="text-xs font-bold uppercase text-purple-500">Admin</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <GraduationCap size={14} className="text-blue-500" />
                                                            <span className="text-xs font-bold uppercase text-blue-500">Student</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm text-brand-text-secondary font-mono">{user.collegeId || '—'}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-brand-text">{user.attemptCount || 0}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-brand-text-secondary hover:text-brand-text hover:bg-brand-secondary/10 rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDelete(user._id, user.name)}
                                                            className="p-2 text-brand-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {showEditModal && editingUser && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-brand-card border border-brand-border rounded-3xl p-8 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-brand-text">Edit User</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 hover:bg-brand-secondary/10 rounded-lg transition-all text-brand-text-secondary hover:text-brand-text"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1 mb-2 block">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-blue-500 transition-all"
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1 mb-2 block">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-blue-500 transition-all"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1 mb-2 block">Role</label>
                                    <select
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1 mb-2 block">College ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-blue-500 transition-all"
                                        value={editingUser.collegeId || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, collegeId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 bg-brand-secondary/5 border border-brand-border rounded-xl font-bold hover:bg-brand-secondary/10 transition-all text-brand-text"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex-1 px-4 py-3 bg-brand-text text-brand-bg rounded-xl font-bold hover:bg-brand-text/90 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-brand-card border border-brand-border rounded-3xl p-8 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-brand-text">Add New User</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-brand-secondary/10 rounded-lg transition-all text-brand-text-secondary hover:text-brand-text"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1 mb-2 block">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="John Doe"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1 mb-2 block">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="john@example.com"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1 mb-2 block">Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="••••••••"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1 mb-2 block">Role</label>
                                    <select
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-brand-text-secondary ml-1 mb-2 block">College ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="Optional"
                                        value={newUser.collegeId}
                                        onChange={(e) => setNewUser({ ...newUser, collegeId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 bg-brand-secondary/5 border border-brand-border rounded-xl font-bold hover:bg-brand-secondary/10 transition-all text-brand-text"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddUser}
                                    className="flex-1 px-4 py-3 bg-brand-text text-brand-bg rounded-xl font-bold hover:bg-brand-text/90 transition-all flex items-center justify-center gap-2"
                                >
                                    <Users size={18} />
                                    Create User
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
