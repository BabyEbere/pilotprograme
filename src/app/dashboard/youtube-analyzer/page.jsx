"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Youtube, Users, Eye, Video, Compass, AlertCircle, RefreshCw, 
    ChevronRight, BarChart3, Settings, Star, Sparkles, Flame, Calendar, TrendingDown, BookOpen,
    Trophy, Search, Plus, Check, Play, ChevronDown, CheckCircle, ArrowUpRight
} from 'lucide-react';
import Loader from '@/components/Loader';

export default function CreatorOverview() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const router = useRouter();

    // States
    const [dailyIdeas, setDailyIdeas] = useState([]);
    const [ideasLoading, setIdeasLoading] = useState(false);
    const [ideasRefreshing, setIdeasRefreshing] = useState(false);
    const [competitorFeed, setCompetitorFeed] = useState(null);
    const [feedLoading, setFeedLoading] = useState(false);
    const [feedTab, setFeedTab] = useState('trending'); // trending | new | down
    const [savedIdeas, setSavedIdeas] = useState({});
    const [toastMsg, setToastMsg] = useState('');

    // Trending keywords state
    const [trendingKeywords, setTrendingKeywords] = useState([]);
    const [keywordsLoading, setKeywordsLoading] = useState(false);

    // Suggested Competitors state
    const [suggestedCompetitors, setSuggestedCompetitors] = useState([]);
    const [competitorAddingId, setCompetitorAddingId] = useState(null);
    const [chatPromptInput, setChatPromptInput] = useState('');

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('user') || '{}') : '{}');

    const fetchDashboardSummary = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/dashboard/summary?user_id=${user.id}`);
            const json = await res.json();
            if (json.success) {
                setData(json);
            } else {
                setError(json.message || 'Failed to load creator data.');
            }
        } catch (e) {
            setError('Could not establish connection to the server.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyIdeas = async () => {
        if (!user?.id) return;
        setIdeasLoading(true);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/daily-ideas/${user.id}`);
            const json = await res.json();
            if (json.success) {
                setDailyIdeas(json.ideas || []);
            }
        } catch (e) {
            console.error("Failed to load daily ideas", e);
        } finally {
            setIdeasLoading(false);
        }
    };

    const fetchCompetitorFeed = async () => {
        if (!user?.id) return;
        setFeedLoading(true);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/competitor-feed/${user.id}`);
            const json = await res.json();
            if (json.success) {
                setCompetitorFeed(json);
            }
        } catch (e) {
            console.error("Failed to load competitor feed", e);
        } finally {
            setFeedLoading(false);
        }
    };

    const fetchSuggestedCompetitors = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/competitors/suggested/${user.id}`);
            const json = await res.json();
            if (json.success) {
                setSuggestedCompetitors(json.suggestions || []);
            }
        } catch (e) {
            console.error("Failed to load suggested competitors", e);
        }
    };

    const fetchTrendingKeywords = async () => {
        if (!user?.id) return;
        setKeywordsLoading(true);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/trending-keywords/${user.id}`);
            const json = await res.json();
            if (json.success) {
                setTrendingKeywords(json.keywords || []);
            }
        } catch (e) {
            console.error('Failed to load trending keywords', e);
        } finally {
            setKeywordsLoading(false);
        }
    };

    const formatTextWithBold = (text) => {
        if (!text) return '';
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-white font-black">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={index} className="italic text-gray-300">{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    const handleSaveIdea = async (idea) => {
        if (savedIdeas[idea.title]) return;
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/favorite-ideas/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    title: idea.title,
                    description: idea.description,
                    difficulty: idea.difficulty || 'Medium',
                    prediction_score: idea.predicted_ctr || 85,
                    core_concept: idea.core_concept || '',
                    hook_strategy: idea.hook_strategy || '',
                    video_outline: idea.video_outline || [],
                    suggested_description: idea.suggested_description || '',
                    suggested_tags: idea.suggested_tags || []
                })
            });
            const json = await res.json();
            if (json.success) {
                setSavedIdeas(prev => ({ ...prev, [idea.title]: true }));
                setToastMsg('Idea saved to Favorites!');
                setTimeout(() => setToastMsg(''), 3000);
            } else {
                alert(json.message || 'Could not save idea.');
            }
        } catch (e) {
            alert('Failed to connect to bookmarks manager.');
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
                // Refresh feeding lists
                fetchCompetitorFeed();
                setSuggestedCompetitors(prev => prev.filter(c => c.id !== channelId));
            } else {
                alert(json.message || 'Could not track competitor.');
            }
        } catch (e) {
            alert('Failed to connect to competitor tracker.');
        } finally {
            setCompetitorAddingId(null);
        }
    };

    const handleRefreshIdeas = async () => {
        if (!user?.id || ideasRefreshing) return;
        setIdeasRefreshing(true);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/daily-ideas/${user.id}?force=true`);
            const json = await res.json();
            if (json.success) {
                setDailyIdeas(json.ideas || []);
                setToastMsg('Fresh ideas generated!');
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (e) {
            console.error('Failed to refresh ideas', e);
        } finally {
            setIdeasRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardSummary();
        fetchDailyIdeas();
        fetchCompetitorFeed();
        fetchSuggestedCompetitors();
        fetchTrendingKeywords();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader message="Loading Creator Studio..." />
            </div>
        );
    }

    const subscription = data?.subscription;
    const maxYoutubeAnalyzer = parseInt(subscription?.max_youtube_analyzer || 0);
    const usedYoutubeAnalyzer = parseInt(subscription?.used_youtube_analyzer || 0);
    const isLocked = maxYoutubeAnalyzer === 0 || (usedYoutubeAnalyzer >= maxYoutubeAnalyzer);

    if (isLocked) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden bg-gradient-to-br from-[#0c0c10] to-[#08080c] rounded-3xl border border-white/5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-655/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/5 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider mb-2 z-10">YouTube Analyzer Locked</h2>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6 z-10">
                    {maxYoutubeAnalyzer === 0 
                        ? `The YouTube Channel Analyzer feature is not included in your current plan (${subscription?.plan_name || 'Free'}).`
                        : `You have reached your limit of ${maxYoutubeAnalyzer} YouTube audits on your current plan.`}
                    {" "}Upgrade to unlock full keyword research, competitor feeds, and video diagnostic audits.
                </p>
                <button
                    onClick={() => router.push('/dashboard/plans')}
                    className="bg-red-650 hover:bg-red-750 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-red-500/15 z-10"
                >
                    Upgrade Plan
                </button>
            </div>
        );
    }

    const linkedChannel = data?.youtube_channels && data.youtube_channels[0];

    // If no channel linked, show promotional setup layout
    if (!linkedChannel) {
        return (
            <div className="max-w-xl mx-auto my-12 text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                    <Youtube className="w-8 h-8 fill-red-500" />
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-wider text-white">No Linked YouTube Channel</h2>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                        To unlock deep content analysis, daily suggestions, competitor tracking, and AI growth audits, you need to link your YouTube channel first.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-left text-xs text-gray-400 space-y-3 leading-relaxed">
                    <p className="font-bold text-white uppercase tracking-wider text-[10px]">What you get:</p>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">• <span className="text-white font-semibold">AI Niche Audit:</span> Gemini analyzes your content style and recommends script structures.</li>
                        <li className="flex items-start gap-2">• <span className="text-white font-semibold">Daily Ideas:</span> 3 custom suggestions tailored to your niche targets daily.</li>
                        <li className="flex items-start gap-2">• <span className="text-white font-semibold">Competitor Feeds:</span> Spot trending, new, and down posts across competitors in real-time.</li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                        onClick={() => router.push('/dashboard/settings')}
                        className="bg-red-600 hover:bg-red-750 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                        Link Channel in Settings
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
                    >
                        Return to Main Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 relative text-white">
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#0d0d12] border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-bottom-5 duration-200">
                    <Star className="w-4 h-4 fill-emerald-400" />
                    {toastMsg}
                </div>
            )}

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="flex items-center gap-4 z-10">
                    {linkedChannel.thumbnail ? (
                        <img 
                            src={linkedChannel.thumbnail} 
                            alt={linkedChannel.title} 
                            className="w-14 h-14 rounded-2xl border-2 border-red-500/20 object-cover" 
                        />
                    ) : (
                        <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 font-bold border border-red-500/20">
                            YT
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-black text-white leading-tight uppercase tracking-tight">{linkedChannel.title}</h2>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Smart advisory linked
                            </div>
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                Audits: {usedYoutubeAnalyzer} / {maxYoutubeAnalyzer}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 z-10">
                    <button
                        onClick={() => router.push('/dashboard/youtube-analyzer/feed')}
                        className="p-2.5 bg-blue-650 hover:bg-blue-750 text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-md"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Optimization Feed
                    </button>
                    <button
                        onClick={() => {
                            fetchDashboardSummary();
                            fetchDailyIdeas();
                            fetchCompetitorFeed();
                            fetchSuggestedCompetitors();
                        }}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-405 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-white/5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Sync Feed
                    </button>
                </div>
            </div>

            {/* Milestone Unlocked Card */}
            <div className="bg-gradient-to-r from-yellow-500/10 via-amber-600/5 to-transparent border border-yellow-500/20 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center gap-3.5 z-10">
                    <div className="w-11 h-11 bg-yellow-500/15 text-yellow-500 rounded-2xl flex items-center justify-center border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                        <Trophy className="w-5.5 h-5.5 animate-bounce" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                            Milestone Unlocked!
                            <span className="bg-yellow-500 text-black font-black px-1.5 py-0.5 rounded text-[8px] tracking-normal uppercase">New</span>
                        </h3>
                        <p className="text-[11px] text-gray-300 font-bold mt-0.5">
                            Your channel crossed <span className="text-yellow-455">{Number(linkedChannel.views).toLocaleString()}</span> accumulated views! Next milestone unlocked target: { (Math.ceil(Number(linkedChannel.views) / 10000) * 10000).toLocaleString() } views.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 z-10">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        {Math.round(((Number(linkedChannel.views) % 10000) / 10000) * 100)}% to target
                    </span>
                </div>
            </div>

            {/* Subscriber & View Target progress bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Subscribers card */}
                <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Subscribers</p>
                    <p className="text-4xl font-black text-white mt-2 mb-4 tracking-tight">
                        {Number(linkedChannel.subscribers).toLocaleString()}
                    </p>
                    
                    {(() => {
                        const subs = Number(linkedChannel.subscribers || 0);
                        const nextTarget = Math.ceil(subs / 1000) * 1000;
                        const prevTarget = nextTarget - 1000;
                        const percent = ((subs - prevTarget) / 1000) * 100;
                        return (
                            <div className="space-y-2">
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                    <span>{(prevTarget / 1000).toFixed(1)}k</span>
                                    <span>{(nextTarget / 1000).toFixed(1)}k</span>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Views card */}
                <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Views</p>
                    <p className="text-4xl font-black text-white mt-2 mb-4 tracking-tight">
                        {Number(linkedChannel.views).toLocaleString()}
                    </p>
                    
                    {(() => {
                        const views = Number(linkedChannel.views || 0);
                        const nextTarget = Math.ceil(views / 5000) * 5000;
                        const prevTarget = nextTarget - 5000;
                        const percent = ((views - prevTarget) / 5000) * 100;
                        return (
                            <div className="space-y-2">
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                    <span>{(prevTarget / 1000).toFixed(0)}k</span>
                                    <span>{(nextTarget / 1000).toFixed(0)}k</span>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Quick Preview to Feed & Trending Keywords */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Metadata Optimization Summary */}
                <div className="lg:col-span-7 bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Compass className="w-4 h-4 text-blue-400 animate-pulse" />
                                Smart Channel Optimizer
                            </h3>
                            <p className="text-[10px] text-gray-400">Sync with YouTube API and optimize items in bulk</p>
                        </div>
                    </div>

                    <div className="bg-[#14141a] border border-white/5 rounded-2xl p-5 space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">Pending Tasks</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Our AI system has compiled suggestions for tags, search descriptions, and title hooks to boost your search discoverability by up to 94%.
                            </p>
                        </div>

                        <button
                            onClick={() => router.push('/dashboard/youtube-analyzer/feed')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                        >
                            Open Optimization Feed <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Trending Niche Keywords Preview */}
                <div className="lg:col-span-5 bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-red-500" />
                                Trending Keywords
                            </h3>
                            <p className="text-[10px] text-gray-400">Search volume trends in your niche</p>
                        </div>
                        {keywordsLoading && (
                            <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        )}
                    </div>

                    <div className="space-y-3">
                        {keywordsLoading ? (
                            <div className="space-y-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-8 bg-white/5 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : trendingKeywords.length > 0 ? (
                            trendingKeywords.slice(0, 5).map((kw, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-200 capitalize truncate max-w-[60%]">{kw.keyword}</span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-[9px] font-black text-gray-400">{kw.estimated_volume}</span>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                kw.trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' :
                                                kw.trend === 'down' ? 'bg-red-500/15 text-red-400' :
                                                'bg-gray-500/15 text-gray-400'
                                            }`}>
                                                {kw.trend === 'up' ? '+hot' : kw.trend === 'down' ? '-low' : '~stable'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${
                                                kw.heat > 65 ? 'bg-gradient-to-r from-red-500 to-orange-400' :
                                                kw.heat > 38 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                                                'bg-white/20'
                                            }`}
                                            style={{ width: `${kw.heat}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-[10px] text-gray-500 italic">Analyzing your niche keywords...</p>
                                <button
                                    onClick={fetchTrendingKeywords}
                                    className="mt-2 text-[9px] font-bold text-blue-400 underline uppercase tracking-wider cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Daily Ideas section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        Daily Content Suggestions
                    </h3>
                    <button
                        onClick={handleRefreshIdeas}
                        disabled={ideasRefreshing || ideasLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3 h-3 ${ideasRefreshing ? 'animate-spin' : ''}`} />
                        {ideasRefreshing ? 'Generating...' : 'Refresh Ideas'}
                    </button>
                </div>

                {ideasLoading ? (
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center text-xs text-gray-400">
                        Compiling suggestions...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {dailyIdeas.slice(0, 3).map((idea, idx) => {
                            const isSaved = !!savedIdeas[idea.title];
                            const diffColor = idea.difficulty === 'Easy' 
                                ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                                : idea.difficulty === 'Hard' 
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

                            return (
                                <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-red-600/5 rounded-full blur-[45px] pointer-events-none"></div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${diffColor}`}>
                                                {idea.difficulty || 'Medium'}
                                            </span>
                                            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                                <span className="px-1.5 py-0.5 bg-emerald-500/10 rounded font-mono font-black text-[9px]">{idea.predicted_ctr || 85}</span>
                                                success score
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-gray-250 leading-relaxed">
                                            {formatTextWithBold(idea.title)}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
                                            {formatTextWithBold(idea.description)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleSaveIdea(idea)}
                                        className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            isSaved 
                                                ? 'bg-emerald-600/15 border-emerald-500/30 text-emerald-400' 
                                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-400 text-emerald-400' : 'text-gray-400'}`} />
                                        {isSaved ? 'Bookmarked' : 'Add to Favorites'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* suggested competitors & Niche Outliers Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* suggested competitors */}
                <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-purple-400" />
                        Suggested Competitors in Your Niche
                    </h3>
                    
                    <div className="space-y-3 pt-2">
                        {suggestedCompetitors.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">No suggestions found yet.</p>
                        ) : (
                            suggestedCompetitors.slice(0, 3).map((comp, idx) => (
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
                                            <RefreshCw className="w-3 h-3 animate-spin" />
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

                {/* Niche Outliers Competitor Feeds */}
                <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Flame className="w-4.5 h-4.5 text-red-500" />
                            Niche Outliers
                        </h3>
                        <div className="flex items-center bg-[#0d0d12] border border-white/5 p-0.5 rounded-xl">
                            <button
                                onClick={() => setFeedTab('trending')}
                                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                    feedTab === 'trending' ? 'bg-red-600 text-white' : 'text-gray-450 hover:text-white'
                                }`}
                            >
                                Trending
                            </button>
                            <button
                                onClick={() => setFeedTab('new')}
                                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                    feedTab === 'new' ? 'bg-red-600 text-white' : 'text-gray-455 hover:text-white'
                                }`}
                            >
                                New
                            </button>
                        </div>
                    </div>

                    {feedLoading ? (
                        <div className="text-center py-6 text-xs text-gray-500">
                            Loading post feeds...
                        </div>
                    ) : competitorFeed ? (
                        <div className="space-y-3">
                            {(() => {
                                const list = feedTab === 'trending' ? competitorFeed.trending_posts : competitorFeed.new_posts;
                                if (!list || list.length === 0) {
                                    return <p className="text-xs text-gray-500 italic">No posts parsed yet.</p>;
                                }
                                return list.slice(0, 2).map((vid, idx) => (
                                    <a 
                                        key={idx} 
                                        href={`https://www.youtube.com/watch?v=${vid.video_id}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-[#14141a] border border-white/5 rounded-2xl p-3 flex items-center gap-3 hover:border-red-500/20 transition-all"
                                    >
                                        <img src={vid.thumbnail} alt={vid.title} className="w-16 h-10 object-cover rounded-lg border border-white/5 flex-shrink-0" />
                                        <div className="space-y-0.5 flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-gray-200 line-clamp-1 leading-snug">{vid.title}</h4>
                                            <p className="text-[9px] text-gray-500">{vid.views.toLocaleString()} views • {vid.competitor_name}</p>
                                        </div>
                                        <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex-shrink-0">
                                            1.8x speed
                                        </span>
                                    </a>
                                ));
                            })()}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 italic">Connect competitors to view outbound outlier data.</p>
                    )}
                </div>

            </div>

            {/* VidIQ Floating Sticky Bottom AI Chat Prompt Input Bar */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in slide-in-from-bottom-5 duration-300">
                <div className="bg-[#121216]/95 border border-white/10 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2">
                    <button className="px-3 py-1 bg-white/5 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/5 transition-all flex items-center gap-1">
                        Regular <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                    <input 
                        type="text" 
                        value={chatPromptInput}
                        onChange={(e) => setChatPromptInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && chatPromptInput.trim()) {
                                router.push(`/dashboard/chat?prompt=${encodeURIComponent(chatPromptInput.trim())}`);
                            }
                        }}
                        placeholder="Find me B-roll or ask Co-Pilot how to get more views..."
                        className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-gray-500 px-1 py-1"
                    />
                    <button 
                        onClick={() => {
                            if (chatPromptInput.trim()) {
                                router.push(`/dashboard/chat?prompt=${encodeURIComponent(chatPromptInput.trim())}`);
                            }
                        }}
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-750 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
