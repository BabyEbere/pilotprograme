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
    MdAutoAwesome
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';

export default function BlogToScript() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [savedItems, setSavedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Tutorial Carousel
    const [showDemo, setShowDemo] = useState(true);
    const [demoSlide, setDemoSlide] = useState(0);
    const demoSlides = [
        {
            title: "⚡ Step 1: Provide Blog Link",
            desc: "Enter any standard article or blog URL webpage."
        },
        {
            title: "⏱️ Step 2: Target Video duration",
            desc: "Select your target video runtime length (e.g. 1 minute for Shorts, 5 minutes for deep dive)."
        },
        {
            title: "📖 Step 3: Crawl & Compile Script",
            desc: "Synthesize content. The AI extracts text, structures slides, and generates speech dialogues."
        }
    ];

    // Blog to Script State
    const [blogUrl, setBlogUrl] = useState('');
    const [blogDuration, setBlogDuration] = useState(3);
    const [videoStyle, setVideoStyle] = useState('faceless'); // 'faceless' or 'narrator'
    const [visualStyle, setVisualStyle] = useState('content_based'); // 'content_based' or 'character_based'
    const [blogResult, setBlogResult] = useState(null);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
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
        setLoadingText('Crawling URL & Synthesizing script presentation...');
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
        <div className="flex h-screen bg-gray-55 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/5 pb-6 mb-6">
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                            <MdLink className="text-red-500 w-6 h-6" /> Blog to Script
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Convert any blog post or article webpage into a video presentation script.</p>
                        {!loadingPlan && (
                            <span className="text-[10px] bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/15 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block">
                                Usage: {usedBlogToScript} / {maxBlogToScript} conversions
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={() => setShowDemo(!showDemo)}
                        className="self-start md:self-auto bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-gray-200/50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all text-gray-700 dark:text-white"
                    >
                        <MdInfoOutline className="text-red-400 w-4 h-4" /> {showDemo ? "Hide Guide" : "View Guide"}
                    </button>
                </div>

                {showDemo && (
                    <div className="bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-950/20 dark:to-purple-950/10 border border-red-200 dark:border-red-500/25 rounded-2xl p-5 mb-6 relative overflow-hidden transition-all duration-300">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-500 text-gray-900 dark:text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Guide Mode</span>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{demoSlides[demoSlide].title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{demoSlides[demoSlide].desc}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={prevDemoSlide} className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-gray-200/50 dark:bg-white/10 rounded-full">
                                    <MdChevronLeft className="w-4 h-4 text-gray-700 dark:text-white" />
                                </button>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono font-bold">{demoSlide + 1} / {demoSlides.length}</span>
                                <button onClick={nextDemoSlide} className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-gray-200/50 dark:bg-white/10 rounded-full">
                                    <MdChevronRight className="w-4 h-4 text-gray-700 dark:text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        {(!loadingPlan && (maxBlogToScript === 0 || usedBlogToScript >= maxBlogToScript)) ? (
                            <div className="min-h-[380px] flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#111111] rounded-3xl border border-gray-250 dark:border-white/10 relative overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-red-600/5 rounded-full blur-[70px] pointer-events-none"></div>
                                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/5 z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-wider mb-2 text-gray-900 dark:text-white z-10">Blog to Script Locked</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6 z-10">
                                    {maxBlogToScript === 0
                                        ? `Your current plan (${subscription?.plan_name || 'Free'}) does not support Blog to Script conversion.`
                                        : `You have reached your limit of ${maxBlogToScript} Blog to Script conversions on your current plan.`}
                                    {" "}Upgrade to a premium plan to convert articles and webpage URLs into presentation scripts.
                                </p>
                                <button
                                    onClick={() => router.push('/dashboard/plans')}
                                    className="bg-red-650 hover:bg-red-750 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md z-10"
                                >
                                    Upgrade Plan
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleBlogToScript} className="space-y-6">
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Blog Webpage to Presentation Script</h3>
                                    
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Webpage URL</label>
                                        <div className="flex gap-2">
                                            <div className="bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 w-full">
                                                <MdLink className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
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
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Target Duration</label>
                                            <select
                                                value={blogDuration}
                                                onChange={(e) => setBlogDuration(Number(e.target.value))}
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            >
                                                <option value={1}>1 Minute (TikTok/Short)</option>
                                                <option value={3}>3 Minutes (Medium video)</option>
                                                <option value={5}>5 Minutes (Full presentation)</option>
                                                <option value={10}>10 Minutes (Deep dive)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Video Style / Format</label>
                                            <select
                                                value={videoStyle}
                                                onChange={(e) => setVideoStyle(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            >
                                                <option value="faceless">Faceless YouTube / Presenter Monologue</option>
                                                <option value="narrator">Storytelling / Character Dialogues</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Visual Scene Style</label>
                                            <select
                                                value={visualStyle}
                                                onChange={(e) => setVisualStyle(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
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
                                    className="w-full bg-red-605 hover:bg-red-750 text-gray-900 dark:text-white font-bold uppercase py-3 rounded-2xl text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    <MdAutoAwesome className="w-4 h-4" /> Synthesize Article into Script
                                </button>
                            </form>
                        )}

                        {blogResult && (
                            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-white/5 pb-3">
                                    <div>
                                        <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded-full">Blog converted presentation script</span>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{blogResult.script?.title || 'Synthesized Presentation'}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(blogResult.uuid, 'txt')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            TXT
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(blogResult.uuid, 'docx')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            DOCX
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(blogResult.uuid, 'pdf')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            PDF (Watermarked)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSyncToDashboard('audio')}
                                            className="bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white font-bold rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all flex items-center gap-1"
                                        >
                                            🎙️ Voice Over
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSyncToDashboard('images')}
                                            className="bg-amber-550 hover:bg-amber-600 text-gray-900 dark:text-white font-bold rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all flex items-center gap-1"
                                        >
                                            🎨 Generate Images
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {blogResult.script?.scenes && blogResult.script.scenes.map((scene, idx) => (
                                        <div key={idx} className="space-y-2 pb-4 border-b border-gray-100 dark:border-white/5 last:border-none">
                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">Slide / Scene {scene.scene_number}: {scene.scene_title}</h4>
                                            {scene.visual_description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">Visual: {scene.visual_description}</p>
                                            )}
                                            <div className="pl-4 border-l-2 border-cyan-500 space-y-1">
                                                {scene.dialogues && scene.dialogues.map((dlg, dIdx) => (
                                                    <p key={dIdx} className="text-xs text-gray-700 dark:text-gray-400 font-serif leading-relaxed">
                                                        <strong>{dlg.speaker}:</strong> "{dlg.line}"
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Saved Blog Scripts</h3>
                            
                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                                {savedItems.length === 0 ? (
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 py-4 text-center">No presentation scripts created yet.</p>
                                ) : (
                                    savedItems.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => loadItemDetails(item.uuid)}
                                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                                                selectedItem && selectedItem.uuid === item.uuid
                                                    ? 'bg-red-500/5 border-red-500/30'
                                                    : 'bg-gray-50 dark:bg-[#17171d]/60 border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-[#1b1b22]'
                                            }`}
                                        >
                                            <div className="mt-0.5 flex-shrink-0">
                                                <MdLink className="text-cyan-400 w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => deleteItem(item.uuid, e)}
                                                className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors self-center flex-shrink-0"
                                            >
                                                <MdDelete className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-[#111115] border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-300">{loadingText || "Synthesizing content..."}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
