"use client";

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
    MdPersonAdd, MdEdit, MdDelete, MdSearch, MdLanguage, 
    MdEmail, MdLink, MdAssignmentInd, MdCloudUpload 
} from 'react-icons/md';
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';

export default function AdminBlogAuthors() {
    const [authors, setAuthors] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    
    // Modal & Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        avatar: '',
        bio: '',
        gender: 'male',
        email: '',
        social_github: '',
        social_linkedin: '',
        social_facebook: '',
        social_instagram: '',
        external_websites: ['']
    });

    // Bulk Assign Modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAuthorId, setSelectedAuthorId] = useState('');
    const [selectedPostIds, setSelectedPostIds] = useState([]);

    const API_URL = (typeof window !== 'undefined' 
        ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
            ? 'http://localhost:5000' 
            : 'https://s1.pilotprograme.com/api') 
        : 'http://localhost:5000');

    useEffect(() => {
        fetchAuthors();
        fetchPosts();
    }, []);

    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/blog/authors`);
            const data = await res.json();
            if (data.success) setAuthors(data.authors || []);
        } catch (err) {
            console.error("Failed to fetch authors", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/blog/posts`);
            const data = await res.json();
            if (data.success) setPosts(data.posts || []);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        }
    };

    const openCreateModal = () => {
        setEditingAuthor(null);
        setFormData({
            name: '',
            slug: '',
            avatar: '',
            bio: '',
            gender: 'male',
            email: '',
            social_github: '',
            social_linkedin: '',
            social_facebook: '',
            social_instagram: '',
            external_websites: ['']
        });
        setIsModalOpen(true);
    };

    const openEditModal = (author) => {
        setEditingAuthor(author);
        setFormData({
            name: author.name || '',
            slug: author.slug || '',
            avatar: author.avatar || '',
            bio: author.bio || '',
            gender: author.gender || 'male',
            email: author.email || '',
            social_github: author.social_github || '',
            social_linkedin: author.social_linkedin || '',
            social_facebook: author.social_facebook || '',
            social_instagram: author.social_instagram || '',
            external_websites: Array.isArray(author.external_websites) && author.external_websites.length > 0
                ? author.external_websites 
                : ['']
        });
        setIsModalOpen(true);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append('file', file);
        try {
            const res = await fetch(`${API_URL}/admin/blog/upload-image`, {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();
            if (data.success && data.url) {
                setFormData(prev => ({ ...prev, avatar: data.url }));
            }
        } catch (err) {
            console.error("Avatar upload failed", err);
        }
    };

    const handleSubmitAuthor = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            external_websites: formData.external_websites.filter(w => w.trim() !== '')
        };

        const url = editingAuthor 
            ? `${API_URL}/admin/blog/authors/${editingAuthor.id}`
            : `${API_URL}/admin/blog/authors`;
        
        try {
            const res = await fetch(url, {
                method: editingAuthor ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchAuthors();
            } else {
                alert(data.message || 'Failed to save author');
            }
        } catch (err) {
            console.error("Failed to save author", err);
        }
    };

    const handleDeleteAuthor = async (id) => {
        if (!confirm("Are you sure you want to delete this author? Any posts assigned to them will be unassigned.")) return;
        try {
            const res = await fetch(`${API_URL}/admin/blog/authors/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchAuthors();
        } catch (err) {
            console.error("Failed to delete author", err);
        }
    };

    const handleBulkAssign = async (assignAll = false) => {
        if (!selectedAuthorId) {
            alert('Please select an author first.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/admin/blog/authors/assign-bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author_id: parseInt(selectedAuthorId),
                    post_ids: selectedPostIds.map(id => parseInt(id)),
                    assign_all_unassigned: assignAll
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Posts assigned successfully!');
                setIsAssignModalOpen(false);
                fetchAuthors();
                fetchPosts();
            }
        } catch (err) {
            console.error("Bulk assign failed", err);
        }
    };

    const filteredAuthors = authors.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-white dark:bg-[#0a0a0a] min-h-screen text-gray-700 dark:text-gray-300">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-tight">Blog Authors</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">Manage author profiles, social links, bios, and assign posts.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsAssignModalOpen(true)}
                                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-gray-700"
                            >
                                <MdAssignmentInd className="w-4 h-4 text-red-400" />
                                Assign Older Posts
                            </button>
                            <button
                                onClick={openCreateModal}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
                            >
                                <MdPersonAdd className="w-4 h-4 text-white" />
                                Add New Author
                            </button>
                        </div>
                    </div>

                    {/* Table Box */}
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-gray-200 dark:border-white/8 bg-gray-100 dark:bg-[#1a1a1a]/50 flex items-center gap-3">
                            <MdSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search authors by name or slug..." 
                                className="bg-transparent border-none outline-none text-sm w-full text-gray-900 dark:text-white placeholder:text-gray-500 font-normal"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Author</th>
                                        <th className="px-6 py-4">Gender</th>
                                        <th className="px-6 py-4">Posts</th>
                                        <th className="px-6 py-4">Social & External Links</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">Loading authors...</td>
                                        </tr>
                                    ) : filteredAuthors.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No authors found.</td>
                                        </tr>
                                    ) : filteredAuthors.map(author => (
                                        <tr key={author.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={author.avatar || 'https://pilotprograme.com/pilotprograme-logo.jpg'} 
                                                        alt={author.name} 
                                                        className="w-10 h-10 rounded-full object-cover border border-red-500/30"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 dark:text-white font-semibold group-hover:text-red-500 transition-colors uppercase tracking-tight text-[13px]">
                                                            {author.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-mono">/blog/authors/{author.slug}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200">
                                                    {author.gender || 'Other'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-red-500 px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20">
                                                    {author.post_count || 0} articles
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {author.email && <span title={author.email} className="text-gray-400 hover:text-white"><MdEmail className="w-4 h-4" /></span>}
                                                    {author.social_github && <a href={author.social_github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white"><MdLanguage className="w-4 h-4" /></a>}
                                                    {author.social_linkedin && <a href={author.social_linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400"><MdLanguage className="w-4 h-4" /></a>}
                                                    {Array.isArray(author.external_websites) && author.external_websites.length > 0 && (
                                                        <span className="text-[10px] text-gray-400 font-medium bg-gray-800 px-2 py-0.5 rounded">
                                                            {author.external_websites.length} guest sites
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a 
                                                        href={`/blog/authors/${author.slug}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="p-2 rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                                        title="View Profile Page"
                                                    >
                                                        <MdLanguage className="w-4 h-4" />
                                                    </a>
                                                    <button 
                                                        onClick={() => openEditModal(author)}
                                                        className="p-2 rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-all"
                                                        title="Edit Author"
                                                    >
                                                        <MdEdit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteAuthor(author.id)}
                                                        className="p-2 rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all"
                                                        title="Delete Author"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create / Edit Author Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-[#111111] border border-white/10 rounded-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">
                            {editingAuthor ? 'Edit Author Profile' : 'Create New Author'}
                        </h2>
                        <form onSubmit={handleSubmitAuthor} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Author Name *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                            setFormData(prev => ({ ...prev, name: val, slug: editingAuthor ? prev.slug : autoSlug }));
                                        }}
                                        placeholder="e.g. Jane Doe"
                                        className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Profile Slug *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="e.g. jane-doe"
                                        className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Gender *</label>
                                    <select 
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other / Team</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="author@example.com"
                                        className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Avatar Image URL</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={formData.avatar}
                                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                        placeholder="https://example.com/avatar.jpg"
                                        className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                                    />
                                    <label className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 border border-white/10">
                                        <MdCloudUpload className="w-4 h-4 text-red-500" />
                                        Upload
                                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Author Bio & Background</label>
                                <textarea 
                                    rows="3"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Short bio explaining expertise, role, and background..."
                                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                                />
                            </div>

                            {/* Social Media Links */}
                            <div className="pt-2 border-t border-white/10">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">Social Media Platforms</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input 
                                        type="url" 
                                        placeholder="GitHub URL (https://github.com/...)"
                                        value={formData.social_github}
                                        onChange={(e) => setFormData({ ...formData, social_github: e.target.value })}
                                        className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-xs"
                                    />
                                    <input 
                                        type="url" 
                                        placeholder="LinkedIn URL (https://linkedin.com/in/...)"
                                        value={formData.social_linkedin}
                                        onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
                                        className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-xs"
                                    />
                                    <input 
                                        type="url" 
                                        placeholder="Facebook URL (https://facebook.com/...)"
                                        value={formData.social_facebook}
                                        onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                                        className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-xs"
                                    />
                                    <input 
                                        type="url" 
                                        placeholder="Instagram URL (https://instagram.com/...)"
                                        value={formData.social_instagram}
                                        onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                                        className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-xs"
                                    />
                                </div>
                            </div>

                            {/* External Websites / Guest Publications */}
                            <div className="pt-2 border-t border-white/10">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">Websites Where Author Publishes</h3>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, external_websites: [...prev.external_websites, ''] }))}
                                        className="text-[10px] bg-red-600 text-white font-bold px-2 py-1 rounded"
                                    >
                                        + Add Site Link
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {formData.external_websites.map((url, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input 
                                                type="url"
                                                placeholder="https://medium.com/@author or https://forbes.com/..."
                                                value={url}
                                                onChange={(e) => {
                                                    const updated = [...formData.external_websites];
                                                    updated[idx] = e.target.value;
                                                    setFormData({ ...formData, external_websites: updated });
                                                }}
                                                className="flex-1 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-xs"
                                            />
                                            {formData.external_websites.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData(prev => ({ ...prev, external_websites: prev.external_websites.filter((_, i) => i !== idx) }))}
                                                    className="text-red-400 hover:text-red-300 text-xs px-2"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold uppercase"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase"
                                >
                                    Save Author
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Assign Posts Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111111] border border-white/10 rounded-2xl max-w-xl w-full p-6">
                        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">Assign Older Posts to Author</h2>
                        <p className="text-xs text-gray-400 mb-6">Select an author to assign older articles to their profile.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Select Target Author *</label>
                                <select 
                                    value={selectedAuthorId}
                                    onChange={(e) => setSelectedAuthorId(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm"
                                >
                                    <option value="">-- Choose Author --</option>
                                    {authors.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.post_count || 0} posts)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                                <button 
                                    type="button"
                                    onClick={() => handleBulkAssign(true)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                                >
                                    ⚡ Assign All Unassigned Older Posts To Selected Author
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="w-full bg-gray-800 text-gray-400 py-2 rounded-xl text-xs font-bold uppercase"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
