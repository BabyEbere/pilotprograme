"use client";

import { useState, useEffect } from 'react';
import {
    MdAutoAwesome,
    MdSearch,
    MdCompareArrows,
    MdCheckCircle,
    MdCancel,
    MdLightbulb,
    MdTrendingUp,
    MdFactCheck,
    MdPendingActions
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function PromptManagement() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [niches, setNiches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [analyzingNiche, setAnalyzingNiche] = useState(null);
    const [viewMode, setViewMode] = useState('pending'); // pending, approved, rejected

    useEffect(() => {
        fetchNiches();
        fetchSuggestions(viewMode);
    }, [viewMode]);

    const fetchNiches = async () => {
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/niches`);
            const data = await response.json();
            if (data.success) {
                setNiches(data.niches || []);
            }
        } catch (error) {
            console.error('Error fetching niches:', error);
        }
    };

    const fetchSuggestions = async (status) => {
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/prompts/suggestions?status=${status}`);
            const data = await response.json();
            if (data.success) {
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const analyzeNiche = async (nicheId) => {
        setAnalyzingNiche(nicheId);
        setLoading(true);
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/prompts/analyze/${nicheId}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                alert(`Analysis complete!\nConfidence: ${data.analysis.confidence_score}%`);
                fetchSuggestions(viewMode);
            } else {
                alert(data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Error analyzing niche:', error);
            alert('Error analyzing niche');
        } finally {
            setAnalyzingNiche(null);
            setLoading(false);
        }
    };

    const approveSuggestion = async (suggestionId) => {
        const notes = prompt('Admin notes (optional):');
        setLoading(true);
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/prompts/suggestions/${suggestionId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_notes: notes })
            });
            const data = await response.json();
            if (data.success) {
                alert('Prompt updated successfully!');
                fetchSuggestions(viewMode);
                fetchNiches();
            } else {
                alert(data.message || 'Failed to approve');
            }
        } catch (error) {
            console.error('Error approving suggestion:', error);
            alert('Error approving suggestion');
        } finally {
            setLoading(false);
        }
    };

    const rejectSuggestion = async (suggestionId) => {
        const notes = prompt('Reason for rejection:');
        if (!notes) return;
        setLoading(true);
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/prompts/suggestions/${suggestionId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_notes: notes })
            });
            const data = await response.json();
            if (data.success) {
                alert('Suggestion rejected');
                fetchSuggestions(viewMode);
            } else {
                alert(data.message || 'Failed to reject');
            }
        } catch (error) {
            console.error('Error rejecting suggestion:', error);
            alert('Error rejecting suggestion');
        } finally {
            setLoading(false);
        }
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
                                <h1 className="text-xl font-semibold text-gray-900">Prompt Management</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Optimize AI prompts using YouTube insights and research data</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-6 mt-6 border-b border-gray-200">
                            {['pending', 'approved', 'rejected'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`pb-3 text-sm font-medium transition-colors border-b-2 capitalize ${viewMode === mode
                                            ? 'border-red-600 text-red-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                        }`}
                                >
                                    {mode} Suggestions
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-8">
                    {/* Niche Analysis Grid - Only show on pending view */}
                    {viewMode === 'pending' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MdAutoAwesome className="text-purple-600" />
                                Generate New Suggestions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {niches.filter(n => n.status === 'active').map((niche) => (
                                    <div key={niche.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm transition-all bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900">{niche.name}</h3>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 h-8">{niche.ai_prompt}</p>
                                        <button
                                            onClick={() => analyzeNiche(niche.id)}
                                            disabled={loading || analyzingNiche === niche.id}
                                            className="w-full py-2 bg-white border border-purple-200 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {analyzingNiche === niche.id ? (
                                                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700"></span>
                                            ) : (
                                                <MdAutoAwesome />
                                            )}
                                            {analyzingNiche === niche.id ? 'Analyzing...' : 'Generate Suggestion'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions List */}
                    <div className="space-y-6">
                        {suggestions.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                <MdPendingActions className="w-12 h-12 text-gray-700 dark:text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No {viewMode} suggestions found.</p>
                                {viewMode === 'pending' && <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-1">Generate a suggestion above to get started.</p>}
                            </div>
                        ) : (
                            suggestions.map((suggestion) => {
                                const researchData = typeof suggestion.research_data === 'string'
                                    ? JSON.parse(suggestion.research_data)
                                    : suggestion.research_data;
                                const analysis = researchData?.full_analysis || {};

                                return (
                                    <div key={suggestion.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-100 bg-gray-50">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">{suggestion.niche_name}</h3>
                                                    <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        {new Date(suggestion.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">AI Logic Optimization</p>
                                            </div>
                                            {analysis.confidence_score && (
                                                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-lg border border-green-200">
                                                    <MdTrendingUp className="w-5 h-5" />
                                                    <div className="text-xs font-bold">
                                                        {analysis.confidence_score}% Confidence
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            {/* Metrics Grid */}
                                            {analysis.current_prompt_analysis && (
                                                <div className="grid grid-cols-3 gap-4 mb-6">
                                                    <div className="bg-blue-50 rounded p-3 border border-blue-100 text-center">
                                                        <p className="text-xs text-blue-600 font-semibold uppercase">Effectiveness</p>
                                                        <p className="text-lg font-bold text-blue-900">{analysis.current_prompt_analysis.effectiveness_score}/100</p>
                                                    </div>
                                                    <div className="bg-green-50 rounded p-3 border border-green-100 text-center">
                                                        <p className="text-xs text-green-600 font-semibold uppercase">Strengths</p>
                                                        <p className="text-lg font-bold text-green-900">{analysis.current_prompt_analysis.strengths?.length || 0}</p>
                                                    </div>
                                                    <div className="bg-red-50 rounded p-3 border border-red-100 text-center">
                                                        <p className="text-xs text-red-600 font-semibold uppercase">Weaknesses</p>
                                                        <p className="text-lg font-bold text-red-900">{analysis.current_prompt_analysis.weaknesses?.length || 0}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Comparison */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                                <div className="border border-red-100 bg-red-50/30 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                        <MdCancel className="text-red-400" /> Current Prompt
                                                    </p>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono h-48 overflow-y-auto p-2 bg-white border border-gray-100 rounded">
                                                        {suggestion.current_prompt}
                                                    </div>
                                                </div>
                                                <div className="border border-green-100 bg-green-50/30 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                        <MdCheckCircle className="text-green-500" /> Suggested Optimization
                                                    </p>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono h-48 overflow-y-auto p-2 bg-white border border-gray-100 rounded">
                                                        {suggestion.suggested_prompt}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Why it's better */}
                                            {analysis.improvement_reasons?.length > 0 && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                                                    <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                                        <MdLightbulb className="text-blue-500" />
                                                        Why this is better
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {analysis.improvement_reasons.map((reason, idx) => (
                                                            <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                                                <span className="mt-1.5 w-1 h-1 bg-blue-400 rounded-full flex-shrink-0"></span>
                                                                {reason}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {suggestion.status === 'pending' && (
                                                <div className="flex gap-4 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => approveSuggestion(suggestion.id)}
                                                        disabled={loading}
                                                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                                                    >
                                                        <MdCheckCircle className="w-4 h-4" /> Approve & Apply
                                                    </button>
                                                    <button
                                                        onClick={() => rejectSuggestion(suggestion.id)}
                                                        disabled={loading}
                                                        className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <MdCancel className="w-4 h-4 text-gray-600 dark:text-gray-500 dark:text-gray-400" /> Reject
                                                    </button>
                                                </div>
                                            )}

                                            {suggestion.status !== 'pending' && (
                                                <div className="pt-4 border-t border-gray-100 bg-gray-50 -mx-5 -mb-5 p-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${suggestion.status === 'approved'
                                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                                            : 'bg-red-100 text-red-800 border border-red-200'
                                                        }`}>
                                                        {suggestion.status === 'approved' ? (
                                                            <><MdCheckCircle /> Approved</>
                                                        ) : (
                                                            <><MdCancel /> Rejected</>
                                                        )}
                                                    </span>
                                                    {suggestion.admin_notes && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">"{suggestion.admin_notes}"</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
