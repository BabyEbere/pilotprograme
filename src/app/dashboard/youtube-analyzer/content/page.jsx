"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Compass, Award, RefreshCw, ChevronRight, AlertCircle, Sparkles, 
    CheckSquare, Square, HelpCircle, X, BookOpen, Target, ArrowRight, 
    FileText, Star, Eye, ListFilter, Play, ChevronDown, CheckCircle, Flame
} from 'lucide-react';
import Loader from '@/components/Loader';

export default function ContentAudit() {
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState('');
    const [criticalErrors, setCriticalErrors] = useState([]);
    const [structuredData, setStructuredData] = useState(null);
    const [targetNiche, setTargetNiche] = useState('');
    const [newNicheInput, setNewNicheInput] = useState('');
    const [userStats, setUserStats] = useState(null);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    // UI state tabs: suggestions | auditing | gaps
    const [activeTab, setActiveTab] = useState('suggestions');
    
    // Daily suggestions and Favorite states
    const [dailyIdeas, setDailyIdeas] = useState([]);
    const [ideasLoading, setIdeasLoading] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [savedIdeas, setSavedIdeas] = useState({});
    const [toastMsg, setToastMsg] = useState('');

    // Video Audits states
    const [videoAudits, setVideoAudits] = useState([]);
    const [auditsLoading, setAuditsLoading] = useState(false);
    const [expandedVideoId, setExpandedVideoId] = useState(null);

    // Heuristics guide and Schooling card states
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [completedSolutions, setCompletedSolutions] = useState({});
    const [nicheSuccessMsg, setNicheSuccessMsg] = useState('');
    const [showSchoolingModal, setShowSchoolingModal] = useState(false);
    const [schoolingSlideIndex, setSchoolingSlideIndex] = useState(0);

    const router = useRouter();

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('user') || '{}') : '{}');

    // Helper parser to render bold (**text**) and italic (*text*) tags cleanly in React
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

    const fetchAnalysis = async (forceRun = false) => {
        if (!user?.id) return;
        
        if (forceRun) setActionLoading(true);
        else setLoading(true);
        
        setError('');
        setNicheSuccessMsg('');
        try {
            const endpoint = forceRun 
                ? `${API_URL}/youtube-analyzer/analysis/run/${user.id}` 
                : `${API_URL}/youtube-analyzer/analysis/${user.id}`;
                
            const method = forceRun ? 'POST' : 'GET';
            
            const res = await fetch(endpoint, { method });
            const data = await res.json();
            if (data.success) {
                setAnalysis(data.analysis || '');
                setCriticalErrors(data.critical_errors || []);
                setStructuredData(data.structured_data || null);
                setTargetNiche(data.target_niche || '');
                setNewNicheInput(data.target_niche || '');
                setUserStats(data.user_stats || null);
                
                if (data.structured_data?.problems?.length > 0) {
                    const dismissed = sessionStorage.getItem('schooling_dismissed');
                    if (!dismissed || forceRun) {
                        setShowSchoolingModal(true);
                        setSchoolingSlideIndex(0);
                    }
                }
            } else {
                setError(data.message || 'Failed to retrieve content analysis.');
            }
        } catch {
            setError('Could not connect to analysis servers. Please try again.');
        } finally {
            setLoading(false);
            setActionLoading(false);
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
            console.error("Failed to fetch daily suggestions", e);
        } finally {
            setIdeasLoading(false);
        }
    };

    const fetchVideoAudits = async () => {
        if (!user?.id) return;
        setAuditsLoading(true);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/channel-videos-audit/${user.id}`);
            const json = await res.json();
            if (json.success) {
                setVideoAudits(json.audits || []);
            }
        } catch (e) {
            console.error("Failed to load video audits", e);
        } finally {
            setAuditsLoading(false);
        }
    };

    const handleSaveIdea = async (idea) => {
        if (savedIdeas[idea.title]) return;
        setActionLoading(true);
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
                setToastMsg('Idea bookmarked successfully!');
                setTimeout(() => setToastMsg(''), 2000);
            } else {
                alert(json.message || 'Failed to save to favorites.');
            }
        } catch {
            alert('Failed to connect to Favorites database.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleNicheChange = async (e) => {
        e.preventDefault();
        if (!newNicheInput.trim()) return;

        setActionLoading(true);
        setNicheSuccessMsg('');
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/niche/change`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, niche: newNicheInput.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setNicheSuccessMsg(data.message);
                fetchAnalysis(false);
                fetchDailyIdeas();
            } else {
                setError(data.message || 'Failed to update niche focus.');
            }
        } catch {
            setError('Network error. Try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleSolution = (index) => {
        setCompletedSolutions(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    useEffect(() => {
        fetchAnalysis(false);
        fetchDailyIdeas();
    }, []);

    useEffect(() => {
        if (activeTab === 'auditing' && videoAudits.length === 0) {
            fetchVideoAudits();
        }
    }, [activeTab]);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader message="Uplifting channel advisory board..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto my-12 text-center space-y-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold uppercase tracking-wider text-white">Content Audit Restricted</h2>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    {error}
                </p>
                <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="mt-2 bg-red-600 hover:bg-red-750 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                    Link Channel
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative text-white">
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#101014] border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-bottom-5 duration-200">
                    <Star className="w-4 h-4 fill-emerald-450 text-emerald-400" />
                    {toastMsg}
                </div>
            )}

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="flex items-center gap-3.5 z-10">
                    <div className="w-11 h-11 bg-red-600/15 text-red-500 rounded-xl flex items-center justify-center border border-red-500/20">
                        <Compass className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-white leading-tight uppercase tracking-tight">PILOTPROGRAME YouTube Studio</h2>
                        <p className="text-[10px] text-gray-400 mt-0.5">Smart Channel Adviser &amp; Title Ranking Engine</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 z-10">
                    <button
                        onClick={() => setShowGuideModal(true)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-white/5"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Guide Playbook
                    </button>
                    <button
                        onClick={() => {
                            fetchAnalysis(true);
                            fetchDailyIdeas();
                            if (activeTab === 'auditing') fetchVideoAudits();
                        }}
                        disabled={actionLoading}
                        className="p-2.5 bg-red-650 hover:bg-red-750 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                        Uplift metrics
                    </button>
                </div>
            </div>

            {/* Unified Navigation Tabs */}
            <div className="flex items-center border-b border-white/5 pb-1 gap-2 overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'suggestions' 
                            ? 'border-red-500 text-white' 
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    Daily Content Suggestions
                </button>
                <button
                    onClick={() => setActiveTab('auditing')}
                    className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'auditing' 
                            ? 'border-red-500 text-white' 
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Eye className="w-3.5 h-3.5 text-red-500" />
                    Content Auditing &amp; Scoring
                </button>
                <button
                    onClick={() => setActiveTab('gaps')}
                    className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'gaps' 
                            ? 'border-red-500 text-white' 
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    Strategic Growth Gaps
                </button>
            </div>

            {/* Render Tab Contents */}

            {/* TAB 1: DAILY SUGGESTIONS */}
            {activeTab === 'suggestions' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select an idea card to examine outlines &amp; outlines</p>
                        <button
                            onClick={() => router.push('/dashboard/youtube-analyzer/daily-ideas')}
                            className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-wider flex items-center gap-1 transition-all"
                        >
                            Review My Bookmarked Favorites <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {ideasLoading ? (
                        <div className="py-20 text-center text-xs text-gray-500">
                            Compiling dynamic suggestions...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {dailyIdeas.map((idea, idx) => {
                                const isSaved = !!savedIdeas[idea.title];
                                const diffColor = idea.difficulty === 'Easy' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : idea.difficulty === 'Hard' 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

                                return (
                                    <div 
                                        key={idx} 
                                        className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:bg-white/[0.08] transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-red-600/5 rounded-full blur-[40px] pointer-events-none"></div>
                                        
                                        <div 
                                            onClick={() => setSelectedIdea(idea)}
                                            className="space-y-3 cursor-pointer select-none"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${diffColor}`}>
                                                    {idea.difficulty || 'Medium'}
                                                </span>
                                                <span className="text-[10px] font-black text-emerald-400">
                                                    {idea.predicted_ctr || 85}% success
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight leading-tight pt-1">
                                                {formatTextWithBold(idea.title)}
                                            </h4>
                                            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                                                {formatTextWithBold(idea.description)}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedIdea(idea)}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all border border-white/10"
                                            >
                                                Examine Details
                                            </button>
                                            <button
                                                onClick={() => handleSaveIdea(idea)}
                                                className={`p-2 rounded-xl border transition-all ${
                                                    isSaved 
                                                        ? 'bg-emerald-600/15 border-emerald-500/30 text-emerald-400' 
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                                }`}
                                                title="Save to Favorites"
                                            >
                                                <Star className={`w-4 h-4 ${isSaved ? 'fill-emerald-450' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: CONTENT AUDITING & TITLE SCORING */}
            {activeTab === 'auditing' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        System audits your recent uploads, ranks metadata performance, and compiles optimizations
                    </p>

                    {auditsLoading ? (
                        <div className="py-20 text-center text-xs text-gray-500">
                            Syncing recent uploads...
                        </div>
                    ) : videoAudits.length > 0 ? (
                        <div className="space-y-4">
                            {videoAudits.map((audit) => {
                                const isExpanded = expandedVideoId === audit.video_id;
                                const scoreColor = audit.rank_score >= 80 
                                    ? 'text-emerald-450 border-emerald-500/20 bg-emerald-500/5' 
                                    : audit.rank_score >= 60 
                                        ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' 
                                        : 'text-red-400 border-red-500/20 bg-red-500/5';

                                return (
                                    <div 
                                        key={audit.video_id} 
                                        className="bg-[#0f0f13] border border-white/5 rounded-3xl p-5 space-y-4 hover:border-white/10 transition-all"
                                    >
                                        {/* Video Row Header */}
                                        <div 
                                            onClick={() => setExpandedVideoId(isExpanded ? null : audit.video_id)}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-4.5">
                                                {audit.thumbnail ? (
                                                    <img 
                                                        src={audit.thumbnail} 
                                                        alt={audit.current_title} 
                                                        className="w-16 h-10 object-cover rounded-lg bg-black border border-white/5 flex-shrink-0" 
                                                    />
                                                ) : (
                                                    <div className="w-16 h-10 bg-white/5 rounded-lg flex items-center justify-center text-[10px] text-gray-500">
                                                        Video
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-250 leading-relaxed pr-6 line-clamp-1 group-hover:text-white">
                                                        {audit.current_title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {audit.is_already_good ? (
                                                            <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                                                                Optimal Metadata Score
                                                            </span>
                                                        ) : (
                                                            <span className="text-[8px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-wider">
                                                                Needs Hook Optimization
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score Indicator */}
                                            <div className="flex items-center gap-3 justify-between sm:justify-end">
                                                <div className={`px-3 py-1 rounded-xl border text-xs font-black ${scoreColor}`}>
                                                    Score: {audit.rank_score}/100
                                                </div>
                                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>

                                        {/* Video Expand Drawer */}
                                        {isExpanded && (
                                            <div className="pt-4 border-t border-white/5 space-y-4 animate-in fade-in duration-200">
                                                
                                                {/* Already Optimal Message */}
                                                {audit.is_already_good ? (
                                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                                                        <CheckCircle className="w-4.5 h-4.5 text-emerald-455 mt-0.5 flex-shrink-0" />
                                                        <div className="text-xs leading-relaxed text-gray-300">
                                                            <strong className="text-white">This video has optimal tags and titles!</strong> Our search optimizer checked this video and verified that the title hooks, description length, and tags are correctly formatted. No changes are recommended.
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Optimization suggestions
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                                                        <div className="space-y-3">
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Recommended Title Hook</p>
                                                                <p className="text-gray-200 font-bold p-3 bg-white/5 border border-white/5 rounded-xl">
                                                                    {audit.optimized_title}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono">Suggested Search Tags</p>
                                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                                    {audit.suggested_tags?.map((tag, idx) => (
                                                                        <span key={idx} className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-semibold text-gray-300">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">SEO Description Improvement</p>
                                                            <p className="text-gray-300 leading-relaxed p-4 bg-white/5 border border-white/5 rounded-xl min-h-[90px]">
                                                                {audit.suggested_description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center text-xs text-gray-500">
                            No uploaded videos parsed from channel feed.
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: STRATEGIC GROWTH GAPS */}
            {activeTab === 'gaps' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                    
                    {/* Left Gaps Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {criticalErrors.length > 0 && (
                            <div className="bg-red-500/5 border border-red-500/15 rounded-3xl p-5 shadow-sm space-y-2">
                                <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    Channel Optimization Gaps Identified
                                </h3>
                                <ul className="space-y-1">
                                    {criticalErrors.map((err, i) => (
                                        <li key={i} className="text-xs text-red-200/70 flex items-start gap-1">
                                            • {err}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Problems Section */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Diagnosed Problems</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {structuredData?.problems?.map((prob, i) => (
                                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-red-600/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-red-600/10 transition-all"></div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                                            {prob.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            {prob.description}
                                        </p>
                                    </div>
                                ))}
                                {(!structuredData?.problems || structuredData.problems.length === 0) && (
                                    <p className="text-xs text-gray-500">No problems diagnosed. Run AI Uplift to compile deeper audits.</p>
                                )}
                            </div>
                        </div>

                        {/* Solutions Checklist */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Award className="w-4.5 h-4.5 text-emerald-400" />
                                Advisor Recommended Action Plan
                            </h3>
                            <div className="space-y-3.5">
                                {structuredData?.solutions?.map((sol, i) => {
                                    const isDone = !!completedSolutions[i];
                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => toggleSolution(i)}
                                            className="flex items-start gap-3 p-3 bg-[#0f0f13] border border-white/5 rounded-xl cursor-pointer hover:bg-white/5 transition-all select-none"
                                        >
                                            <button className="text-gray-500 hover:text-white transition-colors mt-0.5 flex-shrink-0">
                                                {isDone ? (
                                                    <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                                                ) : (
                                                    <Square className="w-4.5 h-4.5 text-gray-600" />
                                                )}
                                            </button>
                                            <span className={`text-xs leading-relaxed transition-all ${isDone ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                                                {sol}
                                            </span>
                                        </div>
                                    );
                                })}
                                {(!structuredData?.solutions || structuredData.solutions.length === 0) && (
                                    <p className="text-xs text-gray-500">No solutions compiled yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Niche Pivot Column */}
                    <div className="space-y-6">
                        {/* Winning guide banner */}
                        <div className="bg-gradient-to-br from-purple-950/20 via-black to-[#0e0e12] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-purple-600/5 rounded-full blur-[50px] pointer-events-none"></div>
                            <div className="space-y-2.5 z-10 relative">
                                <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Strategy Guide</span>
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">How to Knock out Competitors</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    {structuredData?.winning_guide || 'Awaiting optimization audits.'}
                                </p>
                            </div>
                        </div>

                        {/* Niche Shift Form */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Target className="w-4 h-4 text-red-500" />
                                Pivot Content Niche
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Planning a direction change? Input your target niche below. The smart advisor will relearn behaviors and adapt suggested topics.
                            </p>
                            
                            {nicheSuccessMsg && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs font-bold">
                                    {nicheSuccessMsg}
                                </div>
                            )}

                            <form onSubmit={handleNicheChange} className="space-y-2">
                                <input
                                    type="text"
                                    value={newNicheInput}
                                    onChange={(e) => setNewNicheInput(e.target.value)}
                                    placeholder="e.g. Tech reviews, travel logs, coding..."
                                    required
                                    disabled={actionLoading}
                                    className="w-full px-3.5 py-2.5 bg-[#111115] border border-white/5 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-transparent text-xs text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <ArrowRight className="w-3.5 h-3.5 text-red-500" />
                                    Save &amp; Re-align
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            )}

            {/* DAILY IDEA DETAILED DRAWER POPUP */}
            {selectedIdea && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedIdea(null)}></div>
                    <div className="relative bg-[#0d0d12] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto z-10 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Close */}
                        <button 
                            onClick={() => setSelectedIdea(null)}
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Detailed Suggestions Outline</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Custom layout outlines matching your audience metrics</p>
                            </div>
                        </div>

                        {/* Title & Core concept */}
                        <div className="space-y-4 pt-2 text-xs">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Recommended Title</p>
                                <p className="text-sm font-bold text-white uppercase bg-white/5 p-3 rounded-xl border border-white/5 leading-snug">
                                    {formatTextWithBold(selectedIdea.title)}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 bg-[#111115] border border-white/5 p-4 rounded-xl">
                                    <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1">
                                        <BookOpen className="w-3.5 h-3.5" /> Core Concept
                                    </p>
                                    <p className="text-gray-300 leading-relaxed">
                                        {formatTextWithBold(selectedIdea.core_concept || selectedIdea.description)}
                                    </p>
                                </div>
                                <div className="space-y-1 bg-[#111115] border border-white/5 p-4 rounded-xl">
                                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                                        <Flame className="w-3.5 h-3.5" /> Hook Strategy
                                    </p>
                                    <p className="text-gray-300 leading-relaxed">
                                        {formatTextWithBold(selectedIdea.hook_strategy || "Start with an optimized pattern interrupt displaying metric charts.")}
                                    </p>
                                </div>
                            </div>

                            {/* Video outline steps */}
                            <div className="space-y-1 bg-[#111115] border border-white/5 p-4 rounded-xl">
                                <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Suggested Video Outline</p>
                                <div className="space-y-2 pt-2">
                                    {selectedIdea.video_outline && selectedIdea.video_outline.length > 0 ? (
                                        selectedIdea.video_outline.map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-[#08080a] p-2.5 rounded-lg">
                                                <span className="w-5 h-5 bg-purple-500/10 text-purple-450 rounded font-black text-[10px] flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-gray-300">{formatTextWithBold(step)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">No outline generated for this video concept.</p>
                                    )}
                                </div>
                            </div>

                            {/* Meta Tags & Descriptions */}
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Suggested Search Description Hook</p>
                                <p className="text-gray-300 leading-relaxed bg-[#111115] p-3.5 rounded-xl border border-white/5">
                                    {formatTextWithBold(selectedIdea.suggested_description || "Optimized hook targeting search queries.")}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">Suggested Keyword Tags</p>
                                <div className="flex flex-wrap gap-1.5 pt-1.5">
                                    {selectedIdea.suggested_tags?.map((tag, idx) => (
                                        <span key={idx} className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-semibold text-gray-350">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setSelectedIdea(null)}
                                className="bg-white/5 hover:bg-white/10 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border border-white/10"
                            >
                                Close Details
                            </button>
                            <button
                                onClick={() => router.push(`/dashboard/scriptwriter?template_title=${encodeURIComponent(selectedIdea.title)}`)}
                                className="bg-red-650 hover:bg-red-750 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Start Scriptwriter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Guide Manual Playbook Modal */}
            {showGuideModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowGuideModal(false)}></div>
                    
                    {/* Modal Card */}
                    <div className="relative bg-[#0d0d12] border border-white/10 rounded-3xl p-6 max-w-lg w-full z-10 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button 
                            onClick={() => setShowGuideModal(false)}
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Creator Strategy Playbook</h3>
                                <p className="text-[10px] text-gray-500 leading-none mt-0.5">Optimize and grow your channel metrics</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
                            <div className="space-y-1">
                                <p className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    1. Execute Solutions Checklist
                                </p>
                                <p className="pl-3 text-gray-400">
                                    Review the identified problems in the left column. Go down the solutions checklist to check off concrete optimizations you can complete on your channel.
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    2. Pivot &amp; Realign Targets
                                </p>
                                <p className="pl-3 text-gray-400">
                                    If you decide to shift your channel niche or target a different audience category, enter the new focus in the Pivot form to receive tailored content updates.
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    3. Write Knockout Content
                                </p>
                                <p className="pl-3 text-gray-400">
                                    Use the recommended titles list to launch scripts inside PilotPrograme's scriptwriter to produce optimized drafts that outperform your competitors.
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowGuideModal(false)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 border border-white/10 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Start Revitalizing My Channel
                        </button>
                    </div>
                </div>
            )}

            {/* Schooling Carousel Modal Backdrop */}
            {showSchoolingModal && structuredData?.problems && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => {
                        sessionStorage.setItem('schooling_dismissed', 'true');
                        setShowSchoolingModal(false);
                    }}></div>
                    
                    {/* schooling Card Frame */}
                    <div className="relative bg-[#0b0b0e] border border-red-500/20 rounded-3xl p-6 md:p-8 max-w-xl w-full z-10 space-y-6 shadow-2xl shadow-red-600/5 animate-in fade-in zoom-in-95 duration-300">
                        {/* Close button */}
                        <button 
                            onClick={() => {
                                sessionStorage.setItem('schooling_dismissed', 'true');
                                setShowSchoolingModal(false);
                            }}
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-450 hover:text-white rounded-xl transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Top Indicator */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Channel Schooling Series</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                Card {schoolingSlideIndex + 1} of {structuredData.problems.length + 1}
                            </span>
                        </div>

                        {/* Slide Contents */}
                        {schoolingSlideIndex < structuredData.problems.length ? (
                            // Problem Lesson Slides
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Diagnosed Issue</span>
                                    <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight mt-1">
                                        {structuredData.problems[schoolingSlideIndex].title}
                                    </h3>
                                </div>
                                
                                <div className="bg-[#111115] border border-white/5 p-5 rounded-2xl space-y-3">
                                    <div className="space-y-1 text-xs">
                                        <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Why this fails on YouTube:</p>
                                        <p className="text-gray-300 leading-relaxed">
                                            {structuredData.problems[schoolingSlideIndex].description}
                                        </p>
                                    </div>
                                    <div className="border-t border-white/5 pt-3 space-y-1 text-xs">
                                        <p className="font-bold text-emerald-400 uppercase tracking-wider text-[9px]">Python Growth Model Advice:</p>
                                        <p className="text-gray-300 leading-relaxed italic">
                                            This dynamic drag reduces YouTube feed distribution velocity. Follow the solutions plan checklist on your dashboard to re-initialize notification signals.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Final Solutions Summary Slide
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Course Complete</span>
                                    <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight mt-1">
                                        Your Tactical Action Plan
                                    </h3>
                                </div>

                                <div className="bg-[#111115] border border-white/5 p-5 rounded-2xl space-y-3">
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        We have mapped out a checklist of concrete action steps on your advisor board. Completing these will realign CTR values and close competitor upload gaps.
                                    </p>
                                    <div className="border-t border-white/5 pt-3 space-y-1.5">
                                        <p className="font-black text-white uppercase tracking-widest text-[9px]">Quick Summary:</p>
                                        <ul className="space-y-1">
                                            {structuredData.solutions?.slice(0, 3).map((sol, idx) => (
                                                <li key={idx} className="text-xs text-gray-400 flex items-start gap-1">
                                                    • {sol}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <button
                                onClick={() => setSchoolingSlideIndex(prev => Math.max(0, prev - 1))}
                                disabled={schoolingSlideIndex === 0}
                                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Back
                            </button>
                            
                            {schoolingSlideIndex < structuredData.problems.length ? (
                                <button
                                    onClick={() => setSchoolingSlideIndex(prev => prev + 1)}
                                    className="px-5 py-2.5 bg-red-650 hover:bg-red-750 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    Next Card
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        sessionStorage.setItem('schooling_dismissed', 'true');
                                        setShowSchoolingModal(false);
                                    }}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    Acknowledge &amp; Start
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {actionLoading && <Loader message="Updating advisor metrics..." fullScreen={true} />}
        </div>
    );
}
