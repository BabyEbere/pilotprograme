"use client";

import { useState, useEffect } from 'react';
import { MdAdd, MdDelete, MdEdit, MdSave, MdCancel, MdRefresh } from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function StoryLabSettings() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [niches, setNiches] = useState([]);
    const [styles, setStyles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [newNiche, setNewNiche] = useState('');
    const [newStyle, setNewStyle] = useState('');
    const [editingNiche, setEditingNiche] = useState(null);
    const [editingStyle, setEditingStyle] = useState(null);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000');

    useEffect(() => {
        fetchPresets();
    }, []);

    const fetchPresets = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/story/presets`);
            const data = await res.json();
            if (data.success) {
                setNiches(data.niches || []);
                setStyles(data.styles || []);
            } else {
                showMessage('error', 'Failed to fetch presets');
            }
        } catch (err) {
            console.error('Error fetching presets:', err);
            showMessage('error', 'Error fetching presets');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const addNiche = async () => {
        if (!newNiche.trim()) return;
        
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/story/presets/niche`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newNiche.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setNiches([...niches, newNiche.trim()]);
                setNewNiche('');
                showMessage('success', 'Niche added successfully');
            } else {
                showMessage('error', data.message || 'Failed to add niche');
            }
        } catch (err) {
            console.error('Error adding niche:', err);
            showMessage('error', 'Error adding niche');
        } finally {
            setLoading(false);
        }
    };

    const deleteNiche = async (nicheName) => {
        if (!confirm(`Are you sure you want to delete "${nicheName}"?`)) return;
        
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/story/presets/niche/${encodeURIComponent(nicheName)}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setNiches(niches.filter(n => n !== nicheName));
                showMessage('success', 'Niche deleted successfully');
            } else {
                showMessage('error', data.message || 'Failed to delete niche');
            }
        } catch (err) {
            console.error('Error deleting niche:', err);
            showMessage('error', 'Error deleting niche');
        } finally {
            setLoading(false);
        }
    };

    const addStyle = async () => {
        if (!newStyle.trim()) return;
        
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/story/presets/style`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newStyle.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setStyles([...styles, newStyle.trim()]);
                setNewStyle('');
                showMessage('success', 'Style added successfully');
            } else {
                showMessage('error', data.message || 'Failed to add style');
            }
        } catch (err) {
            console.error('Error adding style:', err);
            showMessage('error', 'Error adding style');
        } finally {
            setLoading(false);
        }
    };

    const deleteStyle = async (styleName) => {
        if (!confirm(`Are you sure you want to delete "${styleName}"?`)) return;
        
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/story/presets/style/${encodeURIComponent(styleName)}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setStyles(styles.filter(s => s !== styleName));
                showMessage('success', 'Style deleted successfully');
            } else {
                showMessage('error', data.message || 'Failed to delete style');
            }
        } catch (err) {
            console.error('Error deleting style:', err);
            showMessage('error', 'Error deleting style');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            
            <main className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Story Lab Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage niches and styles for the Story Lab feature</p>
                    </div>

                    {/* Message Alert */}
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Niches Section */}
                        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Niches (Genres)</h2>
                                <button
                                    onClick={fetchPresets}
                                    disabled={loading}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
                                    title="Refresh"
                                >
                                    <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Add Niche */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newNiche}
                                    onChange={(e) => setNewNiche(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addNiche()}
                                    placeholder="Enter new niche..."
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <button
                                    onClick={addNiche}
                                    disabled={loading || !newNiche.trim()}
                                    className="px-4 py-2 bg-red-600 text-gray-900 dark:text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <MdAdd className="w-5 h-5" />
                                    Add
                                </button>
                            </div>

                            {/* Niches List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {niches.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No niches found</p>
                                ) : (
                                    niches.map((niche, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg group"
                                        >
                                            <span className="text-gray-900 dark:text-white">{niche}</span>
                                            <button
                                                onClick={() => deleteNiche(niche)}
                                                disabled={loading}
                                                className="p-2 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <MdDelete className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Styles Section */}
                        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Styles</h2>
                                <button
                                    onClick={fetchPresets}
                                    disabled={loading}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
                                    title="Refresh"
                                >
                                    <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Add Style */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newStyle}
                                    onChange={(e) => setNewStyle(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addStyle()}
                                    placeholder="Enter new style..."
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <button
                                    onClick={addStyle}
                                    disabled={loading || !newStyle.trim()}
                                    className="px-4 py-2 bg-red-600 text-gray-900 dark:text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <MdAdd className="w-5 h-5" />
                                    Add
                                </button>
                            </div>

                            {/* Styles List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {styles.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No styles found</p>
                                ) : (
                                    styles.map((style, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg group"
                                        >
                                            <span className="text-gray-900 dark:text-white">{style}</span>
                                            <button
                                                onClick={() => deleteStyle(style)}
                                                disabled={loading}
                                                className="p-2 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <MdDelete className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            <strong>Note:</strong> Changes made here will immediately affect the Story Lab feature. Users will see the updated niches and styles in their dropdown menus.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
