"use client";

import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { 
    MdSave, MdArrowBack, MdImage, MdHelpCenter, MdSearch, 
    MdCategory, MdHistory, MdPublishedWithChanges, MdAutoAwesome, MdClose,
    MdUpload, MdAutoFixHigh, MdRefresh
} from 'react-icons/md';
import { Editor } from '@tinymce/tinymce-react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminBlogEditor() {
    const { id } = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const editPost = typeof window !== 'undefined' ? (window.history?.state?.usr?.post || window.history?.state?.post) : null;

    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featured_image: '',
        category_id: 1,
        status: 'draft',
        meta_title: '',
        meta_description: '',
        keywords: '',
        faq_json: [],
        schema_json: {}
    });

    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [showAiModal, setShowAiModal] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [showThumbnailOptions, setShowThumbnailOptions] = useState(false);
    const [generatingThumbnails, setGeneratingThumbnails] = useState(false);
    const [generatedThumbnails, setGeneratedThumbnails] = useState([]);
    const [generatingFaqs, setGeneratingFaqs] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchAuthors();
        if (id && editPost) {
            setForm({
                ...editPost,
                author_id: editPost.author_id || '',
                faq_json: JSON.parse(editPost.faq_json || '[]'),
                schema_json: JSON.parse(editPost.schema_json || '{}')
            });
        }
    }, [id, editPost]);

    const fetchCategories = () => {
        fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/categories`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setCategories(data.categories);
            });
    };

    const fetchAuthors = () => {
        fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/authors`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setAuthors(data.authors || []);
            });
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .trim()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
        if (!id) setForm(prev => ({ ...prev, title, slug }));
        else setForm(prev => ({ ...prev, title }));
    };

    const handleSlugChange = (e) => {
        const slug = e.target.value.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
        setForm(prev => ({ ...prev, slug }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const url = id 
                ? `${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/posts/${id}` 
                : `${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/posts`;
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) router.push('/control/blog');
        } catch (err) {
            console.error("Failed to save post", err);
        }
        setLoading(false);
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt) return;
        setAiGenerating(true);
        try {
            const adminData = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: aiPrompt, 
                    user_id: adminData.id || 1 
                })
            });
            const data = await res.json();
            if (data.success) {
                setForm(prev => ({ 
                    ...prev, 
                    content: data.content,
                    title: data.title || prev.title,
                    meta_title: data.title || prev.meta_title,
                    excerpt: data.excerpt || prev.excerpt,
                    meta_description: data.excerpt || prev.meta_description
                }));
                setShowAiModal(false);
                setAiPrompt('');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("AI Generation failed", err);
            alert("Connection error occurred.");
        }
        setAiGenerating(false);
    };

    const addFaq = () => {
        setForm(prev => ({
            ...prev,
            faq_json: [...prev.faq_json, { q: '', a: '' }]
        }));
    };

    const updateFaq = (index, field, value) => {
        const newFaq = [...form.faq_json];
        newFaq[index][field] = value;
        setForm(prev => ({ ...prev, faq_json: newFaq }));
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const API_URL = (typeof window !== 'undefined' 
                ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                    ? 'http://localhost:5000' 
                    : 'https://s1.pilotprograme.com/api') 
                : 'http://localhost:5000');
            
            const res = await fetch(`${API_URL}/admin/blog/upload-image`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                setForm(prev => ({ ...prev, featured_image: data.url }));
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image');
        }
    };

    const handleGenerateThumbnails = async () => {
        if (!form.title) {
            alert('Please enter a title first');
            return;
        }

        setGeneratingThumbnails(true);
        try {
            const adminData = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/generate-thumbnails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: form.title,
                    user_id: adminData.id || 1 
                })
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedThumbnails(data.thumbnails || []);
            } else {
                alert(data.message || 'Failed to generate thumbnails');
            }
        } catch (err) {
            console.error('Error generating thumbnails:', err);
            alert('Failed to generate thumbnails');
        } finally {
            setGeneratingThumbnails(false);
        }
    };

    const handleGenerateFaqs = async () => {
        if (!form.content) {
            alert('Please generate or write content first');
            return;
        }

        setGeneratingFaqs(true);
        try {
            const adminData = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/admin/blog/generate-faqs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: form.content,
                    title: form.title,
                    user_id: adminData.id || 1 
                })
            });
            const data = await res.json();
            if (data.success) {
                setForm(prev => ({ ...prev, faq_json: data.faqs || [] }));
            } else {
                alert(data.message || 'Failed to generate FAQs');
            }
        } catch (err) {
            console.error('Error generating FAQs:', err);
            alert('Failed to generate FAQs');
        } finally {
            setGeneratingFaqs(false);
        }
    };

    return (
        <div className="flex bg-white dark:bg-[#0a0a0a] min-h-screen text-gray-700 dark:text-gray-300">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.push('/control/blog')}
                                className="p-2 rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 text-gray-600 dark:text-gray-500 dark:text-gray-400"
                            >
                                <MdArrowBack className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                {id ? 'Edit Blog Post' : 'New Blog Post'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowAiModal(true)}
                                className="bg-zinc-900 hover:bg-zinc-800 border border-red-500/30 text-red-500 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                            >
                                <MdAutoAwesome className="w-5 h-5" />
                                AI Writer
                            </button>
                            <select 
                                value={form.status}
                                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                                className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-tight rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-red-500/50"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-900/40 disabled:opacity-50"
                            >
                                <MdSave className="w-5 h-5 shadow-sm shadow-black/20" />
                                {loading ? 'Saving...' : 'Save Post'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-6">
                            <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden p-6 space-y-4 shadow-xl">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Title</label>
                                    <input 
                                        type="text" 
                                        value={form.title}
                                        onChange={handleTitleChange}
                                        placeholder="Post title..." 
                                        className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white p-3 rounded-xl outline-none focus:border-red-500/30 transition-all font-semibold"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Slug</label>
                                        <input 
                                            type="text" 
                                            value={form.slug}
                                            onChange={handleSlugChange}
                                            placeholder="my-cool-post" 
                                            className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-[10px] text-red-400 p-3 rounded-xl outline-none focus:border-red-500/30 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Category</label>
                                        <select 
                                            value={form.category_id}
                                            onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                                            className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white p-3 rounded-xl outline-none focus:border-red-500/30 uppercase text-[10px] font-bold tracking-widest"
                                        >
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Assign Author</label>
                                        <select 
                                            value={form.author_id || ''}
                                            onChange={(e) => setForm(prev => ({ ...prev, author_id: e.target.value ? parseInt(e.target.value) : '' }))}
                                            className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white p-3 rounded-xl outline-none focus:border-red-500/30 uppercase text-[10px] font-bold tracking-widest"
                                        >
                                            <option value="">-- Default / Team --</option>
                                            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden flex flex-col min-h-[500px] shadow-xl">
                                <div className="p-4 border-b border-gray-200 dark:border-white/8 bg-gray-100 dark:bg-[#1a1a1a]/50 flex gap-4 uppercase font-bold text-[10px] tracking-widest overflow-x-auto">
                                    <button 
                                        onClick={() => setActiveTab('content')}
                                        className={`px-3 py-1 rounded-full transition-all ${activeTab === 'content' ? 'bg-red-600 text-gray-900 dark:text-white shadow-sm shadow-red-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}
                                    >
                                        Content
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('faq')}
                                        className={`px-3 py-1 rounded-full transition-all ${activeTab === 'faq' ? 'bg-red-600 text-gray-900 dark:text-white shadow-sm shadow-red-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}
                                    >
                                        FAQ
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('seo')}
                                        className={`px-3 py-1 rounded-full transition-all ${activeTab === 'seo' ? 'bg-red-600 text-gray-900 dark:text-white shadow-sm shadow-red-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}
                                    >
                                        SEO Meta
                                    </button>
                                </div>
                                <div className="p-6 flex-1">
                                    {activeTab === 'content' && (
                                        <div className="min-h-[400px] bg-transparent rounded-xl overflow-hidden border border-white/5">
                                            <Editor
                                                apiKey='68p6fs0nyu59icihoyv7sk06p6olzz92r68eg3heah8qx3tb'
                                                value={form.content}
                                                onEditorChange={(content) => setForm(prev => ({ ...prev, content }))}
                                                init={{
                                                    height: 500,
                                                    menubar: false,
                                                    skin: "oxide-dark",
                                                    content_css: "dark",
                                                    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                                                    content_style: 'body { font-family:Outfit,Helvetica,Arial,sans-serif; font-size:14px; background-color: #111111; color: #d1d5db; }'
                                                }}
                                            />
                                        </div>
                                    )}
                                    {activeTab === 'faq' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">Frequently Asked Questions</p>
                                                <button
                                                    onClick={handleGenerateFaqs}
                                                    disabled={generatingFaqs || !form.content}
                                                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-gray-900 dark:text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[10px] font-bold uppercase tracking-widest"
                                                >
                                                    {generatingFaqs ? (
                                                        <MdRefresh className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <MdAutoAwesome className="w-4 h-4" />
                                                    )}
                                                    AI Generate FAQs
                                                </button>
                                            </div>
                                            {form.faq_json.map((faq, i) => (
                                                <div key={i} className="bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-xl space-y-3 relative group border border-white/5 shadow-inner">
                                                    <input 
                                                        type="text" 
                                                        value={faq.q}
                                                        onChange={(e) => updateFaq(i, 'q', e.target.value)}
                                                        placeholder="Question..." 
                                                        className="w-full bg-transparent text-gray-900 dark:text-white font-bold text-sm outline-none border-b border-white/5 pb-2 uppercase tracking-tight"
                                                    />
                                                    <textarea 
                                                        value={faq.a}
                                                        onChange={(e) => updateFaq(i, 'a', e.target.value)}
                                                        placeholder="Answer..." 
                                                        className="w-full bg-transparent text-gray-500 dark:text-gray-400 text-xs outline-none resize-none h-20 leading-relaxed font-normal"
                                                    />
                                                </div>
                                            ))}
                                            <button 
                                                onClick={addFaq}
                                                className="w-full py-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                <MdHelpCenter className="w-5 h-5 text-red-500" />
                                                Add FAQ Item
                                            </button>
                                        </div>
                                    )}
                                    {activeTab === 'seo' && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Meta Title</label>
                                                <input 
                                                    type="text" 
                                                    value={form.meta_title}
                                                    onChange={(e) => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                                                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white p-3 rounded-xl outline-none focus:border-red-500/20 shadow-inner"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Meta Description</label>
                                                <textarea 
                                                    value={form.meta_description}
                                                    onChange={(e) => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
                                                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white p-3 rounded-xl outline-none h-28 text-xs font-normal leading-relaxed shadow-inner"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Keywords (comma separated)</label>
                                                <input 
                                                    type="text" 
                                                    value={form.keywords}
                                                    onChange={(e) => setForm(prev => ({ ...prev, keywords: e.target.value }))}
                                                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white p-3 rounded-xl outline-none text-[10px] shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4 shadow-xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <MdImage className="w-5 h-5 text-red-500" />
                                        Featured Image
                                    </h3>
                                    <button
                                        onClick={() => setShowThumbnailOptions(!showThumbnailOptions)}
                                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                                    >
                                        {showThumbnailOptions ? 'Close Options' : 'Add Image'}
                                    </button>
                                </div>
                                
                                <div className="aspect-video bg-gray-100 dark:bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center relative group shadow-inner">
                                    {form.featured_image ? (
                                        <img src={form.featured_image} alt="Featured" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <MdImage className="w-12 h-12 text-gray-900 dark:text-white/5 transition-transform group-hover:scale-110" />
                                    )}
                                </div>
                                
                                {showThumbnailOptions && (
                                    <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-white/10">
                                        <div className="flex gap-2">
                                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                                                <MdUpload className="w-4 h-4" />
                                                Upload
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={handleThumbnailUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <button
                                                onClick={handleGenerateThumbnails}
                                                disabled={generatingThumbnails || !form.title}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-gray-900 dark:text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                {generatingThumbnails ? (
                                                    <MdRefresh className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <MdAutoFixHigh className="w-4 h-4" />
                                                )}
                                                AI Generate
                                            </button>
                                        </div>
                                        
                                        {generatedThumbnails.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2 mt-4">
                                                {generatedThumbnails.map((thumb, index) => (
                                                    <div 
                                                        key={index}
                                                        onClick={() => setForm(prev => ({ ...prev, featured_image: thumb.url }))}
                                                        className={`aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                                                            form.featured_image === thumb.url 
                                                                ? 'border-red-500 ring-2 ring-red-500/30' 
                                                                : 'border-transparent hover:border-gray-300 dark:hover:border-white/20'
                                                        }`}
                                                    >
                                                        <img src={thumb.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <input 
                                    type="text" 
                                    value={form.featured_image}
                                    onChange={(e) => setForm(prev => ({ ...prev, featured_image: e.target.value }))}
                                    placeholder="Image URL..." 
                                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-[10px] text-zinc-400 p-3 rounded-xl outline-none tabular-nums shadow-inner"
                                />
                            </div>

                            <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4 shadow-xl">
                                <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <MdSearch className="w-5 h-5 text-red-500" />
                                    Post Excerpt
                                </h3>
                                <textarea 
                                    value={form.excerpt}
                                    onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white p-3 rounded-xl outline-none h-32 text-xs font-normal leading-relaxed shadow-inner"
                                    placeholder="Brief summary for indexing..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Generation Modal */}
            {showAiModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !aiGenerating && setShowAiModal(false)}></div>
                    <div className="relative w-full max-w-xl bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gray-100 dark:bg-[#1a1a1a]/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-900/20">
                                    <MdAutoAwesome className="w-5 h-5 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-widest">Pilot AI Content Writer</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mt-0.5">Powered by Gemini 2.5 Flash</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowAiModal(false)}
                                disabled={aiGenerating}
                                className="p-2 hover:bg-gray-200 dark:bg-white/5 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] block mb-3">What should the AI write about?</label>
                                <textarea 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g. Write a guide on how to pick a profitable niche for a faceless channel in 2026..." 
                                    className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white p-5 rounded-2xl outline-none min-h-[160px] text-sm leading-relaxed focus:border-red-500/30 transition-all shadow-inner"
                                    disabled={aiGenerating}
                                />
                            </div>
                            
                            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-start gap-3">
                                <div className="mt-1"><MdAutoAwesome className="w-4 h-4 text-red-500" /></div>
                                <p className="text-[10px] text-red-200/60 font-medium leading-relaxed italic uppercase tracking-wider">
                                    The AI is configured to avoid AI clichés (delve, dive, unleash) and focus on natural, human-like words for better Google ranking.
                                </p>
                            </div>

                            <button 
                                onClick={handleAiGenerate}
                                disabled={aiGenerating || !aiPrompt}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-gray-900 dark:text-white py-5 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-900/20"
                            >
                                {aiGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Generating Content...
                                    </>
                                ) : (
                                    <>
                                        <MdAutoAwesome className="w-5 h-5" />
                                        Generate Full Post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
