"use client";

import { useState, useEffect } from 'react';
import {
    MdPeople,
    MdBlock,
    MdDeleteForever,
    MdCheckCircle,
    MdSearch,
    MdWarning,
    MdUpgrade
} from 'react-icons/md';
import { Crown, AlertTriangle, Shield } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminUsers() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    // Modal states
    const [showBanModal, setShowBanModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [reason, setReason] = useState('');

    // Upgrade plan state
    const [plans, setPlans] = useState([]);
    const [upgradePlanId, setUpgradePlanId] = useState('');
    const [upgradeDays, setUpgradeDays] = useState(30);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        document.title = "Manage Users | AI Studio Admin";
        fetchUsers();
        fetchPlans();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/users`);
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/plans`);
            const data = await res.json();
            if (data.success) {
                setPlans(data.plans);
                if (data.plans.length > 0) setUpgradePlanId(String(data.plans[0].id));
            }
        } catch { }
    };

    const handleSuspend = async (userId) => {
        const r = window.prompt('Reason for suspension (optional):') ?? '';
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: r })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, status: data.status } : u));
                showToast(`User ${data.status}.`);
            } else {
                showToast(data.message, 'error');
            }
        } catch {
            showToast("Failed to update user status.", 'error');
        }
    };

    const confirmBan = (user) => {
        setSelectedUser(user);
        setReason('');
        setShowBanModal(true);
    };

    const executeBan = async () => {
        if (!selectedUser) return;
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/admin/users/${selectedUser.id}/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'banned', generated_scripts: 0 } : u));
                setShowBanModal(false);
                showToast(`${selectedUser.full_name} has been banned.`);
            } else {
                showToast(data.message, 'error');
            }
        } catch {
            showToast("Failed to ban user.", 'error');
        } finally {
            setProcessing(false);
        }
    };

    const confirmDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const executeDelete = async () => {
        if (!selectedUser) return;
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/admin/users/${selectedUser.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter(u => u.id !== selectedUser.id));
                setShowDeleteModal(false);
                showToast('User account deleted.');
            } else {
                showToast(data.message, 'error');
            }
        } catch {
            showToast("Failed to delete account.", 'error');
        } finally {
            setProcessing(false);
        }
    };

    const confirmUpgrade = (user) => {
        setSelectedUser(user);
        setUpgradeDays(30);
        setShowUpgradeModal(true);
    };

    const executeUpgrade = async () => {
        if (!selectedUser || !upgradePlanId) return;
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/admin/users/${selectedUser.id}/upgrade-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: parseInt(upgradePlanId), duration_days: upgradeDays })
            });
            const data = await res.json();
            if (data.success) {
                const planName = plans.find(p => String(p.id) === String(upgradePlanId))?.name || 'Plan';
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, plan_name: planName } : u));
                setShowUpgradeModal(false);
                showToast(data.message);
            } else {
                showToast(data.message, 'error');
            }
        } catch {
            showToast("Failed to upgrade plan.", 'error');
        } finally {
            setProcessing(false);
        }
    };

    const planColor = (name) => {
        if (!name || name === 'Free') return 'bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10';
        if (name.toLowerCase().includes('pro')) return 'bg-blue-500/10 text-blue-300 border-blue-200';
        if (name.toLowerCase().includes('starter')) return 'bg-emerald-500/10 text-emerald-300 border-emerald-200';
        return 'bg-purple-50 text-purple-700 border-purple-200';
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Moderate accounts, manage plans, and enforce limits.</p>
                            </div>

                            <div className="relative max-w-sm w-full sm:w-auto">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500 dark:text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-80 pl-10 pr-4 py-2 bg-white dark:bg-[#0a0a0a] border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-600 dark:text-gray-500 dark:text-gray-400">
                            <div className="w-10 h-10 border-4 border-gray-200 dark:border-white/10 border-t-red-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Loading users...</p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10">
                                            <th className="p-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                            <th className="p-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                                            <th className="p-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Scripts</th>
                                            <th className="p-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="p-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-white dark:bg-[#0a0a0a]/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 border border-white/20">
                                                            <MdPeople className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{user.full_name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${planColor(user.plan_name)}`}>
                                                        {user.plan_name === 'Free' ? null : <Crown className="w-3 h-3" />}
                                                        {user.plan_name || 'Free'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{user.generated_scripts || 0}</span>
                                                </td>
                                                <td className="p-4">
                                                    {user.status === 'active' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active
                                                        </span>
                                                    )}
                                                    {user.status === 'suspended' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                                            <MdBlock className="w-3.5 h-3.5" />Suspended
                                                        </span>
                                                    )}
                                                    {user.status === 'banned' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                                            <MdWarning className="w-3.5 h-3.5" />Banned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end items-center gap-2">

                                                        {/* Upgrade Plan */}
                                                        <button
                                                            onClick={() => confirmUpgrade(user)}
                                                            className="px-3 py-1.5 rounded text-xs font-bold bg-gray-50 dark:bg-[#111111] text-blue-400 border border-blue-200 hover:bg-blue-500/10 transition-colors flex items-center gap-1"
                                                            title="Manually upgrade plan"
                                                        >
                                                            <Crown className="w-3 h-3" />
                                                            Upgrade
                                                        </button>

                                                        {/* Suspension Toggle */}
                                                        {user.status !== 'banned' && (
                                                            <button
                                                                onClick={() => handleSuspend(user.id)}
                                                                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors border ${user.status === 'active'
                                                                    ? 'bg-gray-50 dark:bg-[#111111] text-orange-600 border-orange-200 hover:bg-orange-50'
                                                                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                                    }`}
                                                            >
                                                                {user.status === 'active' ? 'Suspend' : 'Unsuspend'}
                                                            </button>
                                                        )}

                                                        {/* Ban */}
                                                        {user.status !== 'banned' && (
                                                            <button
                                                                onClick={() => confirmBan(user)}
                                                                className="px-3 py-1.5 rounded text-xs font-bold bg-gray-50 dark:bg-[#111111] text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                                                            >
                                                                Ban
                                                            </button>
                                                        )}

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => confirmDelete(user)}
                                                            className="p-1.5 rounded text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:bg-white/5 hover:text-red-600 transition-colors"
                                                            title="Delete Account"
                                                        >
                                                            <MdDeleteForever className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                    No users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── UPGRADE PLAN MODAL ─────────────────────────────────────── */}
            {showUpgradeModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100 dark:bg-[#1a1a1a]/60 backdrop-blur-sm">
                    <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-blue-600 px-6 py-5 flex items-center gap-3">
                            <Crown className="w-6 h-6 text-gray-900 dark:text-white" />
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upgrade Plan</h3>
                                <p className="text-blue-200 text-xs">{selectedUser.full_name}</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-100 text-xs text-blue-300">
                                Use this to manually activate a plan for a user whose payment got stuck or for an admin override.
                                The user's usage counters will be reset and they'll receive an email notification.
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                                <select
                                    value={upgradePlanId}
                                    onChange={(e) => setUpgradePlanId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — ₦{Number(p.price_naira).toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={upgradeDays}
                                    onChange={(e) => setUpgradeDays(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2.5 border border-white/20 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-white dark:bg-[#0a0a0a]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeUpgrade}
                                    disabled={processing || !upgradePlanId}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    <Crown className="w-4 h-4" />
                                    {processing ? 'Upgrading...' : 'Upgrade Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── BAN MODAL ─────────────────────────────────────────────── */}
            {showBanModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100 dark:bg-[#1a1a1a]/60 backdrop-blur-sm">
                    <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <MdWarning className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">Permanent Ban</h3>
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                            You are about to permanently ban <strong>{selectedUser.full_name}</strong>.
                            All their content will be erased and they will be emailed the reason.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for ban *</label>
                            <textarea
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Repeated violation of our content policy..."
                                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-red-500 resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBanModal(false)}
                                className="flex-1 px-4 py-2.5 border border-white/20 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-white dark:bg-[#0a0a0a]"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeBan}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-red-700 flex justify-center items-center"
                                disabled={processing || !reason.trim()}
                            >
                                {processing ? 'Banning...' : 'Ban & Erase Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE MODAL ──────────────────────────────────────────── */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100 dark:bg-[#1a1a1a]/60 backdrop-blur-sm">
                    <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 dark:bg-white/5 mb-4">
                            <MdDeleteForever className="h-6 w-6 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Delete Account</h3>
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                            Permanently erase <strong>{selectedUser.full_name}</strong>'s account and all their data. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2.5 border border-white/20 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-white dark:bg-[#0a0a0a]"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-100 dark:bg-[#1a1a1a] flex justify-center items-center"
                                disabled={processing}
                            >
                                {processing ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TOAST ─────────────────────────────────────────────────── */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg ${toast.type === 'error' ? 'bg-red-600 text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'
                    }`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
