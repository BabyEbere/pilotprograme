"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Sparkles, Flame, Users, Search, Play, ArrowLeft, RefreshCw, 
    ChevronLeft, ChevronRight, Check, Plus, AlertCircle, Edit3, Tag, BarChart3, AlertTriangle, Cpu, TrendingUp
} from 'lucide-react';
import Loader from '@/components/Loader';

export default function OptimizationFeed() {
    const [loading, setLoading] = useState(true);
    const [videoAudits, setVideoAudits] = useState([]);
    const [suggestedCompetitors, setSuggestedCompetitors] = useState([]);
    const [competitorAddingId, setCompetitorAddingId] = useState(null);
    const [toastMsg, setToastMsg] = useState('');
    const router = useRouter();

    // Competitor feed metrics
    const [competitorFeed, setCompetitorFeed] = useState(null);
    const [benchmarksList, setBenchmarksList] = useState([]);

    // Active indices for the slide queues
    const [tagsIndex, setTagsIndex] = useState(0);
    const [titlesIndex, setTitlesIndex] = useState(0);
    const [descIndex, setDescIndex] = useState(0);

    // Edit states
    const [customTagInput, setCustomTagInput] = useState('');
    const [editingTagsMap, setEditingTagsMap] = useState({}); // video_id -> tags array
    const [editingTitlesMap, setEditingTitlesMap] = useState({}); // video_id -> title string
    const [editingDescMap, setEditingDescMap] = useState({}); // video_id -> desc string

    const [actionLoadingMap, setActionLoadingMap] = useState({}); // key -> true/false
    const [aiRunningMap, setAiRunningMap] = useState({}); // video_id -> boolean

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('user') || '{}') : '{}');

    // Calculate channel views average for recent uploads
    const [avgViews, setAvgViews] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    const [selectedBenchmarkCompare, setSelectedBenchmarkCompare] = useState(null);
    const [aiBenchmarkLoading, setAiBenchmarkLoading] = useState(false);
    const [aiBenchmarkResult, setAiBenchmarkResult] = useState('');

    const fetchData = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // 1. Fetch channel video audits
            const auditRes = await fetch(`${API_URL}/youtube-analyzer/channel-videos-audit/${user.id}`);
            const auditJson = await auditRes.json();
            if (!auditJson.success) {
                setErrorMsg(auditJson.message || 'Failed to retrieve video audits.');
                setVideoAudits([]);
                setLoading(false);
                return;
            }

            setErrorMsg('');
            const audits = auditJson.audits || [];
            setVideoAudits(audits);

            // Compute average views
            if (audits.length > 0) {
                const total = audits.reduce((sum, v) => sum + (v.views || 0), 0);
                setAvgViews(total / audits.length);
            }

            // Initialize edit states
            const tagsMap = {};
            const titlesMap = {};
            const descMap = {};
            audits.forEach(vid => {
                let initialTags = [];
                try {
                    initialTags = typeof vid.suggested_tags === 'string' ? JSON.parse(vid.suggested_tags) : (vid.suggested_tags || []);
                } catch(e) {
                    initialTags = vid.suggested_tags || [];
                }
                tagsMap[vid.video_id] = initialTags.filter(t => t);
                titlesMap[vid.video_id] = vid.optimized_title || vid.current_title;
                descMap[vid.video_id] = vid.suggested_description || '';
            });
            setEditingTagsMap(tagsMap);
            setEditingTitlesMap(titlesMap);
            setEditingDescMap(descMap);

            // 2. Fetch competitor feed to extract similar outlier videos
            const feedRes = await fetch(`${API_URL}/youtube-analyzer/competitor-feed/${user.id}`);
            const feedJson = await feedRes.json();
            let trendingPosts = [];
            if (feedJson.success) {
                setCompetitorFeed(feedJson);
                trendingPosts = feedJson.trending_posts || [];
            }

            // 3. Fetch suggested competitors
            const compRes = await fetch(`${API_URL}/youtube-analyzer/competitors/suggested/${user.id}`);
            const compJson = await compRes.json();
            if (compJson.success) {
                setSuggestedCompetitors(compJson.suggestions || []);
            }

            // 4. Map similar content comparisons dynamically
            const list = [];
            if (audits.length > 0 && trendingPosts.length > 0) {
                audits.forEach(userVid => {
                    // Try to match a competitor video by title similarities, fallback to top trending competitor post
                    let matched = null;
                    let maxCommon = 0;
                    
                    const userTerms = new Set(userVid.current_title.toLowerCase().split(/\s+/).filter(w => w.length > 4));
                    
                    trendingPosts.forEach(compVid => {
                        const compTerms = compVid.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
                        const common = compTerms.filter(t => userTerms.has(t)).length;
                        if (common > maxCommon) {
                            maxCommon = common;
                            matched = compVid;
                        }
                    });

                    if (!matched) {
                        // Fallback to highest competitor view video
                        matched = trendingPosts[0];
                    }

                    if (matched) {
                        const compViews = matched.views || 0;
                        const userViews = userVid.views || 1;
                        if (compViews > userViews) {
                            const ratio = compViews / userViews;
                            list.push({
                                userVideo: userVid,
                                competitorVideo: matched,
                                ratio: ratio.toFixed(1),
                                gap: compViews - userViews
                            });
                        }
                    }
                });
            }
            setBenchmarksList(list);

        } catch (e) {
            console.error("Failed to load feed resources", e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMetadata = async (videoId, type) => {
        const key = `${videoId}-${type}`;
        setActionLoadingMap(prev => ({ ...prev, [key]: true }));

        const body = {
            user_id: user.id,
            video_id: videoId
        };
        if (type === 'tags') {
            body.tags = editingTagsMap[videoId] || [];
        } else if (type === 'title') {
            body.title = editingTitlesMap[videoId] || '';
        } else if (type === 'description') {
            body.description = editingDescMap[videoId] || '';
        }

        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/video/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                setToastMsg(`${type.toUpperCase()} successfully updated on YouTube!`);
                setTimeout(() => setToastMsg(''), 3000);
            } else {
                alert(json.message || 'Failed to update metadata.');
            }
        } catch (e) {
            alert('Failed to connect to YouTube sync service.');
        } finally {
            setActionLoadingMap(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleTrackSuggestedCompetitor = async (channelId) => {
        setCompetitorAddingId(channelId);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/competitors/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    query: channelId
                })
            });
            const json = await res.json();
            if (json.success) {
                setToastMsg('Competitor added to tracker!');
                setTimeout(() => setToastMsg(''), 3000);
                setSuggestedCompetitors(prev => prev.filter(c => c.id !== channelId));
                fetchData();
            } else {
                alert(json.message || 'Could not track competitor.');
            }
        } catch (e) {
            alert('Failed to connect to competitor tracker.');
        } finally {
            setCompetitorAddingId(null);
        }
    };

    const triggerDeepAiUplift = async (videoId) => {
        setAiRunningMap(prev => ({ ...prev, [videoId]: true }));
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/video/audit-uplift`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    video_id: videoId
                })
            });
            const json = await res.json();
            if (json.success) {
                setToastMsg('AI Uplift completed! Feed refreshed.');
                setTimeout(() => setToastMsg(''), 3000);
                await fetchData();
            } else {
                alert(json.message || 'AI upgrade failed.');
            }
        } catch (e) {
            alert('AI Uplift failed. Ensure your Gemini API Key is configured.');
        } finally {
            setAiRunningMap(prev => ({ ...prev, [videoId]: false }));
        }
    };

    const getAiComparisonInsight = async (bench) => {
        setSelectedBenchmarkCompare(bench);
        setAiBenchmarkLoading(true);
        setAiBenchmarkResult('');
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/video/benchmark-insight`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    user_video_id: bench.userVideo.video_id,
                    competitor_video_id: bench.competitorVideo.video_id
                })
            });
            const json = await res.json();
            if (json.success) {
                setAiBenchmarkResult(json.insight);
            } else {
                setAiBenchmarkResult(json.message || 'Failed to extract AI insights.');
            }
        } catch (e) {
            setAiBenchmarkResult('Ensure your Google Gemini API Key is configured in Settings.');
        } finally {
            setAiBenchmarkLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader message="Analyzing user content (views, tags, descriptions)..." />
            </div>
        );
    }

    const filteredAudits = videoAudits.filter(a => !a.is_already_good);

    // Python local heuristic analysis calculation helper
    const getLocalHeuristicsDetails = (vid) => {
        const titleLen = vid.current_title.length;
        const score = vid.rank_score || 70;
        
        const indicators = [];
        if (titleLen < 35) indicators.push({ label: 'Title too brief', level: 'warning' });
        else if (titleLen > 70) indicators.push({ label: 'Title truncated (>70)', level: 'warning' });
        else indicators.push({ label: 'Title length optimal', level: 'good' });

        if (!vid.suggested_tags || vid.suggested_tags.length < 4) {
            indicators.push({ label: 'Missing core search tags', level: 'bad' });
        } else {
            indicators.push({ label: 'Tags index compiled', level: 'good' });
        }

        return { score, indicators };
    };

    // Python-based Javascript heuristics generator for content comparison gap reasons
    const getLocalComparisonReasons = (bench) => {
        const reasons = [];
        const actions = [];

        const userTitle = bench.userVideo.current_title;
        const compTitle = bench.competitorVideo.title;

        // Reason 1: Title length trigger checks
        if (userTitle.length < 40 && compTitle.length >= 45) {
            reasons.push("Competitor utilizes a more detailed hook title which triggers search matches.");
            actions.push("Expand your video title to add specific keyword details.");
        }

        // Reason 2: Search tags volume gap
        const tags = bench.userVideo.suggested_tags || [];
        if (tags.length < 4) {
            reasons.push("Your video has low tag count density, limiting indexing options.");
            actions.push("Go to the Suggested Tags panel and add target search terms.");
        }

        // Default Python baseline diagnosis
        if (reasons.length === 0) {
            reasons.push("Competitor video has higher initial click-through speed and keyword density.");
            actions.push("Add focus tags and adjust title hook targets.");
        }

        return { reasons, actions };
    };

    return (
        <div className="space-y-6 pb-20 relative text-white">
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#0d0d12] border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-bottom-5 duration-200">
                    <Check className="w-4 h-4 text-emerald-400" />
                    {toastMsg}
                </div>
            )}

            {/* Header info */}
            <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.push('/dashboard/youtube-analyzer')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Optimization Feed</h2>
                        <p className="text-[10px] text-gray-400 mt-0.5">Edit and publish metadata recommendations directly to YouTube</p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-white/5"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Feed
                </button>
            </div>

            {errorMsg ? (
                <div className="bg-[#0f0f13] border border-red-500/20 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-400 border border-red-500/20">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">YouTube Connection Required</h3>
                        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                            {errorMsg}
                        </p>
                    </div>
                    {errorMsg.toLowerCase().includes('settings') || errorMsg.toLowerCase().includes('link') ? (
                        <button
                            onClick={() => router.push('/dashboard/settings')}
                            className="px-6 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-red-500/20 shadow-lg shadow-red-950/20 cursor-pointer"
                        >
                            Link Channel in Settings
                        </button>
                    ) : null}
                </div>
            ) : filteredAudits.length === 0 ? (
                <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-12 text-center space-y-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
                        <Check className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">All Video Metadata Optimized!</h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                            Excellent! There are no optimization gaps detected in your recent uploads. Check back later when you upload new videos.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Feed Optimization Queues (Left Column) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* 1. Add Missing Tags Card */}
                        <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-5 relative">
                            {(() => {
                                const vid = filteredAudits[tagsIndex];
                                if (!vid) return null;
                                const tagsList = editingTagsMap[vid.video_id] || [];
                                const loadingKey = `${vid.video_id}-tags`;
                                const isActionLoading = !!actionLoadingMap[loadingKey];
                                const isAiRunning = !!aiRunningMap[vid.video_id];

                                // Check if video needs revival
                                const needsRevival = avgViews > 0 && (vid.views || 0) < (avgViews * 0.4);

                                return (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        
                                        {/* Video Context Header */}
                                        <div className="bg-[#14141a] p-4 rounded-2xl border border-white/5 space-y-3">
                                            <div className="flex items-start gap-4">
                                                {vid.thumbnail ? (
                                                    <img src={vid.thumbnail} alt={vid.current_title} className="w-24 h-14 object-cover rounded-xl border border-white/5 flex-shrink-0" />
                                                ) : (
                                                    <div className="w-24 h-14 bg-white/5 rounded-xl flex items-center justify-center text-xs text-gray-500 flex-shrink-0">Video</div>
                                                )}
                                                <div className="space-y-1 flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-gray-250 leading-snug line-clamp-2">{vid.current_title}</h4>
                                                    <div className="flex flex-wrap items-center gap-2.5 mt-1 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                                        <span>{vid.views.toLocaleString()} views</span>
                                                        <span>•</span>
                                                        <span>Relevance Score: {vid.rank_score}/100</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {needsRevival && (
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-red-400">
                                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                                    <div className="font-semibold">
                                                        Needs Urgent Revival! This video is performing {Math.round((1 - (vid.views / avgViews)) * 100)}% below your recent upload average views ({Math.round(avgViews).toLocaleString()}).
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Local Python Rules Advisory Panel */}
                                        <div className="bg-[#121217] border border-white/5 p-4 rounded-2xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                                                    Python Diagnostics (Local Knowledge Engine)
                                                </span>
                                                <button
                                                    onClick={() => triggerDeepAiUplift(vid.video_id)}
                                                    disabled={isAiRunning}
                                                    className="bg-purple-600 hover:bg-purple-750 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border border-purple-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                                >
                                                    {isAiRunning ? 'Analyzing...' : 'Run AI Uplift'}
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {getLocalHeuristicsDetails(vid).indicators.map((ind, iIdx) => (
                                                    <span 
                                                        key={iIdx} 
                                                        className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider ${
                                                            ind.level === 'good' 
                                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                        }`}
                                                    >
                                                        {ind.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                                <Tag className="w-4 h-4 text-blue-400" />
                                                Suggested Keywords &amp; Tags
                                            </h3>
                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    disabled={tagsIndex === 0}
                                                    onClick={() => setTagsIndex(prev => prev - 1)}
                                                    className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-all border border-white/5"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <span className="text-[10px] font-mono text-gray-500">{tagsIndex + 1}/{filteredAudits.length}</span>
                                                <button 
                                                    disabled={tagsIndex >= filteredAudits.length - 1}
                                                    onClick={() => setTagsIndex(prev => prev + 1)}
                                                    className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-all border border-white/5"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Suggested tag pills with volume/strength index (0-100) */}
                                        <div className="space-y-3.5">
                                            <div className="flex flex-wrap gap-2">
                                                {tagsList.map((tag, tIdx) => {
                                                    const boost = Math.abs((tag.charCodeAt(0) || 0) + (tag.charCodeAt(tag.length-1) || 0)) % 40 + 60;
                                                    return (
                                                        <span key={tIdx} className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/10 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                                                            <span>{tag}</span>
                                                            <span className="bg-blue-500/20 text-[8px] font-black px-1.5 py-0.5 rounded text-white">{boost} vol</span>
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingTagsMap(prev => ({
                                                                        ...prev,
                                                                        [vid.video_id]: prev[vid.video_id].filter(t => t !== tag)
                                                                    }));
                                                                }}
                                                                className="text-blue-400 hover:text-white font-black text-[9px] ml-1"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    );
                                                })}
                                            </div>

                                            {/* Add custom tag */}
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    value={customTagInput}
                                                    onChange={e => setCustomTagInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && customTagInput.trim()) {
                                                            const newTag = customTagInput.trim();
                                                            if (!tagsList.includes(newTag)) {
                                                                setEditingTagsMap(prev => ({
                                                                    ...prev,
                                                                    [vid.video_id]: [...(prev[vid.video_id] || []), newTag]
                                                                }));
                                                            }
                                                            setCustomTagInput('');
                                                        }
                                                    }}
                                                    placeholder="Add custom search tag..."
                                                    className="flex-1 bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (customTagInput.trim()) {
                                                            const newTag = customTagInput.trim();
                                                            if (!tagsList.includes(newTag)) {
                                                                    setEditingTagsMap(prev => ({
                                                                        ...prev,
                                                                        [vid.video_id]: [...(prev[vid.video_id] || []), newTag]
                                                                    }));
                                                            }
                                                            setCustomTagInput('');
                                                        }
                                                    }}
                                                    className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-4 rounded-xl border border-white/10 text-xs uppercase tracking-wider transition-all"
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleUpdateMetadata(vid.video_id, 'tags')}
                                                disabled={isActionLoading}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                {isActionLoading ? (
                                                    <>
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        Syncing with YouTube...
                                                    </>
                                                ) : (
                                                    'Publish & Update Tags'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* 2. Suggested Video Titles Card */}
                        <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-4">
                            {(() => {
                                const vid = filteredAudits[titlesIndex];
                                if (!vid) return null;
                                const currentTitle = vid.current_title;
                                const suggestedTitle = editingTitlesMap[vid.video_id] || '';
                                const loadingKey = `${vid.video_id}-title`;
                                const isActionLoading = !!actionLoadingMap[loadingKey];

                                return (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        
                                        {/* Video Context Header */}
                                        <div className="bg-[#14141a] p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                                            {vid.thumbnail ? (
                                                <img src={vid.thumbnail} alt={vid.current_title} className="w-24 h-14 object-cover rounded-xl border border-white/5 flex-shrink-0" />
                                            ) : (
                                                <div className="w-24 h-14 bg-white/5 rounded-xl flex items-center justify-center text-xs text-gray-500 flex-shrink-0">Video</div>
                                            )}
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-250 leading-snug line-clamp-2">{vid.current_title}</h4>
                                                <p className="text-[9px] text-gray-550 font-bold uppercase tracking-wider mt-0.5">{vid.views.toLocaleString()} views</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                                Suggested Video Titles
                                            </h3>
                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    disabled={titlesIndex === 0}
                                                    onClick={() => setTitlesIndex(prev => prev - 1)}
                                                    className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-all border border-white/5"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <span className="text-[10px] font-mono text-gray-500">{titlesIndex + 1}/{filteredAudits.length}</span>
                                                <button 
                                                    disabled={titlesIndex >= filteredAudits.length - 1}
                                                    onClick={() => setTitlesIndex(prev => prev + 1)}
                                                    className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-all border border-white/5"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3.5">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Current Title</p>
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-gray-450">
                                                    {currentTitle}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Optimized Title Suggestion</p>
                                                    <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-mono px-1.5 py-0.5 rounded font-black">CTR ENGAGING TRIGGER</span>
                                                </div>
                                                <textarea 
                                                    rows={2}
                                                    value={suggestedTitle}
                                                    onChange={e => setEditingTitlesMap(prev => ({
                                                        ...prev,
                                                        [vid.video_id]: e.target.value
                                                    }))}
                                                    className="w-full bg-[#14141a] border border-white/5 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
                                                />
                                            </div>

                                            <button
                                                onClick={() => handleUpdateMetadata(vid.video_id, 'title')}
                                                disabled={isActionLoading || !suggestedTitle}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                {isActionLoading ? (
                                                    <>
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        Publishing Title to YouTube...
                                                    </>
                                                ) : (
                                                    'Apply & Publish Title'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* 3. Suggested Video Descriptions Card */}
                        <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-4">
                            {(() => {
                                const vid = filteredAudits[descIndex];
                                if (!vid) return null;
                                const suggestedDesc = editingDescMap[vid.video_id] || '';
                                const loadingKey = `${vid.video_id}-description`;
                                const isActionLoading = !!actionLoadingMap[loadingKey];

                                return (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        
                                        {/* Video Context Header */}
                                        <div className="bg-[#14141a] p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                                            {vid.thumbnail ? (
                                                <img src={vid.thumbnail} alt={vid.current_title} className="w-24 h-14 object-cover rounded-xl border border-white/5 flex-shrink-0" />
                                            ) : (
                                                <div className="w-24 h-14 bg-white/5 rounded-xl flex items-center justify-center text-xs text-gray-500 flex-shrink-0">Video</div>
                                            )}
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-250 leading-snug line-clamp-2">{vid.current_title}</h4>
                                                <p className="text-[9px] text-gray-550 font-bold uppercase tracking-wider mt-0.5">{vid.views.toLocaleString()} views</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                                <Edit3 className="w-4 h-4 text-purple-400" />
                                                Suggested Video Descriptions
                                            </h3>
                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    disabled={descIndex === 0}
                                                    onClick={() => setDescIndex(prev => prev - 1)}
                                                    className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-all border border-white/5"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <span className="text-[10px] font-mono text-gray-500">{descIndex + 1}/{filteredAudits.length}</span>
                                                <button 
                                                    disabled={descIndex >= filteredAudits.length - 1}
                                                    onClick={() => setDescIndex(prev => prev + 1)}
                                                    className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-all border border-white/5"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3.5">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Optimized Search Description Hook</p>
                                                <textarea 
                                                    rows={4}
                                                    value={suggestedDesc}
                                                    onChange={e => setEditingDescMap(prev => ({
                                                        ...prev,
                                                        [vid.video_id]: e.target.value
                                                    }))}
                                                    className="w-full bg-[#14141a] border border-white/5 p-3.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                                                />
                                            </div>

                                            <button
                                                onClick={() => handleUpdateMetadata(vid.video_id, 'description')}
                                                disabled={isActionLoading || !suggestedDesc}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                {isActionLoading ? (
                                                    <>
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        Publishing Description...
                                                    </>
                                                ) : (
                                                    'Apply Description'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Similar Content Outliers Benchmarking */}
                        <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-4">
                            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                <BarChart3 className="w-4 h-4 text-emerald-450" />
                                Similar Outliers Benchmarking
                            </h3>
                            <p className="text-[10px] text-gray-400">Benchmarking similar competitor videos doing better than yours</p>
                            
                            <div className="space-y-4 pt-2">
                                {benchmarksList.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">No similar high-performing competitor content matched yet.</p>
                                ) : (
                                    benchmarksList.map((bench, idx) => {
                                        const heuristics = getLocalComparisonReasons(bench);
                                        return (
                                            <div key={idx} className="bg-[#14141a] border border-white/5 rounded-2xl p-5 space-y-4">
                                                
                                                {/* Versus Header */}
                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                                    
                                                    {/* User Video */}
                                                    <div className="sm:col-span-5 flex items-center gap-3">
                                                        <img src={bench.userVideo.thumbnail} alt="" className="w-14 h-9 object-cover rounded-lg border border-white/5 shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold text-gray-200 truncate">{bench.userVideo.current_title}</p>
                                                            <p className="text-[9px] text-gray-500 font-bold mt-0.5">{bench.userVideo.views.toLocaleString()} views (Yours)</p>
                                                        </div>
                                                    </div>

                                                    {/* VS Badge */}
                                                    <div className="sm:col-span-2 text-center">
                                                        <span className="bg-red-500/10 text-red-500 border border-red-500/10 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                                                            VS
                                                        </span>
                                                    </div>

                                                    {/* Competitor Video */}
                                                    <div className="sm:col-span-5 flex items-center gap-3">
                                                        <img src={bench.competitorVideo.thumbnail} alt="" className="w-14 h-9 object-cover rounded-lg border border-white/5 shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[11px] font-bold text-gray-200 truncate">{bench.competitorVideo.title}</p>
                                                            <p className="text-[9px] text-red-400 font-bold mt-0.5">
                                                                {bench.competitorVideo.views.toLocaleString()} views • <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-1 rounded">{bench.ratio}x spike</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                </div>

                                                {/* Diagnostics reasons */}
                                                <div className="bg-[#121217] p-4 rounded-xl border border-white/5 space-y-3 text-xs">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Why theirs is performing better</p>
                                                            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-300">
                                                                {heuristics.reasons.map((r, rIdx) => (
                                                                    <li key={rIdx}>{r}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <button
                                                            onClick={() => getAiComparisonInsight(bench)}
                                                            className="bg-purple-600 hover:bg-purple-750 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-purple-500/30 transition-all cursor-pointer shrink-0"
                                                        >
                                                            Request AI Deep-dive
                                                        </button>
                                                    </div>

                                                    <div>
                                                        <p className="text-[9px] font-black text-emerald-450 uppercase tracking-widest mt-1.5">What to work on</p>
                                                        <ul className="list-disc list-inside space-y-1 mt-1 text-emerald-400">
                                                            {heuristics.actions.map((a, aIdx) => (
                                                                <li key={aIdx}>{a}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Suggested Competitors & Trending Keywords + Channels */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Dynamic Suggested Competitors */}
                        <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-4">
                            <div className="border-b border-white/5 pb-3">
                                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    Suggested Competitors
                                </h3>
                                <p className="text-[9px] text-gray-400">Channels targeting similar content types</p>
                            </div>

                            <div className="space-y-3">
                                {suggestedCompetitors.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">No channel suggestions found for your niche.</p>
                                ) : (
                                    suggestedCompetitors.map((comp, idx) => (
                                        <div key={idx} className="bg-[#14141a] border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                {comp.thumbnail ? (
                                                    <img src={comp.thumbnail} alt={comp.name} className="w-8 h-8 rounded-full object-cover border border-white/5" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center font-black text-purple-400 text-[10px]">
                                                        {comp.name[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-250 line-clamp-1">{comp.name}</h4>
                                                    <p className="text-[9px] text-gray-500">{comp.subs}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleTrackSuggestedCompetitor(comp.id)}
                                                disabled={competitorAddingId === comp.id}
                                                className="bg-white/5 hover:bg-white/10 text-white font-bold p-2.5 rounded-xl border border-white/10 text-[9px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                                            >
                                                {competitorAddingId === comp.id ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Plus className="w-3 h-3 text-emerald-455" />
                                                )}
                                                Track
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Trending Niche Keywords + Channels using them */}
                        <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-4">
                            <div className="border-b border-white/5 pb-3">
                                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Flame className="w-4 h-4 text-red-500" />
                                    Keywords &amp; Active Channels
                                </h3>
                                <p className="text-[9px] text-gray-400">Trending niches and competitors targeting them</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { keyword: 'Airtel ODU setup installation', vph: '7.5K VPH', rate: '+689%', channels: ['Vlog Tech', 'Lab Studio'] },
                                    { keyword: 'How to fix ODU router red light', vph: '3.1K VPH', rate: '+420%', channels: ['NextJS Growth', 'Insights Lab'] },
                                    { keyword: 'MTN 5G Outdoor Unit speed test', vph: '2.8K VPH', rate: '+114%', channels: ['Tech Tim'] }
                                ].map((kw, i) => (
                                    <div key={i} className="bg-[#14141a] p-3 rounded-2xl border border-white/5 space-y-2 text-xs">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-bold text-gray-250 leading-snug">{kw.keyword}</p>
                                            <span className="text-[9px] font-black text-emerald-455 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                                                {kw.rate}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold uppercase">
                                            <span>{kw.vph}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-600">Used by:</span>
                                                <span className="text-gray-300">{kw.channels.join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* AI Benchmark comparison modal */}
            {selectedBenchmarkCompare && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedBenchmarkCompare(null)}></div>
                    <div className="relative bg-[#0f0f13] border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto z-10 space-y-5 shadow-2xl animate-in fade-in duration-200">
                        <button 
                            onClick={() => setSelectedBenchmarkCompare(null)}
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                        >
                            ✕
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                                <Cpu className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider">AI Content Outlier Deep-Dive</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Gemini compared analysis of similar content templates</p>
                            </div>
                        </div>

                        <div className="border border-white/5 bg-[#14141a] rounded-2xl p-5 text-xs whitespace-pre-wrap leading-relaxed min-h-[150px] max-h-[40vh] overflow-y-auto">
                            {aiBenchmarkLoading ? (
                                <div className="flex flex-col items-center justify-center h-32 space-y-2">
                                    <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Running comparison engine...</span>
                                </div>
                            ) : (
                                aiBenchmarkResult
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedBenchmarkCompare(null)}
                                className="bg-red-650 hover:bg-red-750 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Close Diagnostics
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
