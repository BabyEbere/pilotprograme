"use client";

import { useState, useEffect } from 'react';
import {
    MdAdd,
    MdVideoLibrary,
    MdVisibility,
    MdAnalytics,
    MdCheckCircle,
    MdError,
    MdPending,
    MdPlayArrow,
    MdLink,
    MdLightbulb,
    MdSettings,
    MdCategory,
    MdTrendingUp
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function YouTubeLearningHub() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sources, setSources] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('sources'); // sources | insights | brain
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [isFaceless, setIsFaceless] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    // Brain rules state
    const [brainData, setBrainData] = useState(null);
    const [brainLoading, setBrainLoading] = useState(false);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    useEffect(() => {
        fetchSources();
        fetchInsights();
        fetchBrainRules();

        const interval = setInterval(() => {
            fetchSources();
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const fetchSources = async () => {
        try {
            const response = await fetch(`${API_URL}/youtube/sources`);
            const data = await response.json();
            if (data.success) {
                setSources(data.sources || []);
            }
        } catch (error) {
            console.error('Error fetching sources:', error);
        }
    };

    const fetchInsights = async () => {
        try {
            const response = await fetch(`${API_URL}/youtube/insights?faceless_only=true&min_confidence=70`);
            const data = await response.json();
            if (data.success) {
                setInsights(data.insights || []);
            }
        } catch (error) {
            console.error('Error fetching insights:', error);
        }
    };

    const fetchBrainRules = async () => {
        setBrainLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/youtube-analyzer/brain-rules`);
            const data = await response.json();
            if (data.success) {
                setBrainData(data);
            }
        } catch (error) {
            console.error('Error fetching brain rules:', error);
        } finally {
            setBrainLoading(false);
        }
    };

    const addSource = async (e) => {
        e.preventDefault();
        if (!newSourceUrl.trim()) return;

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${API_URL}/youtube/sources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: newSourceUrl,
                    is_faceless: isFaceless,
                    user_id: user ? user.id : 1
                })
            });

            const data = await response.json();
            if (data.success) {
                setNewSourceUrl('');
                setShowAddModal(false);
                fetchSources();
                alert('YouTube source added successfully!');
            } else {
                alert(data.message || 'Failed to add source');
            }
        } catch (error) {
            console.error('Error adding source:', error);
            alert('Error adding source');
        } finally {
            setLoading(false);
        }
    };

    const analyzeVideo = async (sourceId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/youtube/analyze/${sourceId}`, {
                method: 'POST'
            });

            const data = await response.json();
            if (data.success) {
                alert('Analysis started in background. The status will update automatically when finished.');
                fetchSources();
            } else {
                alert(data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Error analyzing video:', error);
            alert('Error analyzing video');
        } finally {
            setLoading(false);
        }
    };

    const viewAnalysis = async (sourceId) => {
        try {
            const source = sources.find(s => s.id === sourceId);
            if (source && source.latest_analysis_id) {
                const analysisResponse = await fetch(`${API_URL}/youtube/analyses/${source.latest_analysis_id}`);
                const analysisData = await analysisResponse.json();

                if (analysisData.success) {
                    setSelectedAnalysis(analysisData.analysis);
                }
            }
        } catch (error) {
            console.error('Error viewing analysis:', error);
        }
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            analyzing: 'bg-blue-100 text-blue-800 animate-pulse',
            analyzed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800'
        };
        const icons = {
            pending: MdPending,
            analyzing: MdAnalytics,
            analyzed: MdCheckCircle,
            failed: MdError
        };
        const Icon = icons[status] || MdPending;

        return (
            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                <Icon className="w-3.5 h-3.5" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-800 dark:bg-[#0c0c0e] dark:text-gray-100">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white dark:bg-[#121215] border-b border-gray-200 dark:border-white/5">
                    <div className="px-6 py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">YouTube Learning Hub</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage data sources and view extracted diagnostics intelligence</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-red-650 hover:bg-red-750 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider shadow-sm cursor-pointer"
                            >
                                <MdAdd className="w-4 h-4" />
                                Add Learning Source
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-6 mt-6 border-b border-gray-200 dark:border-white/5">
                            <button
                                onClick={() => setActiveTab('sources')}
                                className={`pb-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'sources'
                                    ? 'border-red-600 text-red-600 font-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white'
                                    }`}
                            >
                                Data Sources ({sources.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`pb-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'insights'
                                    ? 'border-red-600 text-red-600 font-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white'
                                    }`}
                            >
                                Extracted Insights ({insights.length})
                            </button>
                            <button
                                onClick={() => { setActiveTab('brain'); fetchBrainRules(); }}
                                className={`pb-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'brain'
                                    ? 'border-red-600 text-red-600 font-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white'
                                    }`}
                            >
                                Diagnostics Brain
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'sources' && (
                        <div className="space-y-4">
                            {sources.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-[#121215] rounded-3xl border border-gray-200 dark:border-white/5">
                                    <MdVideoLibrary className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">No sources yet</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add a YouTube channel or video to start learning.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {sources.map((source) => (
                                        <div key={source.id} className="bg-white dark:bg-[#121215] rounded-2xl border border-gray-200 dark:border-white/5 hover:shadow-md transition-all p-5">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-bold text-gray-950 dark:text-white text-base leading-tight">
                                                            {source.title || source.url}
                                                        </h3>
                                                        {getStatusBadge(source.status)}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-650 dark:text-gray-405 mb-3">
                                                        {source.channel_name && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-gray-900 dark:text-gray-200">{source.channel_name}</span>
                                                            </div>
                                                        )}
                                                        {source.subscriber_count && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span>{formatNumber(source.subscriber_count)} subscribers</span>
                                                            </div>
                                                        )}
                                                        {source.is_faceless && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/10">
                                                                    Faceless Content
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-red-650 flex items-center gap-1 font-bold">
                                                                <MdLink /> View Link
                                                            </a>
                                                        </div>

                                                        {source.quality_score && (
                                                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-md text-[10px] font-bold border border-green-500/10">
                                                                <span>Quality Score: {source.quality_score}/100</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {source.status === 'pending' && (
                                                        <button
                                                            onClick={() => analyzeVideo(source.id)}
                                                            disabled={loading}
                                                            className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-xs font-bold text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
                                                        >
                                                            <MdAnalytics className="text-blue-500" />
                                                            Analyze Now
                                                        </button>
                                                    )}

                                                    {source.status === 'analyzed' && (
                                                        <button
                                                            onClick={() => viewAnalysis(source.id)}
                                                            className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-xs font-bold text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
                                                        >
                                                            <MdVisibility className="text-gray-500" />
                                                            View Report
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {insights.length === 0 ? (
                                <div className="col-span-full text-center py-12 bg-white dark:bg-[#121215] rounded-3xl border border-gray-200 dark:border-white/5">
                                    <MdAnalytics className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">No insights yet</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Analyze videos to generate AI insights.</p>
                                </div>
                            ) : (
                                insights.map((insight, index) => (
                                    <div key={index} className="bg-white dark:bg-[#121215] rounded-2xl border border-gray-200 dark:border-white/5 p-5 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 capitalize border border-blue-500/10">
                                                {insight.insight_type.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/10">
                                                {insight.confidence_score}% Match
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#16161a] rounded-xl p-3 font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto border border-gray-150 dark:border-white/5">
                                            {typeof insight.insight_data === 'string'
                                                ? JSON.stringify(JSON.parse(insight.insight_data), null, 2)
                                                : JSON.stringify(insight.insight_data, null, 2)
                                            }
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'brain' && (
                        <div className="space-y-6">
                            {brainLoading ? (
                                <div className="text-center py-6 text-xs text-gray-500">Loading gathered diagnostics dataset...</div>
                            ) : brainData ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    
                                    {/* Parameter Rules */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <MdSettings className="text-blue-500" />
                                            Heuristic Diagnostics Parameters
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {brainData.rules.map((rule, idx) => (
                                                <div key={idx} className="bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{rule.parameter}</h4>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{rule.impact}</p>
                                                    </div>
                                                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/10 px-2.5 py-0.5 rounded-lg text-[10px] font-bold shrink-0">
                                                        {rule.range}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Gathered Keywords Frequency */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <MdTrendingUp className="text-emerald-500" />
                                            Gathered Focus Keywords
                                        </h3>
                                        <div className="bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 p-4 rounded-2xl space-y-3">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Ingested Tags Frequency Rank</p>
                                            
                                            {brainData.top_keywords.length === 0 ? (
                                                <p className="text-xs text-gray-500 italic">No audited tags cached yet.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {brainData.top_keywords.map((kw, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs">
                                                            <span className="font-mono text-gray-300 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">{kw.keyword}</span>
                                                            <span className="text-[10px] font-black text-emerald-450">{kw.frequency} times</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Summary Stats */}
                                        <div className="bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/5 p-4 rounded-2xl space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Audited Videos:</span>
                                                <span className="font-bold text-white">{brainData.summary.total_videos_audited}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Average Views/Video:</span>
                                                <span className="font-bold text-white">{brainData.summary.avg_views_per_video.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic">Failed to fetch brain diagnostics database.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Source Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-xl">
                        <div className="p-6">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Add YouTube Learning Source</h2>
                            <form onSubmit={addSource} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">YouTube URL</label>
                                    <input
                                        type="text"
                                        value={newSourceUrl}
                                        onChange={(e) => setNewSourceUrl(e.target.value)}
                                        placeholder="Video or Channel URL"
                                        className="w-full px-3 py-2 bg-white dark:bg-[#18181c] border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-650 text-xs text-white focus:outline-none"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="faceless"
                                        checked={isFaceless}
                                        onChange={(e) => setIsFaceless(e.target.checked)}
                                        className="rounded border-gray-300 dark:border-white/10 text-red-600 focus:ring-red-600 bg-transparent"
                                    />
                                    <label htmlFor="faceless" className="text-xs text-gray-700 dark:text-gray-300">This is faceless content</label>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-white/5 uppercase tracking-wider transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-655 text-white rounded-lg text-xs font-bold hover:bg-red-750 disabled:opacity-50 uppercase tracking-wider transition-all"
                                    >
                                        {loading ? 'Adding...' : 'Add Source'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
