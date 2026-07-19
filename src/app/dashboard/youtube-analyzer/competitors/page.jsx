"use client";

import React, { useState, useEffect } from 'react';
import { 
    Users, Plus, Trash2, ArrowUpRight, Award, AlertCircle, Info, RefreshCw, BarChart2, Youtube
} from 'lucide-react';
import Loader from '@/components/Loader';

export default function CompetitorsTracker() {
    const [loading, setLoading] = useState(true);
    const [competitors, setCompetitors] = useState([]);
    const [userChannel, setUserChannel] = useState(null);
    const [query, setQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('user') || '{}') : '{}');

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // 1. Fetch competitors
            const compRes = await fetch(`${API_URL}/youtube-analyzer/competitors/${user.id}`);
            const compData = await compRes.json();
            
            // 2. Fetch user's channel summary
            const summaryRes = await fetch(`${API_URL}/dashboard/summary?user_id=${user.id}`);
            const summaryData = await summaryRes.json();

            if (compData.success) setCompetitors(compData.competitors || []);
            if (summaryData.success && summaryData.youtube_channels) {
                setUserChannel(summaryData.youtube_channels[0] || null);
            }
        } catch (e) {
            console.error(e);
            showMessage('Connection error while fetching statistics.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddCompetitor = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/competitors/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, query: query.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                showMessage(data.message, 'success');
                setQuery('');
                fetchData();
            } else {
                showMessage(data.message || 'Failed to add competitor.', 'error');
            }
        } catch {
            showMessage('Network error. Try again.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCompetitor = async (channelId) => {
        if (!confirm('Are you sure you want to stop tracking this competitor?')) return;
        
        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/competitors/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, channel_id: channelId }),
            });
            const data = await res.json();
            if (data.success) {
                showMessage(data.message, 'success');
                fetchData();
            } else {
                showMessage(data.message || 'Failed to stop tracking.', 'error');
            }
        } catch {
            showMessage('Network error.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader message="Fetching competitor profiles..." />
            </div>
        );
    }

    if (!userChannel) {
        return (
            <div className="max-w-xl mx-auto my-12 text-center space-y-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold uppercase tracking-wider text-white">Channel Link Required</h2>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    You must first connect your own YouTube channel in settings to enable searches and link competitor metrics.
                </p>
                <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="mt-2 bg-red-600 hover:bg-red-750 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                    Link Channel
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Action panel */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-[-50%] left-[-20%] w-[350px] h-[350px] bg-red-600/5 rounded-full blur-[90px] pointer-events-none"></div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Track new Competitor</h2>
                <p className="text-xs text-gray-400 mb-4 max-w-lg leading-relaxed">
                    Add any competitor channel using their handle (e.g. <span className="text-red-500 font-semibold">@MrBeast</span>) or direct YouTube Channel URL.
                </p>

                {message.text && (
                    <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2 border ${
                        message.type === 'error' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleAddCompetitor} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter channel link or @handle..."
                        required
                        disabled={actionLoading}
                        className="flex-1 px-4 py-3 bg-[#111115] border border-white/5 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-transparent text-sm text-white"
                    />
                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="bg-red-600 hover:bg-red-750 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Add Competitor
                    </button>
                </form>
            </div>

            {/* Competitor Delta Analytics */}
            {competitors.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Benchmarking</h3>
                    <div className="space-y-3">
                        {competitors.map((comp) => {
                            const subDelta = comp.subscribers - userChannel.subscribers;
                            const isAhead = subDelta > 0;
                            return (
                                <div key={comp.channel_id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {comp.thumbnail ? (
                                            <img src={comp.thumbnail} alt={comp.title} className="w-11 h-11 rounded-xl object-cover border border-white/10" />
                                        ) : (
                                            <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-white font-bold">YT</div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{comp.title}</h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5">
                                                {Number(comp.subscribers).toLocaleString()} subs • {comp.videos} videos • {Number(comp.views).toLocaleString()} views
                                            </p>
                                        </div>
                                    </div>

                                    {/* Delta Indicators */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Subscriber Delta</span>
                                            <span className={`text-xs font-bold ${isAhead ? 'text-red-500' : 'text-emerald-400'}`}>
                                                {isAhead 
                                                    ? `-${Number(subDelta).toLocaleString()} to catch up` 
                                                    : `+${Number(Math.abs(subDelta)).toLocaleString()} ahead`}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCompetitor(comp.channel_id)}
                                            disabled={actionLoading}
                                            className="p-2.5 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 border border-transparent hover:border-red-500/10 rounded-xl transition-all disabled:opacity-50"
                                            title="Stop tracking"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Zero state tracked competitors */}
            {competitors.length === 0 && (
                <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-white uppercase tracking-wider">No Competitors Tracked</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            You are not tracking any competitors yet. Add competitor channels above to start benchmarking your growth deltas.
                        </p>
                    </div>
                </div>
            )}

            {/* Global Loader Overlay */}
            {actionLoading && <Loader message="Updating statistics..." fullScreen={true} />}
        </div>
    );
}
