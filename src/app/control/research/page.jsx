"use client";

import { useState, useEffect } from 'react';
import {
    MdSearch,
    MdHistory,
    MdTrendingUp,
    MdDescription,
    MdCategory,
    MdExpandMore,
    MdExpandLess,
    MdYoutubeSearchedFor,
    MdSavedSearch
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function ResearchHub() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [niches, setNiches] = useState([]);
    const [selectedNiche, setSelectedNiche] = useState(null);
    const [researchTopic, setResearchTopic] = useState('');

    useEffect(() => {
        fetchSessions();
        fetchNiches();
    }, [filterType]);

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

    const fetchSessions = async () => {
        try {
            const url = filterType === 'all'
                ? `${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/research/sessions?limit=50`
                : `${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/research/sessions?type=${filterType}&limit=50`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setSessions(data.sessions || []);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const researchNiche = async (nicheId) => {
        setLoading(true);
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/research/niche/${nicheId}`, {
                method: 'POST'
            });

            const data = await response.json();
            if (data.success) {
                alert(`Research complete! Session ID: ${data.session_id}`);
                fetchSessions();
            } else {
                alert(data.message || 'Research failed');
            }
        } catch (error) {
            console.error('Error researching niche:', error);
            alert('Error researching niche');
        } finally {
            setLoading(false);
        }
    };

    const researchScripts = async (e) => {
        e.preventDefault();
        if (!researchTopic.trim()) {
            alert('Please enter a topic');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/research/scripts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: researchTopic,
                    faceless_only: true
                })
            });

            const data = await response.json();
            if (data.success) {
                alert(`Research complete! Session ID: ${data.session_id}`);
                setResearchTopic('');
                fetchSessions();
            } else {
                alert(data.message || 'Research failed');
            }
        } catch (error) {
            console.error('Error researching scripts:', error);
            alert('Error researching scripts');
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            niche_analysis: MdCategory,
            youtube_scripts: MdYoutubeSearchedFor,
            trend_analysis: MdTrendingUp
        };
        const Icon = icons[type] || MdSearch;
        return <Icon className="w-4 h-4" />;
    };

    const getTypeStyles = (type) => {
        const styles = {
            niche_analysis: 'bg-purple-100 text-purple-700 border-purple-200',
            youtube_scripts: 'bg-blue-100 text-blue-700 border-blue-200',
            trend_analysis: 'bg-green-100 text-green-700 border-green-200'
        };
        return styles[type] || 'bg-gray-100 text-gray-700 border-gray-200';
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
                                <h1 className="text-xl font-semibold text-gray-900">Research Hub</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Explore niches, trends, and script ideas with Google Search</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-6">
                    {/* Research Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Research Niche */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MdCategory className="text-purple-600" />
                                Niche Deep Dive
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Analyze top channels, popular formats, and opportunities.</p>
                            <div className="flex gap-3">
                                <select
                                    value={selectedNiche || ''}
                                    onChange={(e) => setSelectedNiche(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none"
                                >
                                    <option value="">Select a niche...</option>
                                    {niches.filter(n => n.status === 'active').map(niche => (
                                        <option key={niche.id} value={niche.id}>{niche.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => selectedNiche && researchNiche(selectedNiche)}
                                    disabled={!selectedNiche || loading}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? '...' : <MdSearch className="w-4 h-4" />}
                                    Research
                                </button>
                            </div>
                        </div>

                        {/* Research Scripts */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MdYoutubeSearchedFor className="text-blue-600" />
                                Script Ideas
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Find successful video topics and structures from YouTube.</p>
                            <form onSubmit={researchScripts} className="flex gap-3">
                                <input
                                    type="text"
                                    value={researchTopic}
                                    onChange={(e) => setResearchTopic(e.target.value)}
                                    placeholder="Enter topic (e.g., 'space mysteries')"
                                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!researchTopic.trim() || loading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? '...' : <MdSearch className="w-4 h-4" />}
                                    Find
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Research History */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <MdHistory className="text-gray-500 dark:text-gray-400" />
                                Research History
                            </h2>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['all', 'niche_analysis', 'youtube_scripts', 'trend_analysis'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${filterType === type
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                            }`}
                                    >
                                        {type.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {sessions.length === 0 ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                <MdSavedSearch className="w-12 h-12 text-gray-700 dark:text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No research sessions found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`bg-white rounded-lg border transition-all ${selectedSession?.id === session.id
                                                ? 'border-blue-200 ring-1 ring-blue-200 shadow-md'
                                                : 'border-gray-200 hover:shadow-sm'
                                            }`}
                                    >
                                        <div
                                            className="p-4 cursor-pointer flex items-center justify-between"
                                            onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`p-2 rounded-lg ${getTypeStyles(session.research_type)} border bg-opacity-50`}>
                                                    {getTypeIcon(session.research_type)}
                                                </span>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900">{session.topic}</h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                            {session.research_type.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400">•</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(session.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500">
                                                {selectedSession?.id === session.id ? <MdExpandLess className="w-6 h-6" /> : <MdExpandMore className="w-6 h-6" />}
                                            </button>
                                        </div>

                                        {selectedSession?.id === session.id && (
                                            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                                                <div className="mt-4">
                                                    {session.findings && typeof session.findings === 'object' ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {session.findings.top_channels?.length > 0 && (
                                                                <div className="bg-white p-3 rounded border border-gray-200">
                                                                    <p className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">Top Channels</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {session.findings.top_channels.map((ch, i) => (
                                                                            <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">{ch}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {session.findings.trending_topics?.length > 0 && (
                                                                <div className="bg-white p-3 rounded border border-gray-200">
                                                                    <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">Trending Topics</p>
                                                                    <ul className="space-y-1">
                                                                        {session.findings.trending_topics.map((t, i) => (
                                                                            <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                                                                <span className="text-green-500 mt-0.5">●</span> {t}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            <div className="md:col-span-2 bg-white p-3 rounded border border-gray-200">
                                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Full Data</p>
                                                                <pre className="text-xs text-gray-600 dark:text-gray-500 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded overflow-x-auto max-h-60">
                                                                    {JSON.stringify(session.findings, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <pre className="text-xs text-gray-600 dark:text-gray-500 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                                                            {JSON.stringify(session.findings, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
