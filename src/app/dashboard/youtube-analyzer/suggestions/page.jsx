"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Trash2, Calendar, RefreshCw, Flame, Award, Lightbulb, Compass, ArrowUpRight } from 'lucide-react';
import Loader from '@/components/Loader';

export default function DailySuggestionsPage() {
    const [activeTab, setActiveTab] = useState('daily'); // daily | favorites
    const [loading, setLoading] = useState(true);
    const [ideasLoading, setIdeasLoading] = useState(false);
    
    const [dailyIdeas, setDailyIdeas] = useState([]);
    const [favoriteIdeas, setFavoriteIdeas] = useState([]);
    const [savedIdeasMap, setSavedIdeasMap] = useState({});
    const [toastMsg, setToastMsg] = useState('');

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('user') || '{}') : '{}');

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

    const fetchFavorites = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/favorite-ideas/${user.id}`);
            const json = await res.json();
            if (json.success) {
                setFavoriteIdeas(json.favorites || []);
                
                // Keep the bookmarked check map in sync
                const map = {};
                (json.favorites || []).forEach(fav => {
                    map[fav.title] = fav.id; // store database row ID
                });
                setSavedIdeasMap(map);
            }
        } catch (e) {
            console.error("Failed to load favorite ideas", e);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchDailyIdeas(), fetchFavorites()]);
        setLoading(false);
    };

    const handleSaveIdea = async (idea) => {
        if (savedIdeasMap[idea.title]) return;
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
                setToastMsg('Concept added to Favorites!');
                setTimeout(() => setToastMsg(''), 3000);
                await fetchFavorites();
            } else {
                alert(json.message || 'Could not save idea.');
            }
        } catch (e) {
            alert('Failed to connect to bookmarks manager.');
        }
    };

    const handleDeleteFavorite = async (favId) => {
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/favorite-ideas/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    idea_id: favId
                })
            });
            const json = await res.json();
            if (json.success) {
                setToastMsg('Idea removed from Favorites.');
                setTimeout(() => setToastMsg(''), 3000);
                await fetchFavorites();
            } else {
                alert(json.message || 'Failed to remove favorite.');
            }
        } catch (e) {
            alert('Failed to connect to bookmarks manager.');
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

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

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader message="Loading daily content drafts..." />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 relative text-white">
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#0d0d12] border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-bottom-5 duration-200">
                    <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    {toastMsg}
                </div>
            )}

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Content Strategy Hub</h2>
                    <p className="text-[10px] text-gray-400 mt-0.5">High potential video concept ideas based on your target niche</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadAll}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-305 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-white/5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh Suggestions
                    </button>
                </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-white/5 pb-0.5">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`px-6 py-3 font-black text-xs uppercase tracking-wider transition-all border-b-2 ${
                        activeTab === 'daily' 
                            ? 'border-red-500 text-red-500 font-black' 
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    Daily Recommendations
                </button>
                <button
                    onClick={() => setActiveTab('favorites')}
                    className={`px-6 py-3 font-black text-xs uppercase tracking-wider transition-all border-b-2 ${
                        activeTab === 'favorites' 
                            ? 'border-red-500 text-red-500 font-black' 
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    My Favorites ({favoriteIdeas.length})
                </button>
            </div>

            {/* Recommendations Content */}
            {activeTab === 'daily' ? (
                ideasLoading ? (
                    <div className="text-center py-12 text-xs text-gray-500">Generating suggestions...</div>
                ) : dailyIdeas.length === 0 ? (
                    <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-12 text-center text-xs text-gray-400">
                        No suggestions compiled today. Click Refresh to regenerate.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {dailyIdeas.map((idea, idx) => {
                            const isSaved = !!savedIdeasMap[idea.title];
                            const diffColor = idea.difficulty === 'Easy' 
                                ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                                : idea.difficulty === 'Hard' 
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

                            return (
                                <div key={idx} className="bg-[#0f0f13] border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden group">
                                    <div className="space-y-3.5">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${diffColor}`}>
                                                {idea.difficulty || 'Medium'}
                                            </span>
                                            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                                <span className="px-1.5 py-0.5 bg-emerald-500/10 rounded font-mono font-black text-[9px]">{idea.predicted_ctr || 85}</span>
                                                success score
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-gray-200 leading-relaxed">
                                            {formatTextWithBold(idea.title)}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-4">
                                            {formatTextWithBold(idea.description)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleSaveIdea(idea)}
                                        disabled={isSaved}
                                        className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            isSaved 
                                                ? 'bg-emerald-600/15 border-emerald-500/30 text-emerald-400 cursor-default' 
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
                )
            ) : (
                favoriteIdeas.length === 0 ? (
                    <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-12 text-center text-xs text-gray-500 italic">
                        No favorited suggestions yet. Click "Add to Favorites" on suggestions to bookmark them here.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {favoriteIdeas.map((fav, idx) => {
                            const diffColor = fav.difficulty === 'Easy' 
                                ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                                : fav.difficulty === 'Hard' 
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

                            return (
                                <div key={idx} className="bg-[#0f0f13] border border-white/5 rounded-2xl p-5 space-y-4 relative overflow-hidden group">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${diffColor}`}>
                                            {fav.difficulty || 'Medium'}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                                <span className="px-1.5 py-0.5 bg-emerald-500/10 rounded font-mono font-black text-[9px]">{fav.prediction_score || 85}</span>
                                                CTR Score
                                            </span>
                                            <button
                                                onClick={() => handleDeleteFavorite(fav.id)}
                                                className="p-1 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all border border-white/5"
                                                title="Remove Favorite"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-gray-200 leading-relaxed">
                                            {formatTextWithBold(fav.title)}
                                        </h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            {formatTextWithBold(fav.description)}
                                        </p>
                                    </div>

                                    {fav.core_concept && (
                                        <div className="bg-[#14141a] p-3 rounded-xl border border-white/5 text-[11px] text-gray-400 space-y-1">
                                            <p className="font-bold text-gray-300 uppercase tracking-widest text-[9px]">Concept Hook</p>
                                            <p className="leading-relaxed">{fav.core_concept}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
}
