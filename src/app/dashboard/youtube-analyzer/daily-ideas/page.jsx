"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Youtube, Star, Trash2, ArrowLeft, RefreshCw, Sparkles, BookOpen, AlertCircle, ChevronRight, ChevronDown, Flame
} from 'lucide-react';
import Loader from '@/components/Loader';

function BookmarkedIdeasContent() {
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [expandedIdea, setExpandedIdea] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [toastMsg, setToastMsg] = useState('');
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

    const fetchFavorites = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/favorite-ideas/${user.id}`);
            const json = await res.json();
            if (json.success) {
                setFavorites(json.favorites || []);
            } else {
                setError(json.message || 'Failed to fetch saved ideas.');
            }
        } catch {
            setError('Could not connect to bookmarked database.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFavorite = async (ideaId) => {
        if (!confirm('Are you sure you want to remove this idea from favorites?')) return;
        
        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/youtube-analyzer/favorite-ideas/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, idea_id: ideaId })
            });
            const json = await res.json();
            if (json.success) {
                setFavorites(prev => prev.filter(f => f.id !== ideaId));
                setToastMsg('Idea removed from favorites.');
                setTimeout(() => setToastMsg(''), 2000);
            } else {
                alert(json.message || 'Failed to delete favorite.');
            }
        } catch {
            alert('Network error. Try again.');
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader message="Loading Bookmarked Ideas..." />
            </div>
        );
    }

    return (
        <div className="space-y-6 relative text-white">
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#101014] border border-red-500/30 text-red-400 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-bottom-5 duration-200">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    {toastMsg}
                </div>
            )}

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="flex items-center gap-3.5 z-10">
                    <button
                        onClick={() => router.push('/dashboard/youtube-analyzer/content')}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/5 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-base font-black text-white leading-tight uppercase tracking-tight">Favorite Content Ideas</h2>
                        <p className="text-[10px] text-gray-400 mt-0.5">Manage saved outlines and launch drafts inside the script writer</p>
                    </div>
                </div>
                
                <button
                    onClick={fetchFavorites}
                    className="self-start sm:self-auto p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-white/5"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reload Bookmarks
                </button>
            </div>

            {/* Favorites List */}
            {error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/25 text-red-500 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            ) : favorites.length > 0 ? (
                <div className="space-y-4">
                    {favorites.map((idea) => {
                        const isExpanded = expandedIdea === idea.id;
                        const diffColor = idea.difficulty === 'Easy' 
                            ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                            : idea.difficulty === 'Hard' 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

                        return (
                            <div 
                                key={idea.id} 
                                className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4 shadow-sm transition-all hover:bg-white/[0.07]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div 
                                        onClick={() => setExpandedIdea(isExpanded ? null : idea.id)}
                                        className="flex-1 space-y-1.5 cursor-pointer select-none"
                                    >
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${diffColor}`}>
                                                {idea.difficulty || 'Medium'}
                                            </span>
                                            <span className="text-[10px] font-black text-emerald-400">
                                                {idea.prediction_score}% success
                                            </span>
                                            <span className="text-[9px] text-gray-500 font-medium">
                                                Saved {new Date(idea.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5 leading-snug">
                                            {formatTextWithBold(idea.title)}
                                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </h4>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteFavorite(idea.id)}
                                        disabled={actionLoading}
                                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-450 hover:text-red-400 border border-red-500/20 rounded-xl transition-all disabled:opacity-50 cursor-pointer flex-shrink-0"
                                        title="Remove Bookmark"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Expanded detail view */}
                                {isExpanded && (
                                    <div className="pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 text-xs">
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1 bg-[#111115] border border-white/5 p-4 rounded-xl">
                                                <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1">
                                                    <BookOpen className="w-3.5 h-3.5" /> Core Concept
                                                </p>
                                                <p className="text-gray-300 leading-relaxed">
                                                    {formatTextWithBold(idea.core_concept || idea.description)}
                                                </p>
                                            </div>
                                            <div className="space-y-1 bg-[#111115] border border-white/5 p-4 rounded-xl">
                                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                                                    <Flame className="w-3.5 h-3.5" /> Hook Strategy
                                                </p>
                                                <p className="text-gray-300 leading-relaxed font-medium">
                                                    {formatTextWithBold(idea.hook_strategy || "Start with an optimized pattern interrupt.")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Video outline steps */}
                                        <div className="space-y-1 bg-[#111115] border border-white/5 p-4 rounded-xl">
                                            <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Video Outline Steps</p>
                                            <div className="space-y-2 pt-2">
                                                {idea.video_outline && idea.video_outline.length > 0 ? (
                                                    idea.video_outline.map((step, idx) => (
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

                                        {/* Tags and Description */}
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Suggested Search Description Hook</p>
                                            <p className="text-gray-300 leading-relaxed bg-[#111115] p-3.5 rounded-xl border border-white/5">
                                                {formatTextWithBold(idea.suggested_description || "Search hook targeting indexing rankings.")}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">Suggested Search Tags</p>
                                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                                                {idea.suggested_tags?.map((tag, idx) => (
                                                    <span key={idx} className="bg-[#111115] border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-semibold text-gray-300">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                                            <button
                                                onClick={() => router.push(`/dashboard/scriptwriter?template_title=${encodeURIComponent(idea.title)}`)}
                                                className="bg-red-650 hover:bg-red-750 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Generate Script outline
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-400 border border-white/5">
                        <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-white uppercase tracking-wider">No Bookmarks Saved</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Visit your YouTube Analyzer dashboard and click "Add to Favorites" on your Daily Content Suggestions to bookmark video outlines.
                        </p>
                    </div>
                </div>
            )}

            {actionLoading && <Loader message="Updating bookmarks..." fullScreen={true} />}
        </div>
    );
}

export default function BookmarkedIdeas() {
    return (
        <Suspense fallback={<div className="p-6 text-xs font-bold text-white">Loading Bookmarks...</div>}>
            <BookmarkedIdeasContent />
        </Suspense>
    );
}
