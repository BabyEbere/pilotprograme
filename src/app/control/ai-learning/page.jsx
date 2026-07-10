"use client";

import { useState, useEffect } from 'react';
import {
    MdTrendingUp,
    MdThumbsUpDown,
    MdStar,
    MdWarning,
    MdLightbulb,
    MdCategory,
    MdFormatQuote,
    MdViewAgenda,
    MdAccessTime,
    MdCheckCircle
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function AILearningDashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [patterns, setPatterns] = useState([]);
    const [feedbackStats, setFeedbackStats] = useState(null);
    const [insights, setInsights] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedNiche, setSelectedNiche] = useState('all');
    const [niches, setNiches] = useState([]);

    useEffect(() => {
        fetchNiches();
        fetchPatterns();
        fetchFeedbackStats();
        fetchYouTubeInsights();
    }, [selectedNiche]);

    const fetchNiches = async () => {
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/niches`);
            const data = await response.json();
            if (data.success) {
                setNiches(data.niches || []);
            }
        } catch (error) {
            console.error('Error fetching niches:', error);
        }
    };

    const fetchPatterns = async () => {
        try {
            const url = selectedNiche === 'all'
                ? `${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/patterns?min_success_rate=70`
                : `${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/patterns?niche_id=${selectedNiche}&min_success_rate=70`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setPatterns(data.patterns || []);
            }
        } catch (error) {
            console.error('Error fetching patterns:', error);
        }
    };

    const fetchFeedbackStats = async () => {
        try {
            const url = selectedNiche === 'all'
                ? `${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/feedback/stats`
                : `${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/feedback/stats?niche_id=${selectedNiche}`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setFeedbackStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchYouTubeInsights = async () => {
        if (selectedNiche === 'all') {
            setInsights({});
            return;
        }

        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/insights/${selectedNiche}?faceless_only=true`);
            const data = await response.json();
            if (data.success) {
                setInsights(data.insights || {});
            }
        } catch (error) {
            console.error('Error fetching YouTube insights:', error);
        }
    };

    const getPatternTypeIcon = (type) => {
        const icons = {
            hook: MdFormatQuote,
            script_structure: MdViewAgenda,
            transition: MdTrendingUp,
            outro: MdAccessTime,
            title_pattern: MdLightbulb,
            general: MdCategory
        };
        const Icon = icons[type] || MdLightbulb;
        return <Icon className="w-4 h-4" />;
    };

    const getPatternTypeStyles = (type) => {
        const styles = {
            hook: 'bg-green-50 text-green-700 border-green-200',
            script_structure: 'bg-blue-50 text-blue-700 border-blue-200',
            transition: 'bg-purple-50 text-purple-700 border-purple-200',
            outro: 'bg-orange-50 text-orange-700 border-orange-200',
            title_pattern: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            general: 'bg-gray-50 text-gray-700 border-gray-200'
        };
        return styles[type] || 'bg-gray-50 text-gray-700 border-gray-200';
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
                                <h1 className="text-xl font-semibold text-gray-900">AI Learning Dashboard</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monitor learned patterns, feedback analytics, and insights</p>
                            </div>
                            <div className="w-full sm:w-64">
                                <select
                                    value={selectedNiche}
                                    onChange={(e) => setSelectedNiche(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-shadow"
                                >
                                    <option value="all">All Niches</option>
                                    {niches.filter(n => n.status === 'active').map(niche => (
                                        <option key={niche.id} value={niche.id}>{niche.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-6">
                    {/* Stats Overview */}
                    {feedbackStats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <MdThumbsUpDown className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Total Feedback</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{feedbackStats.total_feedback || 0}</p>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                        <MdStar className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Average Rating</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {feedbackStats.avg_rating ? Number(feedbackStats.avg_rating).toFixed(1) : '0.0'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">of 5.0</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                        <MdCheckCircle className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Positive (4-5⭐)</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{feedbackStats.positive_count || 0}</p>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                        <MdWarning className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Needs Work (1-2⭐)</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{feedbackStats.negative_count || 0}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Learned Patterns Column */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Learned Patterns</h2>
                            </div>

                            {patterns.length === 0 ? (
                                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
                                    <MdLightbulb className="w-12 h-12 text-gray-700 dark:text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-base font-medium text-gray-900">No patterns identified yet</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Patterns are extracted from highly-rated scripts.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {patterns.map((pattern) => (
                                        <div key={pattern.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPatternTypeStyles(pattern.pattern_type)}`}>
                                                        {getPatternTypeIcon(pattern.pattern_type)}
                                                        <span className="capitalize">{pattern.pattern_type.replace('_', ' ')}</span>
                                                    </span>
                                                    {pattern.niche_name && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                            {pattern.niche_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100">
                                                    <MdTrendingUp className="w-4 h-4" />
                                                    <span className="font-semibold">{Math.round(pattern.success_rate)}% Success Rate</span>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-sm text-gray-800 leading-relaxed mb-3">
                                                {typeof pattern.pattern_data === 'string'
                                                    ? JSON.parse(pattern.pattern_data).description
                                                    : pattern.pattern_data?.description || 'No description available'}
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100">
                                                <span>Used {pattern.usage_count} times in successful scripts</span>
                                                <span className="flex items-center gap-1">
                                                    <MdCheckCircle className="text-blue-500 w-3.5 h-3.5" /> Verified Effective
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* YouTube Insights Column */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900">YouTube Market Insights</h2>
                            {selectedNiche === 'all' ? (
                                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
                                    <MdCategory className="w-12 h-12 text-gray-700 dark:text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600 dark:text-gray-500 font-medium">Select a niche to view specific market insights</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-1">Insights are aggregated from top-performing videos.</p>
                                </div>
                            ) : Object.keys(insights).length === 0 ? (
                                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
                                    <MdAccessTime className="w-12 h-12 text-gray-700 dark:text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600 dark:text-gray-500">No market data available yet.</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-1">Add and analyze YouTube videos to generate insights.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {insights.hook_strategies?.length > 0 && (
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
                                                <MdFormatQuote className="text-green-600" />
                                                <h3 className="text-sm font-semibold text-gray-900">High-Converting Hooks</h3>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {insights.hook_strategies.slice(0, 3).map((hook, idx) => (
                                                    <div key={idx} className="bg-green-50/50 rounded-lg p-3 border border-green-100 hover:border-green-200 transition-colors">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-xs font-semibold text-green-800 uppercase tracking-wide">{hook.type?.replace('_', ' ')}</span>
                                                            <span className="text-xs font-bold text-green-600 bg-white px-1.5 py-0.5 rounded shadow-sm border border-green-100">{hook.strength}/10</span>
                                                        </div>
                                                        <p className="text-xs text-gray-700 leading-snug">{hook.strategy}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {insights.title_patterns?.length > 0 && (
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
                                                <MdLightbulb className="text-yellow-600" />
                                                <h3 className="text-sm font-semibold text-gray-900">Viral Title Templates</h3>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {insights.title_patterns.slice(0, 3).map((pattern, idx) => (
                                                    <div key={idx} className="bg-yellow-50/50 rounded-lg p-3 border border-yellow-100 hover:border-yellow-200 transition-colors">
                                                        <p className="text-xs font-medium text-gray-800 font-mono">{pattern.template}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {insights.structures?.length > 0 && (
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
                                                <MdViewAgenda className="text-blue-600" />
                                                <h3 className="text-sm font-semibold text-gray-900">Effective Structures</h3>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {insights.structures.slice(0, 2).map((struct, idx) => (
                                                    <div key={idx} className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 hover:border-blue-200 transition-colors">
                                                        <p className="text-xs font-bold text-blue-800 mb-1 capitalize">{struct.type?.replace('_', ' ')}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-500">Pacing: {struct.pacing}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
