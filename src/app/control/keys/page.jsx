"use client";


import React, { useState, useEffect } from 'react';
import { 
    MdVpnKey, MdAdd, MdDelete, MdToggleOn, MdToggleOff, 
    MdRefresh, MdHistory, MdAudioFile, MdImage, MdCheckCircle, MdError,
    MdSearch, MdContentCopy
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

const AdminSiliconKeys = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [newKey, setNewKey] = useState({
        label: '',
        usage_type: 'audio',
        api_key: ''
    });

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        document.title = "SiliconFlow Keys | AI Studio Admin";
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/keys`);
            const data = await res.json();
            if (data.success) {
                setKeys(data.keys);
            }
        } catch (error) {
            showToast('Failed to fetch API keys', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddKey = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/admin/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newKey)
            });
            const data = await res.json();
            if (data.success) {
                showToast('Key added successfully');
                setShowAddModal(false);
                setNewKey({ label: '', usage_type: 'audio', api_key: '' });
                fetchKeys();
            } else {
                showToast(data.message || 'Failed to add key', 'error');
            }
        } catch (error) {
            showToast('Network error while adding key', 'error');
        }
    };

    const toggleKey = async (id) => {
        try {
            const res = await fetch(`${API_URL}/admin/keys/${id}/toggle`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                showToast('Key status updated');
                fetchKeys();
            }
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const deleteKey = async (id) => {
        if (!window.confirm('Are you sure you want to delete this key?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/keys/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Key deleted');
                fetchKeys();
            }
        } catch (error) {
            showToast('Failed to delete key', 'error');
        }
    };

    const resetUsage = async (id) => {
        if (!window.confirm('Reset usage count for this key?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/keys/${id}/reset`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                showToast('Usage count reset');
                fetchKeys();
            }
        } catch (error) {
            showToast('Failed to reset usage', 'error');
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                    <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MdVpnKey className="text-purple-500" />
                                SiliconFlow API Keys
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage dynamic keys with auto-failover & tracking.</p>
                        </div>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold"
                        >
                            <MdAdd /> Add Key
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-50 dark:bg-[#111111] p-5 rounded-xl border border-gray-200 dark:border-white/10">
                            <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Keys</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{keys.length}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#111111] p-5 rounded-xl border border-gray-200 dark:border-white/10">
                            <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Active Audio Keys</div>
                            <div className="text-2xl font-bold text-blue-400">
                                {keys.filter(k => k.usage_type === 'audio' && k.is_active).length}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#111111] p-5 rounded-xl border border-gray-200 dark:border-white/10">
                            <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Active Image Keys</div>
                            <div className="text-2xl font-bold text-pink-400">
                                {keys.filter(k => k.usage_type === 'image' && k.is_active).length}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="p-4">Label & Type</th>
                                        <th className="p-4">Key ID / Display</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Usage</th>
                                        <th className="p-4">Last Used</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                                Loading keys...
                                            </td>
                                        </tr>
                                    ) : keys.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-gray-500 dark:text-gray-400 italic">
                                                No API keys configured.
                                            </td>
                                        </tr>
                                    ) : keys.map(key => (
                                        <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${key.usage_type === 'audio' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                                                        {key.usage_type === 'audio' ? <MdAudioFile size={18} /> : <MdImage size={18} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{key.label}</div>
                                                        <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">{key.usage_type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs font-mono text-gray-600 dark:text-gray-500 dark:text-gray-400">
                                                {key.api_key_display}
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => toggleKey(key.id)} className="transition-all active:scale-95">
                                                    {key.is_active ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                                            <MdCheckCircle size={12} /> ACTIVE
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                                                            <MdError size={12} /> INACTIVE
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="p-4 font-bold text-sm text-gray-900 dark:text-white">
                                                {key.usage_count}
                                            </td>
                                            <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                                                {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => resetUsage(key.id)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors" title="Reset Usage">
                                                        <MdRefresh size={18} />
                                                    </button>
                                                    <button onClick={() => deleteKey(key.id)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                                        <MdDelete size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mt-8 bg-purple-500/5 border border-purple-400/20 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2">Internal Failover Logic</h4>
                        <p className="text-[11px] text-purple-200/60 leading-relaxed">
                            The system uses "Random Load Balancing". For each request, it picks a random key from your active pool. 
                            If a key fails with an authentication error (out of credits), the backend will <span className="text-purple-300 font-bold underline">automatically deactivate</span> it and instantly switch to a different working key.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Key Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Connect SiliconFlow Key</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Internal Label</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. Master TTS Key"
                                    value={newKey.label}
                                    onChange={e => setNewKey({...newKey, label: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Usage Platform</label>
                                <select 
                                    className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    value={newKey.usage_type}
                                    onChange={e => setNewKey({...newKey, usage_type: e.target.value})}
                                >
                                    <option value="audio">Audio (TTS Platform)</option>
                                    <option value="image">Image (Generation Platform)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">API Key</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono transition-colors"
                                    placeholder="sk-..."
                                    value={newKey.api_key}
                                    onChange={e => setNewKey({...newKey, api_key: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddKey}
                                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 text-sm"
                                >
                                    Enable Key
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl animate-in slide-in-from-right-2 ${
                    toast.type === 'error' ? 'bg-red-600 text-gray-900 dark:text-white' : 'bg-purple-600 text-gray-900 dark:text-white'
                }`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default AdminSiliconKeys;
