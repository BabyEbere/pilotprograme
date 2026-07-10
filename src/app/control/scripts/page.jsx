"use client";

import { useState, useEffect } from 'react';
import { 
    MdSearch, 
    MdFilterList, 
    MdDescription, 
    MdPeople, 
    MdCheckCircle, 
    MdAudiotrack, 
    MdPlayArrow, 
    MdPause,
    MdOpenInNew,
    MdFormatQuote,
    MdMovie,
    MdArrowForward,
    MdBarChart,
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminScripts() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [scripts, setScripts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedScript, setSelectedScript] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Search, Filter and Audio state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [playingAudio, setPlayingAudio] = useState(null);
    const [audioElement, setAudioElement] = useState(null);
    const [storyLabStats, setStoryLabStats] = useState(null);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000');

    // Fetch all scripts and stats
    const fetchScripts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/scripts?is_admin=true`);
            const data = await response.json();

            if (data.success) {
                setScripts(data.scripts || []);
                setStats(data.stats || null);
            }
        } catch (error) {
            console.error('Error fetching scripts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScripts();
        // Fetch Story Lab stats from dashboard endpoint
        fetch(`${API_URL}/admin/dashboard/stats`)
            .then(r => r.json())
            .then(d => { if (d.success) setStoryLabStats(d.stats?.story_lab || null); })
            .catch(() => {});
        
        // Clean up playing audio on unmount
        return () => {
            if (audioElement) {
                audioElement.pause();
            }
        };
    }, []);

    // Clean up audio when a new one starts
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
            }
        };
    }, [playingAudio]);

    const viewScript = (script) => {
        setSelectedScript(script);
        setShowModal(true);
    };

    // Toggle Play/Pause for Audio
    const toggleAudio = (url) => {
        if (playingAudio === url) {
            if (audioElement) {
                audioElement.pause();
            }
            setPlayingAudio(null);
        } else {
            if (audioElement) {
                audioElement.pause();
            }
            const audio = new Audio(url);
            audio.play().catch(err => console.error("Audio playback error:", err));
            audio.onended = () => {
                setPlayingAudio(null);
            };
            setAudioElement(audio);
            setPlayingAudio(url);
        }
    };

    // Client-side search and status filter
    const filteredScripts = scripts.filter((script) => {
        const matchesQuery = 
            (script.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (script.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (script.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (script.niche_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (script.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesStatus = statusFilter === 'all' || script.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    const totalScriptsCount = stats?.total_scripts || 0;
    const totalCreatorsCount = stats?.total_creators || 0;
    const totalAudiosCount = stats?.total_audios || 0;
    
    // Success rate calculation
    const completedCount = stats?.status_breakdown?.completed || 0;
    const successRate = totalScriptsCount > 0 ? Math.round((completedCount / totalScriptsCount) * 100) : 0;

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Scripts Control Panel</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monitor and analyze user scripts, niche performance, and voiceovers</p>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search scripts by title, user name, email, niche or prompt..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 font-medium">Status:</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-red-600 focus:border-transparent focus:outline-none"
                                >
                                    <option value="all">All Scripts</option>
                                    <option value="completed">Completed</option>
                                    <option value="generating">Generating</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Analytics Section */}
                {!loading && stats && (
                    <div className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-6 pt-6">
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                    <MdDescription className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Scripts</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalScriptsCount}</h3>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <MdPeople className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Creators</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalCreatorsCount}</h3>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                    <MdCheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Success Rate</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{successRate}%</h3>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <MdAudiotrack className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Voiceovers Made</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalAudiosCount}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Story Lab Overview Panel */}
                        {storyLabStats && (
                            <div className="mx-4 sm:mx-6 mt-4 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/60 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <MdMovie className="w-4 h-4 text-rose-500" />
                                        Story Lab Overview
                                    </h3>
                                    <a href="/control/story-lab" className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                                        Open Story Lab <MdArrowForward className="w-3 h-3" />
                                    </a>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-gray-200/50 dark:bg-white/80 rounded-lg p-3 text-center border border-rose-100">
                                        <p className="text-xl font-bold text-rose-600">{storyLabStats.stories || 0}</p>
                                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Stories</p>
                                    </div>
                                    <div className="bg-gray-200/50 dark:bg-white/80 rounded-lg p-3 text-center border border-amber-100">
                                        <p className="text-xl font-bold text-amber-600">{storyLabStats.scripts || 0}</p>
                                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Movie Scripts</p>
                                    </div>
                                    <div className="bg-gray-200/50 dark:bg-white/80 rounded-lg p-3 text-center border border-cyan-100">
                                        <p className="text-xl font-bold text-cyan-600">{storyLabStats.blogs || 0}</p>
                                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Blog Scripts</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Niches and Active Users */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 sm:px-6">
                            {/* Niche Share Breakdown */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Niche Distribution</h2>
                                <div className="space-y-4">
                                    {stats.popular_niches && stats.popular_niches.length > 0 ? (
                                        stats.popular_niches.map((niche, idx) => {
                                            const pct = totalScriptsCount > 0 ? Math.round((niche.count / totalScriptsCount) * 100) : 0;
                                            return (
                                                <div key={idx} className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-xs font-medium">
                                                        <span className="text-gray-700">{niche.name}</span>
                                                        <span className="text-gray-900 font-bold">{niche.count} scripts ({pct}%)</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="bg-red-600 h-full rounded-full transition-all duration-500" 
                                                            style={{ width: `${pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No niche distribution data available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Active Users Leaderboard */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Top Active Creators</h2>
                                <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto">
                                    {stats.active_users && stats.active_users.length > 0 ? (
                                        stats.active_users.map((u, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-2.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 bg-red-100 text-red-600 font-bold rounded-full flex items-center justify-center text-xs">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{u.name}</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{u.email}</p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded">
                                                    {u.count} scripts
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No active user data available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scripts Table */}
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading scripts data...</p>
                        </div>
                    ) : filteredScripts.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No scripts match the search query and filters.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title / Prompt</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Niche</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Audios</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {filteredScripts.map((script) => (
                                            <tr key={script.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-900">{script.user_name || 'Anonymous'}</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{script.user_email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 max-w-xs">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-900 truncate" title={script.title}>{script.title}</p>
                                                        <p className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 italic" title={script.description}>
                                                            "{script.description || 'No description prompt specified'}"
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold">
                                                        {script.niche_name || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-gray-900 font-medium">
                                                    {script.duration} min
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        script.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                        script.status === 'generating' ? 'bg-yellow-50 text-yellow-700 animate-pulse' :
                                                        'bg-red-50 text-red-700'
                                                    }`}>
                                                        {script.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {script.audios && script.audios.length > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleAudio(script.audios[0].url)}
                                                                className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${
                                                                    playingAudio === script.audios[0].url ? 'bg-red-600 text-gray-900 dark:text-white shadow-sm' : 'bg-gray-100 text-gray-600 dark:text-gray-500 hover:bg-gray-200'
                                                                }`}
                                                                title={`Play voiceover: ${script.audios[0].voice_name}`}
                                                            >
                                                                {playingAudio === script.audios[0].url ? <MdPause className="w-3.5 h-3.5" /> : <MdPlayArrow className="w-3.5 h-3.5" />}
                                                            </button>
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                                                                {script.audios.length} {script.audios.length === 1 ? 'audio' : 'audios'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400">None</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-[10px] text-gray-500 dark:text-gray-400">
                                                    {new Date(script.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <button
                                                        onClick={() => viewScript(script)}
                                                        className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
                                                    >
                                                        Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Script Modal */}
            {showModal && selectedScript && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all border border-gray-100">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{selectedScript.title}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        by <strong className="text-gray-700">{selectedScript.user_name}</strong> ({selectedScript.user_email}) • <span className="text-red-600 font-semibold">{selectedScript.niche_name}</span> • {selectedScript.duration} minutes
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500 p-1.5 hover:bg-gray-50 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* User Description / Prompt */}
                            <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-xl flex gap-3">
                                <MdFormatQuote className="w-8 h-8 text-red-400 flex-shrink-0 transform rotate-180" />
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">User Generation Prompt</h4>
                                    <p className="text-xs text-gray-700 italic leading-relaxed">"{selectedScript.description || 'No prompt descriptions specified.'}"</p>
                                </div>
                            </div>

                            {/* Generated Audios Section */}
                            {selectedScript.audios && selectedScript.audios.length > 0 && (
                                <div className="mb-6 p-4 bg-red-50/50 border border-red-100/50 rounded-xl">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-800 mb-3 flex items-center gap-1">
                                        <MdAudiotrack className="w-4 h-4" /> Generated Voiceovers ({selectedScript.audios.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedScript.audios.map((audio) => (
                                            <div key={audio.id} className="p-3 bg-white border border-red-100 rounded-lg flex items-center justify-between shadow-sm">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-900">{audio.voice_name}</p>
                                                    <p className="text-[9px] text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-0.5">{new Date(audio.created_at).toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleAudio(audio.url)}
                                                        className={`p-2 rounded-full transition-colors text-gray-900 dark:text-white ${
                                                            playingAudio === audio.url ? 'bg-red-700' : 'bg-red-600 hover:bg-red-700 shadow-sm'
                                                        }`}
                                                        title="Play/Pause Voiceover"
                                                    >
                                                        {playingAudio === audio.url ? <MdPause className="w-4 h-4" /> : <MdPlayArrow className="w-4 h-4" />}
                                                    </button>
                                                    <a
                                                        href={audio.url}
                                                        download
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 bg-gray-50 text-gray-600 dark:text-gray-500 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
                                                        title="Download voice file"
                                                    >
                                                        <MdOpenInNew className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Script Content / Scenes */}
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Script Scenes</h4>
                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                                {selectedScript.content && selectedScript.content.scenes ? (
                                    selectedScript.content.scenes.map((scene, index) => (
                                        <div key={index} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-all duration-300">
                                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">
                                                        Scene {scene.scene_number}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{scene.timestamp}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                        scene.type === 'intro' ? 'bg-blue-50 text-blue-700' :
                                                        scene.type === 'outro' ? 'bg-green-50 text-green-700' :
                                                        'bg-purple-50 text-purple-700'
                                                    }`}>
                                                        {scene.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-700 font-normal leading-relaxed whitespace-pre-line mb-3">{scene.narration}</p>
                                            {scene.visual_suggestions && (
                                                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                    <p className="text-[11px] text-gray-600 dark:text-gray-500 leading-normal">
                                                        <strong className="text-gray-900 font-semibold">B-Roll Suggestion:</strong> {scene.visual_suggestions}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-xs">No script content has been generated for this script record.</p>
                                )}
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
