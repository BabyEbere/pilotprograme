"use client";

import React, { useState, useEffect } from 'react';
import { MdVideoLibrary, MdAdd, MdDelete, MdCheckCircle, MdError, MdContentCopy } from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

const AdminTutorials = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [newTutorial, setNewTutorial] = useState({
        title: '',
        youtube_id: '',
        description: ''
    });

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        document.title = "Upload Tutorial | Admin Control";
        fetchTutorials();
    }, []);

    const fetchTutorials = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/tutorials`);
            const data = await res.json();
            if (data.success) {
                setTutorials(data.tutorials || []);
            }
        } catch (error) {
            showToast('Failed to fetch tutorials', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTutorial = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/admin/tutorials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTutorial)
            });
            const data = await res.json();
            if (data.success) {
                showToast('Tutorial uploaded successfully');
                setShowAddModal(false);
                setNewTutorial({ title: '', youtube_id: '', description: '' });
                fetchTutorials();
            } else {
                showToast(data.message || 'Failed to add tutorial', 'error');
            }
        } catch (error) {
            showToast('Network error while adding tutorial', 'error');
        }
    };

    const handleDeleteTutorial = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tutorial?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/tutorials/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Tutorial deleted successfully');
                fetchTutorials();
            } else {
                showToast(data.message || 'Failed to delete tutorial', 'error');
            }
        } catch (error) {
            showToast('Failed to delete tutorial', 'error');
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
                                <MdVideoLibrary className="text-red-500" />
                                Upload Tutorials
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Embed training or guide videos for user dashboard showing.</p>
                        </div>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold"
                        >
                            <MdAdd /> Upload Tutorial
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                    {/* List */}
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="p-4">Title & Details</th>
                                        <th className="p-4">YouTube Link / ID</th>
                                        <th className="p-4">Created At</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                                Loading tutorials...
                                            </td>
                                        </tr>
                                    ) : tutorials.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center text-gray-500 dark:text-gray-400 italic">
                                                No tutorials uploaded. Click "Upload Tutorial" to add one.
                                            </td>
                                        </tr>
                                    ) : tutorials.map(t => (
                                        <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-20 aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0">
                                                        <img 
                                                            src={`https://img.youtube.com/vi/${t.youtube_id}/hqdefault.jpg`} 
                                                            alt="thumbnail" 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{t.title}</div>
                                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-md line-clamp-2">{t.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs font-mono text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{t.youtube_id}</span>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`https://youtube.com/watch?v=${t.youtube_id}`);
                                                            showToast('Copied full link!');
                                                        }}
                                                        className="text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        <MdContentCopy size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(t.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleDeleteTutorial(t.id)} 
                                                    className="p-1.5 text-gray-500 hover:text-red-500 transition-colors" 
                                                    title="Delete"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Tutorial Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upload Video Tutorial</h2>
                        <form onSubmit={handleAddTutorial} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Video Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="e.g. Setting Up Voice Over Cloning"
                                    value={newTutorial.title}
                                    onChange={e => setNewTutorial({...newTutorial, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">YouTube ID or Link</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="e.g. dQw4w9WgXcQ or YouTube URL"
                                    value={newTutorial.youtube_id}
                                    onChange={e => setNewTutorial({...newTutorial, youtube_id: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea 
                                    rows="3"
                                    className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                                    placeholder="Enter summary or instructions..."
                                    value={newTutorial.description}
                                    onChange={e => setNewTutorial({...newTutorial, description: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 text-sm"
                                >
                                    Publish Video
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl animate-in slide-in-from-right-2 ${
                    toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default AdminTutorials;
