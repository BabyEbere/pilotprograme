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
    MdLink
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function YouTubeLearningHub() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sources, setSources] = useState([]);
    const [analyses, setAnalyses] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('sources'); // sources, insights
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [isFaceless, setIsFaceless] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    useEffect(() => {
        fetchSources();
        fetchInsights();

        // Poll for updates if analysis is in progress
        const interval = setInterval(() => {
            fetchSources();
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchSources = async () => {
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/youtube/sources`);
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
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/youtube/insights?faceless_only=true&min_confidence=70`);
            const data = await response.json();
            if (data.success) {
                setInsights(data.insights || []);
            }
        } catch (error) {
            console.error('Error fetching insights:', error);
        }
    };

    const addSource = async (e) => {
        e.preventDefault();
        if (!newSourceUrl.trim()) return;

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/youtube/sources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: newSourceUrl,
                    is_faceless: isFaceless,
                    user_id: user ? user.id : 1 // Fallback to 1 if no user (shouldn't happen in protected route)
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
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/youtube/analyze/${sourceId}`, {
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
                const analysisResponse = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/youtube/analyses/${source.latest_analysis_id}`);
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
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">YouTube Learning Hub</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and analyze YouTube sources for AI learning</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <MdAdd className="w-5 h-5" />
                                Add Source
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-6 mt-6 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('sources')}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'sources'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                Data Sources ({sources.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'insights'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                Extracted Insights ({insights.length})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                    {activeTab === 'sources' && (
                        <div className="space-y-4">
                            {sources.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                    <MdVideoLibrary className="w-12 h-12 text-gray-700 dark:text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900">No sources yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">Add a YouTube channel or video to start learning.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {sources.map((source) => (
                                        <div key={source.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow p-5">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                                                            {source.title || source.url}
                                                        </h3>
                                                        {getStatusBadge(source.status)}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-500 mb-3">
                                                        {source.channel_name && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-medium text-gray-900">{source.channel_name}</span>
                                                            </div>
                                                        )}
                                                        {source.subscriber_count && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-gray-600 dark:text-gray-500 dark:text-gray-400">•</span>
                                                                <span>{formatNumber(source.subscriber_count)} subscribers</span>
                                                            </div>
                                                        )}
                                                        {source.is_faceless && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-gray-600 dark:text-gray-500 dark:text-gray-400">•</span>
                                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                                    Faceless Content
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                            <span className="text-gray-600 dark:text-gray-500 dark:text-gray-400">•</span>
                                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 flex items-center gap-1">
                                                                <MdLink /> View Link
                                                            </a>
                                                        </div>

                                                        {source.quality_score && (
                                                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold border border-green-100">
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
                                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <MdAnalytics className="text-blue-600" />
                                                            Analyze Now
                                                        </button>
                                                    )}

                                                    {source.status === 'analyzed' && (
                                                        <button
                                                            onClick={() => viewAnalysis(source.id)}
                                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <MdVisibility className="text-gray-500 dark:text-gray-400" />
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
                                <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                                    <MdAnalytics className="w-12 h-12 text-gray-700 dark:text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900">No insights yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze videos to generate AI insights.</p>
                                </div>
                            ) : (
                                insights.map((insight, index) => (
                                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 capitalize border border-blue-100">
                                                {insight.insight_type.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                {insight.confidence_score}% Match
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 rounded p-3 font-mono text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto border border-gray-100">
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
                </div>
            </div>

            {/* Analysis Detail Modal */}
            {selectedAnalysis && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-gray-900 truncate pr-8">{selectedAnalysis.title}</h2>
                            <button
                                onClick={() => setSelectedAnalysis(null)}
                                className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500 p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Views</p>
                                    <p className="text-2xl font-bold text-blue-900 mt-1">{formatNumber(selectedAnalysis.view_count)}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Quality Score</p>
                                    <p className="text-2xl font-bold text-green-900 mt-1">{selectedAnalysis.quality_score}/100</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Duration</p>
                                    <p className="text-2xl font-bold text-purple-900 mt-1">{selectedAnalysis.duration}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {selectedAnalysis.title_analysis && (
                                    <div className="border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                                            Title Analysis
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 font-mono whitespace-pre-wrap overflow-x-auto">
                                            {JSON.stringify(JSON.parse(selectedAnalysis.title_analysis), null, 2)}
                                        </div>
                                    </div>
                                )}

                                {selectedAnalysis.hook_analysis && (
                                    <div className="border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                                            Hook Analysis
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 font-mono whitespace-pre-wrap overflow-x-auto">
                                            {JSON.stringify(JSON.parse(selectedAnalysis.hook_analysis), null, 2)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Source Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add YouTube Source</h2>
                            <form onSubmit={addSource} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                                    <input
                                        type="text"
                                        value={newSourceUrl}
                                        onChange={(e) => setNewSourceUrl(e.target.value)}
                                        placeholder="Video or Channel URL"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="faceless"
                                        checked={isFaceless}
                                        onChange={(e) => setIsFaceless(e.target.checked)}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-600"
                                    />
                                    <label htmlFor="faceless" className="text-sm text-gray-700">This is faceless content</label>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
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
