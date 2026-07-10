"use client";

import { useState, useEffect } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdToggleOn, MdToggleOff, MdVideoLibrary, MdSubdirectoryArrowRight, MdClose } from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminNiches() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Sub-niche states
    const [showSubNicheModal, setShowSubNicheModal] = useState(false);
    const [selectedNicheForSub, setSelectedNicheForSub] = useState(null);
    const [subNiches, setSubNiches] = useState([]);
    const [subNicheForm, setSubNicheForm] = useState({ name: '', aiPromptModifier: '', description: '' });

    const [niches, setNiches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        aiPrompt: '',
        isFaceless: false
    });
    const [editingNiche, setEditingNiche] = useState(null);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000');

    // Fetch niches from backend
    const fetchNiches = async () => {
        try {
            setLoading(true);
            const url = searchQuery
                ? `${API_URL}/niches?search=${encodeURIComponent(searchQuery)}`
                : `${API_URL}/niches`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setNiches(data.niches);
            } else {
                alert('Failed to fetch niches: ' + data.message);
            }
        } catch (error) {
            console.error('Error fetching niches:', error);
            alert('Error fetching niches. Please check if the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubNiches = async (nicheId) => {
        try {
            const response = await fetch(`${API_URL}/niches/${nicheId}/sub-niches`);
            const data = await response.json();
            if (data.success) {
                setSubNiches(data.sub_niches);
            }
        } catch (error) {
            console.error('Error fetching sub-niches:', error);
        }
    };

    useEffect(() => {
        fetchNiches();
    }, []);

    // Search handler with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchNiches();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/niches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    ai_prompt: formData.aiPrompt,
                    is_faceless: formData.isFaceless
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Niche created successfully!');
                setShowCreateModal(false);
                setFormData({ name: '', description: '', aiPrompt: '', isFaceless: false });
                fetchNiches();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error creating niche:', error);
            alert('Error creating niche. Please try again.');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/niches/${editingNiche.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    ai_prompt: formData.aiPrompt,
                    is_faceless: formData.isFaceless
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Niche updated successfully!');
                setShowEditModal(false);
                setEditingNiche(null);
                setFormData({ name: '', description: '', aiPrompt: '', isFaceless: false });
                fetchNiches();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating niche:', error);
            alert('Error updating niche. Please try again.');
        }
    };

    const handleCreateSubNiche = async (e) => {
        e.preventDefault();
        if (!selectedNicheForSub) return;

        try {
            const response = await fetch(`${API_URL}/sub-niches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    niche_id: selectedNicheForSub.id,
                    name: subNicheForm.name,
                    description: subNicheForm.description,
                    ai_prompt_modifier: subNicheForm.aiPromptModifier
                })
            });
            const data = await response.json();
            if (data.success) {
                setSubNicheForm({ name: '', aiPromptModifier: '', description: '' });
                fetchSubNiches(selectedNicheForSub.id);
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error creating sub-niche:', error);
        }
    };

    const handleDeleteSubNiche = async (id) => {
        if (!confirm('Are you sure you want to delete this sub-niche?')) return;
        try {
            const response = await fetch(`${API_URL}/sub-niches/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchSubNiches(selectedNicheForSub.id);
            }
        } catch (error) {
            console.error('Error deleting sub-niche:', error);
        }
    };

    const openSubNicheModal = (niche) => {
        setSelectedNicheForSub(niche);
        fetchSubNiches(niche.id);
        setShowSubNicheModal(true);
    };

    const handleToggleStatus = async (nicheId) => {
        try {
            const response = await fetch(`${API_URL}/niches/${nicheId}/toggle`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                fetchNiches();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Error toggling status. Please try again.');
        }
    };

    const handleDelete = async (nicheId, nicheName) => {
        if (!confirm(`Are you sure you want to delete "${nicheName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/niches/${nicheId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('Niche deleted successfully!');
                fetchNiches();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting niche:', error);
            alert('Error deleting niche. Please try again.');
        }
    };

    const openEditModal = (niche) => {
        setEditingNiche(niche);
        setFormData({
            name: niche.name,
            description: niche.description,
            aiPrompt: niche.ai_prompt,
            isFaceless: niche.is_faceless === 1 || niche.is_faceless === true
        });
        setShowEditModal(true);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Niches</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage content niches and AI prompts</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center"
                            >
                                <MdAdd className="w-4 h-4" />
                                Create Niche
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search niches..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Niches Grid */}
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading niches...</p>
                        </div>
                    ) : niches.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No niches found. Create your first niche!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {niches.map((niche) => (
                                <div
                                    key={niche.id}
                                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-semibold text-gray-900 text-base">{niche.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${niche.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {niche.status}
                                                </span>
                                                {(niche.is_faceless === 1 || niche.is_faceless === true) && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                                                        <MdVideoLibrary className="w-3 h-3" />
                                                        Faceless YouTube
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-500">{niche.description}</p>
                                        </div>
                                    </div>

                                    {/* AI Prompt */}
                                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs font-semibold text-gray-700 mb-1">AI Prompt:</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-500 line-clamp-3">{niche.ai_prompt}</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-3 pb-3 border-b border-gray-100">
                                        <div className="text-center">
                                            <p className="text-lg font-semibold text-gray-900">{niche.user_count || 0}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-500">Users</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-semibold text-gray-900">{niche.script_count || 0}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-500">Scripts</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(niche.created_at).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-500">Created</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => openSubNicheModal(niche)}
                                            className="w-full sm:w-auto flex-1 px-3 py-1.5 border border-blue-200 text-blue-700 rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MdSubdirectoryArrowRight className="w-4 h-4" />
                                            Sub-Niches
                                        </button>
                                        <button
                                            onClick={() => openEditModal(niche)}
                                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MdEdit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(niche.id)}
                                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {niche.status === 'active' ? (
                                                <MdToggleOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            ) : (
                                                <MdToggleOn className="w-4 h-4 text-green-600" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(niche.id, niche.name)}
                                            className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                                        >
                                            <MdDelete className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sub-Niche Modal */}
            {showSubNicheModal && selectedNicheForSub && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Manage Sub-Niches</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-500">For {selectedNicheForSub.name}</p>
                            </div>
                            <button
                                onClick={() => setShowSubNicheModal(false)}
                                className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500"
                            >
                                <MdClose className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {/* List Existing */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Existing Sub-Niches</h3>
                                {subNiches.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">No sub-niches found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {subNiches.map(sub => (
                                            <div key={sub.id} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{sub.name}</h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">{sub.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSubNiche(sub.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title="Delete Sub-Niche"
                                                >
                                                    <MdDelete className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add New */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Add New Sub-Niche</h3>
                                <form onSubmit={handleCreateSubNiche} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={subNicheForm.name}
                                                onChange={(e) => setSubNicheForm({ ...subNicheForm, name: e.target.value })}
                                                placeholder="e.g. Animal Parables"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <input
                                                type="text"
                                                value={subNicheForm.description}
                                                onChange={(e) => setSubNicheForm({ ...subNicheForm, description: e.target.value })}
                                                placeholder="Brief description"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Specific AI Instructions *</label>
                                        <textarea
                                            required
                                            value={subNicheForm.aiPromptModifier}
                                            onChange={(e) => setSubNicheForm({ ...subNicheForm, aiPromptModifier: e.target.value })}
                                            rows="3"
                                            placeholder="Specific context/rules for this sub-niche (will be added to the main niche prompt)."
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium"
                                        >
                                            Add Sub-Niche
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Niche</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Niche Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Technology, Health & Fitness"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of this niche"
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    />
                                </div>

                                {/* AI Prompt */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        AI Content Prompt *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.aiPrompt}
                                        onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                                        placeholder="Instructions for AI when creating content for this niche..."
                                        rows="5"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        This prompt will guide the AI when generating scripts, images, and audio for users in this niche.
                                    </p>
                                </div>

                                {/* Faceless YouTube Checkbox */}
                                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <input
                                        type="checkbox"
                                        id="isFaceless"
                                        checked={formData.isFaceless}
                                        onChange={(e) => setFormData({ ...formData, isFaceless: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                                    />
                                    <label htmlFor="isFaceless" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                                        <MdVideoLibrary className="w-4 h-4 text-purple-600" />
                                        This niche is for faceless YouTube content
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setFormData({ name: '', description: '', aiPrompt: '', isFaceless: false });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Create Niche
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Niche</h2>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Niche Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Technology, Health & Fitness"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of this niche"
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    />
                                </div>

                                {/* AI Prompt */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        AI Content Prompt *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.aiPrompt}
                                        onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                                        placeholder="Instructions for AI when creating content for this niche..."
                                        rows="5"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    />
                                </div>

                                {/* Faceless YouTube Checkbox */}
                                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <input
                                        type="checkbox"
                                        id="editIsFaceless"
                                        checked={formData.isFaceless}
                                        onChange={(e) => setFormData({ ...formData, isFaceless: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                                    />
                                    <label htmlFor="editIsFaceless" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                                        <MdVideoLibrary className="w-4 h-4 text-purple-600" />
                                        This niche is for faceless YouTube content
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingNiche(null);
                                            setFormData({ name: '', description: '', aiPrompt: '', isFaceless: false });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Update Niche
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
