"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { 
    MdMovie, 
    MdLink, 
    MdDelete,
    MdInfoOutline, 
    MdChevronLeft, 
    MdChevronRight, 
    MdAutoAwesome,
    MdFolder,
    MdCreate,
    MdAccessTime
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';

export default function BlogToScript() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [savedItems, setSavedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Active Section Tab: 'converter' or 'library'
    const [activeTab, setActiveTab] = useState('converter');

    // Tutorial Carousel
    const [showDemo, setShowDemo] = useState(true);
    const [demoSlide, setDemoSlide] = useState(0);
    const demoSlides = [
        {
            title: "⚡ Step 1: Provide Blog Link",
            desc: "Paste any published blog post or article webpage URL."
        },
        {
            title: "⏱️ Step 2: Target Video Duration",
            desc: "Select your desired video runtime (1m Shorts up to 10m deep dive). The AI will calculate scene depth and word count automatically."
        },
        {
            title: "📖 Step 3: Crawl & Synthesize Script",
            desc: "Extract text, structure scenes, draft spoken narration, and generate visual cues ready for voiceovers and image creation."
        }
    ];

    // Blog to Script State
    const [blogUrl, setBlogUrl] = useState('');
    const [blogDuration, setBlogDuration] = useState(3);
    const [videoStyle, setVideoStyle] = useState('faceless'); // 'faceless' or 'narrator'
    const [visualStyle, setVisualStyle] = useState('content_based'); // 'content_based' or 'character_based'
    const [blogResult, setBlogResult] = useState(null);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    const userId = user.id || 1;

    const [subscription, setSubscription] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);

    useEffect(() => {
        document.title = 'Blog to Script | AI Studio';
        fetchSavedItems();
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const res = await fetch(`${API_URL}/plans/my-subscription?user_id=${userId}`);
            const data = await res.json();
            if (data.success && data.subscription) {
                setSubscription(data.subscription);
            }
        } catch (err) {
            console.error('Error fetching subscription:', err);
        } finally {
            setLoadingPlan(false);
        }
    };

    const fetchSavedItems = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/story/list?user_id=${userId}`);
            const data = await res.json();
            if (data.success) {
                setSavedItems(data.items.filter(item => item.type === 'blog'));
            }
        } catch (err) {
            console.error('Error listing user stories:', err);
        }
    };

    const deleteItem = async (uuid, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this script?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/story/${uuid}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchSavedItems();
                if (selectedItem && selectedItem.uuid === uuid) {
                    setSelectedItem(null);
                }
                if (blogResult && blogResult.uuid === uuid) {
                    setBlogResult(null);
                }
            }
        } catch (err) {
            alert('Deletion failed');
        }
    };

    const loadItemDetails = async (uuid) => {
        try {
            setLoading(true);
            setLoadingText('Loading script...');
            const res = await fetch(`${API_URL}/admin/story/${uuid}`);
            const data = await res.json();
            if (data.success) {
                const item = data.item;
                setSelectedItem(item);
                
                let contentJson = item.content;
                if (typeof contentJson === 'string') {
                    try { contentJson = JSON.parse(contentJson); } catch {}
                }
                setBlogResult({
                    uuid: item.uuid,
                    script: contentJson
                });
                setActiveTab('converter');
            }
        } catch (err) {
            alert('Failed to load detail');
        } finally {
            setLoading(false);
        }
    };

    const handleBlogToScript = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoadingText(`Crawling webpage & synthesizing ${blogDuration}-minute full script...`);
        setBlogResult(null);

        const payload = {
            user_id: userId,
            url: blogUrl,
            duration: blogDuration,
            video_style: videoStyle,
            visual_style: visualStyle,
            api_key: ''
        };

        try {
            const res = await fetch(`${API_URL}/admin/story/blog-to-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setBlogResult(data);
                fetchSavedItems();
            } else {
                alert(data.message || 'Blog parsing failed.');
            }
        } catch (err) {
            alert('Server error crawling webpage');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncToDashboard = async (targetDashboard) => {
        const uuidVal = blogResult?.uuid;
        if (!uuidVal) {
            alert('Please select or generate a script first.');
            return;
        }
        setLoading(true);
        setLoadingText('Syncing script data for media generation...');
        try {
            const res = await fetch(`${API_URL}/admin/story/push-to-scripts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uuid: uuidVal,
                    user_id: userId
                })
            });
            const data = await res.json();
            if (data.success) {
                if (targetDashboard === 'audio') {
                    router.push('/dashboard/audio');
                } else if (targetDashboard === 'images') {
                    router.push('/dashboard/images');
                }
            } else {
                alert(data.message || 'Failed to sync script.');
            }
        } catch (err) {
            alert('Error syncing script to dashboard.');
        } finally {
            setLoading(false);
        }
    };

    const triggerDownload = async (uuid, format) => {
        if (!uuid) {
            alert('No active script loaded to download.');
            return;
        }
        try {
            setLoading(true);
            setLoadingText(`Preparing ${format.toUpperCase()} download...`);
            const res = await fetch(`${API_URL}/admin/story/export?uuid=${uuid}&format=${format}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.message || 'Download failed.');
                return;
            }
            const blob = await res.blob();
            const disposition = res.headers.get('Content-Disposition') || '';
            let filename = `presentation.${format}`;
            const match = disposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            alert('Download failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextDemoSlide = () => {
        setDemoSlide((prev) => (prev + 1) % demoSlides.length);
    };

    const prevDemoSlide = () => {
        setDemoSlide((prev) => (prev - 1 + demoSlides.length) % demoSlides.length);
    };
    
    const maxBlogToScript = parseInt(subscription?.max_blog_to_script || 0);
    const usedBlogToScript = parseInt(subscription?.used_blog_to_script || 0);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/5 pb-5 mb-6">
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                            <MdLink className="text-red-500 w-6 h-6 sm:w-7 sm:h-7" /> Blog to Script
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">Turn any blog post or webpage URL into a comprehensive YouTube video script.</p>
                        {!loadingPlan && (
                            <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/15 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mt-2 inline-block">
                                Usage: {usedBlogToScript} / {maxBlogToScript} conversions
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={() => setShowDemo(!showDemo)}
                        className="self-start sm:self-auto bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all text-gray-700 dark:text-white"
                    >
                        <MdInfoOutline className="text-red-400 w-4 h-4" /> {showDemo ? "Hide Guide" : "View Guide"}
                    </button>
                </div>

                {/* Section Tabs Switcher */}
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-white/10 pb-3">
                    <button
                        onClick={() => setActiveTab('converter')}
                        className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'converter'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                    >
                        <MdCreate className="w-4 h-4" />
                        <span>Article Converter</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('library')}
                        className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'library'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                    >
                        <MdFolder className="w-4 h-4" />
                        <span>Saved Scripts ({savedItems.length})</span>
                    </button>
                </div>

                {showDemo && (
                    <div className="bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-950/20 dark:to-purple-950/10 border border-red-200 dark:border-red-500/25 rounded-2xl p-4 sm:p-5 mb-6 relative overflow-hidden transition-all duration-300">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Guide</span>
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{demoSlides[demoSlide].title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{demoSlides[demoSlide].desc}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={prevDemoSlide} className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 rounded-full">
                                    <MdChevronLeft className="w-4 h-4 text-gray-700 dark:text-white" />
                                </button>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono font-bold">{demoSlide + 1} / {demoSlides.length}</span>
                                <button onClick={nextDemoSlide} className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 rounded-full">
                                    <MdChevronRight className="w-4 h-4 text-gray-700 dark:text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                {activeTab === 'converter' ? (
                    <div className="space-y-6">
                        {(!loadingPlan && (maxBlogToScript === 0 || usedBlogToScript >= maxBlogToScript)) ? (
                            <div className="min-h-[350px] flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#111111] rounded-3xl border border-gray-200 dark:border-white/10 relative overflow-hidden shadow-sm">
                                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/5">
                                    <MdLink className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-wider mb-2 text-gray-900 dark:text-white">Blog to Script Locked</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6">
                                    {maxBlogToScript === 0
                                        ? `Your current plan (${subscription?.plan_name || 'Free'}) does not support Blog to Script conversion.`
                                        : `You have reached your limit of ${maxBlogToScript} Blog to Script conversions on your current plan.`}
                                    {" "}Upgrade to a premium plan to convert articles and webpage URLs into presentation scripts.
                                </p>
                                <button
                                    onClick={() => router.push('/dashboard/plans')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                                >
                                    Upgrade Plan
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleBlogToScript} className="space-y-6">
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-white/5 pb-2">
                                        Blog Webpage Configuration
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Webpage URL</label>
                                        <div className="bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2.5 flex items-center gap-2 w-full">
                                            <MdLink className="text-gray-400 flex-shrink-0 w-4 h-4" />
                                            <input
                                                type="url"
                                                required
                                                placeholder="https://example.com/blog-post-article"
                                                value={blogUrl}
                                                onChange={(e) => setBlogUrl(e.target.value)}
                                                className="bg-transparent border-none text-xs w-full focus:outline-none text-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                                                <MdAccessTime className="w-3.5 h-3.5 text-red-500" /> Target Duration
                                            </label>
                                            <select
                                                value={blogDuration}
                                                onChange={(e) => setBlogDuration(Number(e.target.value))}
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            >
                                                <option value={1}>1 Minute (Shorts / ~5 scenes)</option>
                                                <option value={3}>3 Minutes (Medium / ~9-12 scenes)</option>
                                                <option value={5}>5 Minutes (Full Video / ~15-18 scenes)</option>
                                                <option value={10}>10 Minutes (Deep Dive / ~30 scenes)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Video Style / Format</label>
                                            <select
                                                value={videoStyle}
                                                onChange={(e) => setVideoStyle(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            >
                                                <option value="faceless">Faceless YouTube / Presenter Monologue</option>
                                                <option value="narrator">Storytelling / Character Dialogues</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Visual Scene Style</label>
                                            <select
                                                value={visualStyle}
                                                onChange={(e) => setVisualStyle(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            >
                                                <option value="content_based">Content-Based Slides & Title Graphics</option>
                                                <option value="character_based">Character-Based Cinematic Photos</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase py-3.5 rounded-2xl text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                                >
                                    <MdAutoAwesome className="w-4 h-4" /> Synthesize Article into Full Script
                                </button>
                            </form>
                        )}

                        {blogResult && (
                            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-white/5 pb-3">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider bg-cyan-500/10 px-2.5 py-0.5 rounded-full">Blog Converted Script</span>
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                                {blogResult.script?.scenes?.length || 0} Scenes
                                            </span>
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
                                            {blogResult.script?.title || 'Synthesized Presentation'}
                                        </h3>
                                    </div>

                                    {/* Action Buttons Toolbar */}
                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                                        <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                                            <button
                                                type="button"
                                                onClick={() => triggerDownload(blogResult.uuid, 'txt')}
                                                className="flex-1 sm:flex-none bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white text-center"
                                            >
                                                TXT
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => triggerDownload(blogResult.uuid, 'docx')}
                                                className="flex-1 sm:flex-none bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white text-center"
                                            >
                                                DOCX
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => triggerDownload(blogResult.uuid, 'pdf')}
                                                className="flex-1 sm:flex-none bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white text-center"
                                            >
                                                PDF
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleSyncToDashboard('audio')}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-3 py-2 text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow"
                                        >
                                            🎙️ Voice Over
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSyncToDashboard('images')}
                                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl px-3 py-2 text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow"
                                        >
                                            🎨 Images
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                                    {blogResult.script?.scenes && blogResult.script.scenes.map((scene, idx) => (
                                        <div key={idx} className="bg-gray-50 dark:bg-[#16161d] p-4 rounded-xl space-y-2 border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="text-xs font-bold text-red-500 dark:text-red-400 uppercase font-mono">
                                                    Scene {scene.scene_number || idx + 1}: {scene.scene_title}
                                                </h4>
                                            </div>

                                            {scene.visual_description && (
                                                <div className="bg-white dark:bg-[#0f0f13] p-2.5 rounded-lg border border-gray-200/60 dark:border-white/5 text-[11px] text-gray-600 dark:text-gray-400 italic">
                                                    <strong className="not-italic text-gray-800 dark:text-gray-200 font-sans">Visual Cue:</strong> {scene.visual_description}
                                                </div>
                                            )}

                                            <div className="pl-3 border-l-2 border-cyan-500 space-y-2 pt-1">
                                                {scene.dialogues && scene.dialogues.map((dlg, dIdx) => (
                                                    <div key={dIdx} className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
                                                        <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase text-[11px] block sm:inline mr-2">
                                                            [{dlg.speaker || 'Presenter'}]:
                                                        </span>
                                                        <span>"{dlg.line}"</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Library Tab */
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-3 mb-4">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <MdFolder className="text-red-500 w-4 h-4" /> Saved Blog Scripts
                            </h3>
                            <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full">
                                {savedItems.length} Saved
                            </span>
                        </div>

                        {savedItems.length === 0 ? (
                            <div className="text-center py-12">
                                <MdFolder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">No blog presentation scripts created yet.</p>
                                <button
                                    onClick={() => setActiveTab('converter')}
                                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase"
                                >
                                    Convert New Article
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => loadItemDetails(item.uuid)}
                                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                                            selectedItem && selectedItem.uuid === item.uuid
                                                ? 'bg-red-500/5 border-red-500/30 ring-1 ring-red-500/20'
                                                : 'bg-gray-50 dark:bg-[#17171d]/60 border-gray-200 dark:border-white/5 hover:border-red-500/30'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded-full">
                                                    Blog Script
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => deleteItem(item.uuid, e)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    title="Delete Script"
                                                >
                                                    <MdDelete className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-red-500 transition-colors">
                                                {item.title}
                                            </h4>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] font-bold text-red-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                                Open Script →
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#111115] border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-300">{loadingText || "Synthesizing content..."}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
