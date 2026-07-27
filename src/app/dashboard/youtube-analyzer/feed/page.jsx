"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Sparkles, Flame, Play, ArrowLeft, RefreshCw, 
    Check, AlertCircle, Edit3, Tag, BarChart3, AlertTriangle, 
    UploadCloud, Image as ImageIcon, Eye, Wand2, Copy, FileText, Send
} from 'lucide-react';
import Loader from '@/components/Loader';

export default function OptimizationFeed() {
    const [loading, setLoading] = useState(true);
    const [videoAudits, setVideoAudits] = useState([]);
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState('success'); // 'success' | 'error'
    const router = useRouter();

    // Editable state maps for each video_id
    const [editingTitlesMap, setEditingTitlesMap] = useState({});
    const [editingDescMap, setEditingDescMap] = useState({});
    const [editingTagsMap, setEditingTagsMap] = useState({});
    const [customTagInputs, setCustomTagInputs] = useState({});

    // Active Tab per video card: 'title' | 'description' | 'tags' | 'thumbnail'
    const [activeTabMap, setActiveTabMap] = useState({});

    // Loading indicators
    const [aiRunningMap, setAiRunningMap] = useState({});
    const [publishingMap, setPublishingMap] = useState({});
    const [thumbGeneratingMap, setThumbGeneratingMap] = useState({});

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('user') || '{}') : '{}');

    const showToast = (msg, type = 'success') => {
        setToastMsg(msg);
        setToastType(type);
        setTimeout(() => setToastMsg(''), 4500);
    };

    const fetchData = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/channel-videos-audit/${user.id}`);
            const data = await res.json();

            if (data.success) {
                const audits = (data.audits || []).slice(0, 5); // Display 5 recent posts from channel on load
                setVideoAudits(audits);

                const titlesMap = {};
                const descMap = {};
                const tagsMap = {};
                const tabsMap = {};

                audits.forEach(v => {
                    titlesMap[v.video_id] = v.current_title || '';
                    descMap[v.video_id] = v.suggested_description || '';
                    
                    let parsedTags = [];
                    try {
                        parsedTags = typeof v.suggested_tags === 'string' ? JSON.parse(v.suggested_tags) : (v.suggested_tags || []);
                    } catch (e) {
                        parsedTags = v.suggested_tags || [];
                    }
                    tagsMap[v.video_id] = Array.isArray(parsedTags) ? parsedTags.filter(Boolean) : [];
                    tabsMap[v.video_id] = 'title'; // default tab
                });

                setEditingTitlesMap(titlesMap);
                setEditingDescMap(descMap);
                setEditingTagsMap(tagsMap);
                setActiveTabMap(tabsMap);
            } else {
                showToast(data.message || 'Failed to load video audits', 'error');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            showToast('Network error loading video audits.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ── 1. Synchronous AI Uplift Audit (Title, Desc, Tags) ──────────────────────────
    const handleRunAiUplift = async (video_id) => {
        setAiRunningMap(prev => ({ ...prev, [video_id]: true }));
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/video/audit-uplift`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, video_id })
            });
            const data = await res.json();
            if (data.success) {
                showToast('AI SEO Uplift audit completed!');
                await fetchData();
            } else {
                showToast(data.message || 'AI Uplift audit failed', 'error');
            }
        } catch (err) {
            showToast('Error running AI Uplift.', 'error');
        } finally {
            setAiRunningMap(prev => ({ ...prev, [video_id]: false }));
        }
    };

    // ── 2. SiliconFlow Thumbnail Generator ──────────────────────────────────────────
    const handleGenerateThumbnail = async (vid) => {
        const video_id = vid.video_id;
        setThumbGeneratingMap(prev => ({ ...prev, [video_id]: true }));
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/generate-thumbnail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    video_id: video_id,
                    video_title: editingTitlesMap[video_id] || vid.current_title,
                    niche: 'YouTube Video'
                })
            });
            const data = await res.json();
            if (data.success && data.thumbnail_url) {
                showToast('High-CTR Thumbnail generated with SiliconFlow!');
                // Update local audit thumbnail state
                setVideoAudits(prev => prev.map(item => 
                    item.video_id === video_id ? { ...item, thumbnail: `${API_URL}${data.thumbnail_url}` } : item
                ));
            } else {
                showToast(data.message || 'Failed to generate thumbnail.', 'error');
            }
        } catch (err) {
            showToast('Connection error generating thumbnail.', 'error');
        } finally {
            setThumbGeneratingMap(prev => ({ ...prev, [video_id]: false }));
        }
    };

    // ── 3. Direct Publish to YouTube Studio API ─────────────────────────────────────
    const handlePublishToYoutube = async (video_id) => {
        setPublishingMap(prev => ({ ...prev, [video_id]: true }));
        try {
            const payload = {
                user_id: user.id,
                video_id: video_id,
                title: editingTitlesMap[video_id],
                description: editingDescMap[video_id],
                tags: editingTagsMap[video_id] || []
            };

            const res = await fetch(`${API_URL}/youtube-analyzer/video/publish-to-youtube`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                showToast('Published & Synced live to YouTube Studio!');
                // Update local audit score
                setVideoAudits(prev => prev.map(item => 
                    item.video_id === video_id ? { ...item, current_title: payload.title, rank_score: 95, is_already_good: true } : item
                ));
            } else {
                showToast(data.message || 'Failed to publish to YouTube API.', 'error');
            }
        } catch (err) {
            showToast('Connection error publishing to YouTube.', 'error');
        } finally {
            setPublishingMap(prev => ({ ...prev, [video_id]: false }));
        }
    };

    // ── Tag Handlers ────────────────────────────────────────────────────────────────
    const handleAddTag = (video_id) => {
        const input = (customTagInputs[video_id] || '').trim();
        if (!input) return;
        const current = editingTagsMap[video_id] || [];
        if (!current.includes(input)) {
            setEditingTagsMap(prev => ({ ...prev, [video_id]: [...current, input] }));
        }
        setCustomTagInputs(prev => ({ ...prev, [video_id]: '' }));
    };

    const handleRemoveTag = (video_id, tagToRemove) => {
        const current = editingTagsMap[video_id] || [];
        setEditingTagsMap(prev => ({ ...prev, [video_id]: current.filter(t => t !== tagToRemove) }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] text-white p-6 flex flex-col items-center justify-center space-y-4">
                <Loader />
                <p className="text-xs text-gray-400 font-medium animate-pulse">Syncing 5 Recent Channel Uploads for SEO Analysis...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-gray-100 p-4 sm:p-8 space-y-6">
            
            {/* Toast Notification */}
            {toastMsg && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 border transition-all animate-bounce ${
                    toastType === 'error' 
                        ? 'bg-red-500/90 text-white border-red-400' 
                        : 'bg-emerald-600/90 text-white border-emerald-400'
                }`}>
                    {toastType === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f0f13] border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/dashboard/youtube-analyzer')}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-gray-300 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-red-400" />
                                AI SEO Feed
                            </span>
                            <span className="text-xs text-gray-400 font-medium">5 Recent Uploads</span>
                        </div>
                        <h1 className="text-xl font-extrabold text-white mt-1">Channel Video Optimizer</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Feed
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {videoAudits.length === 0 ? (
                <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">No Recent Uploads Found</h3>
                        <p className="text-xs text-gray-400 max-w-md mx-auto">
                            Link your YouTube channel in Settings or upload videos to start getting AI-powered title, description, tags, and SiliconFlow thumbnail optimizations.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/settings')}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                        Go to Channel Settings
                    </button>
                </div>
            ) : (
                /* Recent 5 Videos Optimization Cards */
                <div className="space-y-6">
                    {videoAudits.map((vid, idx) => {
                        const video_id = vid.video_id;
                        const rankScore = vid.rank_score || 75;
                        const isGood = rankScore >= 85;
                        const isAiRunning = !!aiRunningMap[video_id];
                        const isPublishing = !!publishingMap[video_id];
                        const isThumbGenerating = !!thumbGeneratingMap[video_id];
                        const activeTab = activeTabMap[video_id] || 'title';

                        const scoreColor = rankScore >= 85 
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                            : rankScore >= 70 
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                                : 'text-red-400 bg-red-500/10 border-red-500/20';

                        return (
                            <div key={vid.video_id || idx} className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
                                
                                {/* Video Header Row */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-white/5">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="relative w-36 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 bg-black/40">
                                            {vid.thumbnail ? (
                                                <img src={vid.thumbnail} alt={vid.current_title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Thumb</div>
                                            )}
                                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-bold text-gray-300 flex items-center gap-1">
                                                <Eye className="w-2.5 h-2.5" /> {(vid.views || 0).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 max-w-xl">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${scoreColor}`}>
                                                    SEO Score: {rankScore}/100 {isGood ? '✓ Excellent' : '⚠ Needs Improvement'}
                                                </span>
                                            </div>
                                            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                                                {vid.current_title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <button
                                            onClick={() => handleRunAiUplift(video_id)}
                                            disabled={isAiRunning}
                                            className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <Wand2 className={`w-3.5 h-3.5 ${isAiRunning ? 'animate-spin' : ''}`} />
                                            {isAiRunning ? 'Analyzing SEO...' : 'Re-Run AI Audit'}
                                        </button>

                                        <button
                                            onClick={() => handlePublishToYoutube(video_id)}
                                            disabled={isPublishing}
                                            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
                                        >
                                            <Send className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
                                            {isPublishing ? 'Publishing...' : 'Publish to YouTube Live'}
                                        </button>
                                    </div>
                                </div>

                                {/* Optimization Sub-Tabs Header */}
                                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                    {[
                                        { id: 'title', label: 'Title Optimization', icon: Edit3 },
                                        { id: 'description', label: 'Description & SEO', icon: FileText },
                                        { id: 'tags', label: 'Search Tags', icon: Tag },
                                        { id: 'thumbnail', label: 'SiliconFlow Thumbnail', icon: ImageIcon }
                                    ].map(tab => {
                                        const IconComponent = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTabMap(prev => ({ ...prev, [video_id]: tab.id }))}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                    isActive 
                                                        ? 'bg-white/10 text-white border border-white/10' 
                                                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                                }`}
                                            >
                                                <IconComponent className="w-3.5 h-3.5" />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* TAB 1: TITLE OPTIMIZATION */}
                                {activeTab === 'title' && (
                                    <div className="space-y-4 bg-[#14141a] border border-white/5 rounded-2xl p-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-300">Editable Video Title:</label>
                                            <input 
                                                type="text"
                                                value={editingTitlesMap[video_id] || ''}
                                                onChange={e => setEditingTitlesMap(prev => ({ ...prev, [video_id]: e.target.value }))}
                                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                                            />
                                        </div>

                                        {vid.optimized_title && vid.optimized_title !== vid.current_title && (
                                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" /> AI High-CTR Title Suggestion
                                                    </span>
                                                    <button
                                                        onClick={() => setEditingTitlesMap(prev => ({ ...prev, [video_id]: vid.optimized_title }))}
                                                        className="text-[10px] font-bold text-emerald-300 hover:text-white underline cursor-pointer"
                                                    >
                                                        Apply Suggested Title
                                                    </button>
                                                </div>
                                                <p className="text-xs text-emerald-200 font-semibold">{vid.optimized_title}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TAB 2: DESCRIPTION & SEO OPTIMIZATION */}
                                {activeTab === 'description' && (
                                    <div className="space-y-4 bg-[#14141a] border border-white/5 rounded-2xl p-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-300">Video Description:</label>
                                            <textarea 
                                                rows={5}
                                                value={editingDescMap[video_id] || ''}
                                                onChange={e => setEditingDescMap(prev => ({ ...prev, [video_id]: e.target.value }))}
                                                className="w-full bg-[#09090b] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-red-500/50 leading-relaxed font-mono"
                                            />
                                        </div>

                                        {vid.suggested_description && (
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-[10px] text-gray-400">Structured with search intent keywords & social hooks</span>
                                                <button
                                                    onClick={() => setEditingDescMap(prev => ({ ...prev, [video_id]: vid.suggested_description }))}
                                                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                                                >
                                                    Reset to AI Suggested Description
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TAB 3: TAGS OPTIMIZATION */}
                                {activeTab === 'tags' && (
                                    <div className="space-y-4 bg-[#14141a] border border-white/5 rounded-2xl p-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-300">Active Tags:</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(editingTagsMap[video_id] || []).map((t, tidx) => (
                                                    <span key={tidx} className="px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-200 flex items-center gap-1.5">
                                                        #{t}
                                                        <button 
                                                            onClick={() => handleRemoveTag(video_id, t)}
                                                            className="text-gray-400 hover:text-red-400 font-bold ml-1"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Add Custom Tag */}
                                        <div className="flex items-center gap-2 pt-2">
                                            <input 
                                                type="text"
                                                placeholder="Add new tag..."
                                                value={customTagInputs[video_id] || ''}
                                                onChange={e => setCustomTagInputs(prev => ({ ...prev, [video_id]: e.target.value }))}
                                                onKeyDown={e => e.key === 'Enter' && handleAddTag(video_id)}
                                                className="bg-[#09090b] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                                            />
                                            <button
                                                onClick={() => handleAddTag(video_id)}
                                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
                                            >
                                                Add Tag
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: SILICONFLOW AI THUMBNAIL GENERATOR */}
                                {activeTab === 'thumbnail' && (
                                    <div className="space-y-4 bg-[#14141a] border border-white/5 rounded-2xl p-5">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                                    SiliconFlow 4K Thumbnail Generator
                                                </h4>
                                                <p className="text-[10px] text-gray-400">
                                                    Generates vibrant, high-CTR cover art tailored to your video's title using SiliconFlow FLUX models.
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleGenerateThumbnail(vid)}
                                                disabled={isThumbGenerating}
                                                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50 flex-shrink-0"
                                            >
                                                <Wand2 className={`w-3.5 h-3.5 ${isThumbGenerating ? 'animate-spin' : ''}`} />
                                                {isThumbGenerating ? 'Generating 4K Cover...' : 'Generate AI Thumbnail'}
                                            </button>
                                        </div>

                                        {vid.thumbnail && (
                                            <div className="pt-2">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Current Cover Image:</p>
                                                <div className="w-64 h-36 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                                                    <img src={vid.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
