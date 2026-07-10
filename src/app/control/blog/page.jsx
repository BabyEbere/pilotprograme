"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { 
    MdPostAdd, MdEdit, MdDelete, MdSearch, MdVisibility, MdCalendarToday, MdLabel 
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminBlog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = () => {
        setLoading(true);
        fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/posts`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setPosts(data.posts);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch posts", err);
                setLoading(false);
            });
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/posts/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchPosts();
        } catch (err) {
            console.error("Failed to delete post", err);
        }
    };

    const filteredPosts = posts.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-white dark:bg-[#0a0a0a] min-h-screen text-gray-700 dark:text-gray-300">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-tight">Blog Management</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">Create and manage content to push your platform online.</p>
                        </div>
                        <Link href="/control/blog/new"
                            className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
                        >
                            <MdPostAdd className="w-5 h-5 text-gray-900 dark:text-white/80" />
                            Write New Post
                        </Link>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-gray-200 dark:border-white/8 bg-gray-100 dark:bg-[#1a1a1a]/50 flex items-center gap-3">
                            <MdSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search posts by title or slug..." 
                                className="bg-transparent border-none outline-none text-sm w-full text-gray-900 dark:text-white placeholder:text-gray-600 dark:text-gray-500 font-normal selection:bg-red-500/30"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic">Loading posts...</td>
                                        </tr>
                                    ) : filteredPosts.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic">No posts found.</td>
                                        </tr>
                                    ) : filteredPosts.map(post => (
                                        <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight ${
                                                    post.status === 'published' 
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                }`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 dark:text-white font-semibold group-hover:text-red-500 transition-colors uppercase tracking-tight text-[13px]">{post.title}</span>
                                                    <span className="text-[10px] text-gray-600 dark:text-gray-500 mt-0.5 font-mono">/{post.slug}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MdLabel className="w-3.5 h-3.5 text-red-500/50" />
                                                    <span className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-tight font-bold">{post.category_name || 'General'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a 
                                                        href={`/blog/${post.slug}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="p-2 rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-all shadow-sm"
                                                        title="View Live"
                                                    >
                                                        <MdVisibility className="w-4 h-4" />
                                                    </a>
                                                    <button 
                                                        onClick={() => router.push(`/control/blog/edit/${post.id}`, { state: { post } })}
                                                        className="p-2 rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 text-blue-400 hover:text-blue-300 transition-all shadow-sm"
                                                        title="Edit Post"
                                                    >
                                                        <MdEdit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-2 rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all shadow-sm"
                                                        title="Delete Post"
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
        </div>
    );
}
