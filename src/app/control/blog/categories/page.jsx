"use client";

import { useState, useEffect } from 'react';
import { MdAdd, MdDelete, MdCategory, MdLabel } from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminBlogCategories() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/categories`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setCategories(data.categories);
            });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name) return;
        setLoading(true);
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        try {
            const res = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, slug })
            });
            const data = await res.json();
            if (data.success) {
                setName('');
                fetchCategories();
            }
        } catch (err) {
            console.error("Failed to add category", err);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (id === 1) return alert("Cannot delete the default category.");
        if (!confirm("Are you sure? Posts in this category will be moved to 'Uncategorized'.")) return;
        
        try {
            const res = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/categories/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchCategories();
        } catch (err) {
            console.error("Failed to delete category", err);
        }
    };

    return (
        <div className="flex bg-white dark:bg-[#0a0a0a] min-h-screen text-gray-700 dark:text-gray-300">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Blog Categories</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">Organize your content into meaningful sections.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Add Category Form */}
                        <div className="md:col-span-1">
                            <form onSubmit={handleAdd} className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 shadow-xl sticky top-24">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                                    <MdAdd className="w-5 h-5 text-red-500" />
                                    New Category
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Category Name</label>
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. YouTube Strategy" 
                                            className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white p-3 rounded-xl outline-none focus:border-red-500/30 transition-all text-sm"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 mt-2"
                                    >
                                        {loading ? 'Adding...' : 'Create Category'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Categories List */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden shadow-xl">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Category Name</th>
                                            <th className="px-6 py-4">Slug</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                        {categories.map(cat => (
                                            <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500">
                                                            <MdCategory className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-gray-900 dark:text-white font-semibold uppercase tracking-tight">{cat.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">/{cat.slug}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {cat.id !== 1 && (
                                                        <button 
                                                            onClick={() => handleDelete(cat.id)}
                                                            className="p-2 rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all"
                                                            title="Delete Category"
                                                        >
                                                            <MdDelete className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
