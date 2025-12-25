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

const UserManagement = () => {
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
        if (window.confirm(`Are you sure you want to delete user "${name}"? This will permanently remove all their data.`)) {
            try {
                await api.delete(`/admin/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
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
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user');
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
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
                            <p className="text-zinc-500">Manage platform users and their permissions</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                        <Users size={20} />
                        Add New User
                    </button>
                </header>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or college ID..."
                            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-white/5 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-zinc-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-white focus:outline-none appearance-none cursor-pointer font-medium"
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
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Users</p>
                        <p className="text-3xl font-bold">{users.length}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Students</p>
                        <p className="text-3xl font-bold">{users.filter(u => u.role === 'student').length}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Admins</p>
                        <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-4">User</th>
                                    <th className="px-8 py-4">Role</th>
                                    <th className="px-8 py-4">College ID</th>
                                    <th className="px-8 py-4">Tests</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user, idx) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-white/[0.01] transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold tracking-tight">{user.name}</span>
                                                <span className="text-xs text-zinc-600">{user.email}</span>
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
                                            <span className="text-sm text-zinc-400 font-mono">{user.collegeId || '—'}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-white">{user.attemptCount || 0}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(user._id, user.name)}
                                                        className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
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
                            className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Edit User</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 ml-1 mb-2 block">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 ml-1 mb-2 block">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 ml-1 mb-2 block">Role</label>
                                    <select
                                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 ml-1 mb-2 block">College ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                        value={editingUser.collegeId || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, collegeId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 bg-zinc-800 border border-white/5 rounded-xl font-bold hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex-1 px-4 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
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
                            className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Add New User</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 ml-1 mb-2 block">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="John Doe"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 ml-1 mb-2 block">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="john@example.com"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 ml-1 mb-2 block">Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="••••••••"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 ml-1 mb-2 block">Role</label>
                                    <select
                                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 ml-1 mb-2 block">College ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="Optional"
                                        value={newUser.collegeId}
                                        onChange={(e) => setNewUser({ ...newUser, collegeId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 bg-zinc-800 border border-white/5 rounded-xl font-bold hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddUser}
                                    className="flex-1 px-4 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
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
