"use client";

import { useState, useEffect } from 'react';
import { MdAdd, MdDelete, MdEdit, MdSave, MdCancel, MdRefresh, MdSearch, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function SEOSettings() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPage, setSelectedPage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    
    const [formData, setFormData] = useState({
        page_slug: '',
        page_name: '',
        title: '',
        description: '',
        keywords: '',
        og_title: '',
        og_description: '',
        og_type: 'website',
        og_url: '',
        twitter_card: 'summary_large_image',
        twitter_title: '',
        twitter_description: '',
        robots: 'index, follow',
        breadcrumb_title: '',
        custom_head_script: '',
        status: 'active'
    });

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/seo/pages`);
            const data = await res.json();
            if (data.success) {
                setPages(data.pages || []);
            } else {
                showMessage('error', 'Failed to fetch SEO pages');
            }
        } catch (err) {
            console.error('Error fetching SEO pages:', err);
            showMessage('error', 'Error fetching SEO pages');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            page_slug: '',
            page_name: '',
            title: '',
            description: '',
            keywords: '',
            og_title: '',
            og_description: '',
            og_type: 'website',
            og_url: '',
            twitter_card: 'summary_large_image',
            twitter_title: '',
            twitter_description: '',
            robots: 'index, follow',
            breadcrumb_title: '',
            custom_head_script: '',
            status: 'active'
        });
        setSelectedPage(null);
        setIsEditing(false);
    };

    const handleEdit = (page) => {
        setSelectedPage(page);
        setFormData(page);
        setIsEditing(true);
    };

    const handleCreate = () => {
        resetForm();
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            const url = isEditing 
                ? `${API_URL}/admin/seo/pages/${selectedPage.id}`
                : `${API_URL}/admin/seo/pages`;
            
            const method = isEditing ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            if (data.success) {
                showMessage('success', isEditing ? 'SEO page updated successfully' : 'SEO page created successfully');
                fetchPages();
                resetForm();
            } else {
                showMessage('error', data.message || 'Failed to save SEO page');
            }
        } catch (err) {
            console.error('Error saving SEO page:', err);
            showMessage('error', 'Error saving SEO page');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this SEO page?')) return;
        
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/seo/pages/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showMessage('success', 'SEO page deleted successfully');
                fetchPages();
                if (selectedPage && selectedPage.id === id) {
                    resetForm();
                }
            } else {
                showMessage('error', data.message || 'Failed to delete SEO page');
            }
        } catch (err) {
            console.error('Error deleting SEO page:', err);
            showMessage('error', 'Error deleting SEO page');
        } finally {
            setLoading(false);
        }
    };

    const filteredPages = pages.filter(page => 
        page.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.page_slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            
            <main className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SEO Page Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage SEO metadata for all landing pages</p>
                    </div>

                    {/* Message Alert */}
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Pages List */}
                        <div className="xl:col-span-1 bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pages</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={fetchPages}
                                        disabled={loading}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
                                        title="Refresh"
                                    >
                                        <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        className="p-2 bg-red-600 text-gray-900 dark:text-white rounded-lg hover:bg-red-700 transition-colors"
                                        title="Add New Page"
                                    >
                                        <MdAdd className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative mb-4">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search pages..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {/* Pages List */}
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {filteredPages.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No pages found</p>
                                ) : (
                                    filteredPages.map((page) => (
                                        <div
                                            key={page.id}
                                            onClick={() => handleEdit(page)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                                selectedPage && selectedPage.id === page.id
                                                    ? 'bg-red-600 text-gray-900 dark:text-white'
                                                    : 'bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#252525] text-gray-900 dark:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{page.page_name}</p>
                                                    <p className="text-xs opacity-70 truncate">/{page.page_slug}</p>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        page.status === 'active' 
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                                    }`}>
                                                        {page.status}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(page.id);
                                                        }}
                                                        disabled={loading}
                                                        className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="xl:col-span-2 bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {isEditing ? 'Edit SEO Settings' : 'Add New SEO Page'}
                                </h2>
                                {selectedPage && (
                                    <button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors"
                                    >
                                        {showPreview ? <MdVisibilityOff className="w-4 h-4" /> : <MdVisibility className="w-4 h-4" />}
                                        {showPreview ? 'Hide Preview' : 'Preview'}
                                    </button>
                                )}
                            </div>

                            {selectedPage || !isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Slug *</label>
                                            <input
                                                type="text"
                                                name="page_slug"
                                                value={formData.page_slug}
                                                onChange={handleInputChange}
                                                disabled={isEditing}
                                                placeholder="e.g., home, about, features"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Name *</label>
                                            <input
                                                type="text"
                                                name="page_name"
                                                value={formData.page_name}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Home Page, About Page"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* SEO Meta */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="SEO page title (max 60 chars recommended)"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Meta description (max 160 chars recommended)"
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords</label>
                                        <input
                                            type="text"
                                            name="keywords"
                                            value={formData.keywords}
                                            onChange={handleInputChange}
                                            placeholder="Comma-separated keywords"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    {/* Breadcrumb */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Breadcrumb Title</label>
                                        <input
                                            type="text"
                                            name="breadcrumb_title"
                                            value={formData.breadcrumb_title}
                                            onChange={handleInputChange}
                                            placeholder="Breadcrumb display text"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    {/* Open Graph */}
                                    <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Open Graph Tags</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OG Title</label>
                                                <input
                                                    type="text"
                                                    name="og_title"
                                                    value={formData.og_title}
                                                    onChange={handleInputChange}
                                                    placeholder="Open Graph title"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OG Type</label>
                                                <select
                                                    name="og_type"
                                                    value={formData.og_type}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <option value="website">Website</option>
                                                    <option value="article">Article</option>
                                                    <option value="video">Video</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OG Description</label>
                                            <textarea
                                                name="og_description"
                                                value={formData.og_description}
                                                onChange={handleInputChange}
                                                placeholder="Open Graph description"
                                                rows={2}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OG URL</label>
                                            <input
                                                type="text"
                                                name="og_url"
                                                value={formData.og_url}
                                                onChange={handleInputChange}
                                                placeholder="https://pilotprogramme.com/page"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Twitter Card */}
                                    <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Twitter Card</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Type</label>
                                                <select
                                                    name="twitter_card"
                                                    value={formData.twitter_card}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <option value="summary_large_image">Summary Large Image</option>
                                                    <option value="summary">Summary</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter Title</label>
                                                <input
                                                    type="text"
                                                    name="twitter_title"
                                                    value={formData.twitter_title}
                                                    onChange={handleInputChange}
                                                    placeholder="Twitter card title"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter Description</label>
                                            <textarea
                                                name="twitter_description"
                                                value={formData.twitter_description}
                                                onChange={handleInputChange}
                                                placeholder="Twitter card description"
                                                rows={2}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Advanced */}
                                    <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Advanced</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Robots Meta</label>
                                                <input
                                                    type="text"
                                                    name="robots"
                                                    value={formData.robots}
                                                    onChange={handleInputChange}
                                                    placeholder="index, follow"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Head Script</label>
                                            <textarea
                                                name="custom_head_script"
                                                value={formData.custom_head_script}
                                                onChange={handleInputChange}
                                                placeholder="Custom HTML/Script for head section"
                                                rows={4}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 bg-red-600 text-gray-900 dark:text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MdSave className="w-5 h-5" />
                                            {isEditing ? 'Update' : 'Create'}
                                        </button>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="px-4 py-2 bg-gray-200 dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#252525] transition-colors flex items-center gap-2"
                                            >
                                                <MdCancel className="w-5 h-5" />
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <p>Select a page to edit or create a new one</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Modal */}
                    {showPreview && selectedPage && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-[#111111] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">SEO Preview</h3>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                                    >
                                        <MdCancel className="w-6 h-6" />
                                    </button>
                                </div>
                                
                                {/* Google Preview */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Google Search Result</h4>
                                    <div className="border border-gray-200 dark:border-white/10 rounded-lg p-4 bg-gray-50 dark:bg-[#1a1a1a]">
                                        <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer truncate">
                                            {selectedPage.title || 'Page Title'}
                                        </p>
                                        <p className="text-green-700 dark:text-green-400 text-sm truncate">
                                            {selectedPage.og_url || 'https://pilotprogramme.com/page'}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                            {selectedPage.description || 'Page description...'}
                                        </p>
                                    </div>
                                </div>

                                {/* Twitter Preview */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Twitter Card</h4>
                                    <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden bg-gray-50 dark:bg-[#1a1a1a]">
                                        <div className="p-4">
                                            <p className="text-gray-900 dark:text-white font-medium truncate">
                                                {selectedPage.twitter_title || selectedPage.title}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mt-1">
                                                {selectedPage.twitter_description || selectedPage.description}
                                            </p>
                                        </div>
                                        <div className="h-32 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                                            <p className="text-white text-sm">Image Preview</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
