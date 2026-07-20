"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
    MdDescription, MdRecordVoiceOver, MdImage, MdFolderOpen,
    MdTrendingUp, MdAdd, MdArrowForward, MdCheckCircle,
    MdSchedule, MdAutoAwesome, MdBarChart, MdPlayArrow,
    MdWarning, MdStar, MdRefresh,
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function UsageBar({ used, max, color = 'bg-indigo-500', label, icon: Icon, sublabel }) {
    const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
    const left = max > 0 ? max - used : 0;
    const warn = pct >= 80;
    const full = pct >= 100;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${full ? 'text-red-400' : warn ? 'text-amber-400' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-200">{label}</span>
                    {full && <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">EXHAUSTED</span>}
                    {warn && !full && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-200 px-1.5 py-0.5 rounded-full">LOW</span>}
                </div>
                <span className={`text-xs font-mono font-bold ${full ? 'text-red-500' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400'}`}>
                    {used} / {max === 0 ? '∞' : max}
                </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${full ? 'bg-red-400' : warn ? 'bg-amber-400' : color}`}
                    style={{ width: max === 0 ? '0%' : `${pct}%` }}
                />
            </div>
            {sublabel && (
                <p className="text-[11px] text-gray-600 dark:text-gray-500 dark:text-gray-400">{sublabel(left, used, max)}</p>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
    return (
        <div className={`rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#111111] p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-0.5">{value}</div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</div>
            {sub && <div className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">{sub}</div>}
        </div>
    );
}

function ScriptRow({ script, onClick }) {
    const statusIcon = script.status === 'completed'
        ? <MdCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        : script.status === 'failed'
            ? <MdWarning className="w-3.5 h-3.5 text-red-400" />
            : <MdSchedule className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white dark:bg-[#0a0a0a] rounded-xl transition-colors text-left group"
        >
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MdDescription className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-red-500 transition-colors">
                    {script.title || 'Untitled Script'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    {script.niche_name && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded-full">{script.niche_name}</span>
                    )}
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">{script.duration}min</span>
                    {script.audio_count > 0 && (
                        <span className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                            <MdPlayArrow className="w-3 h-3" />{script.audio_count} audio
                        </span>
                    )}
                    {script.image_count > 0 && (
                        <span className="text-[10px] text-purple-600 flex items-center gap-0.5">
                            <MdImage className="w-3 h-3" />{script.image_count} img
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {statusIcon}
                <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">{timeAgo(script.created_at)}</span>
                <MdArrowForward className="w-3.5 h-3.5 text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-gray-300 group-hover:text-red-500 transition-colors" />
            </div>
        </button>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const router = useRouter();

    // ── HELPER: Prevent Mixed-Content Browser Block ──
    const getSecureUrl = (url) => {
        if (!url) return '';
        if (window.location.protocol === 'https:' && url.startsWith('http://')) {
            if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
                return url.replace('http://', 'https://');
            }
        }
        return url;
    };

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchSummary = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/dashboard/summary?user_id=${user.id}`);
            const json = await res.json();
            if (json.success) {
                setData(json);
            } else {
                setError(json.message || 'Failed to load dashboard.');
            }
        } catch (e) {
            setError('Network error — could not load dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSummary(); }, []);

    const sub = data?.subscription;
    const totals = data?.totals || {};
    const scripts = data?.recent_scripts || [];
    const audios = data?.recent_audios || [];
    const images = data?.recent_images || [];

    // Days left on plan
    const daysLeft = sub?.expires_at
        ? Math.max(0, Math.ceil((new Date(sub.expires_at) - Date.now()) / 86400000))
        : null;

    const isPaid = sub?.plan_name && sub.plan_name !== 'Free';
    const planColor = isPaid ? 'from-indigo-600 to-violet-600' : 'from-gray-700 to-gray-900';

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">

                {/* ── Header ── */}
                <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/5 sticky top-0 z-10 transition-colors">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                                {loading ? 'Dashboard' : `Welcome back${sub?.user_name ? `, ${sub.user_name.split(' ')[0]}` : ''} 👋`}
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">Here's what's happening with your projects</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchSummary}
                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-200 dark:bg-white/5 transition-colors"
                                title="Refresh"
                            >
                                <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/scripts')}
                                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-[#1a1a1a] dark:hover:bg-[#252525] text-gray-900 dark:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                            >
                                <MdAdd className="w-4 h-4" /> New Script
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
                        <MdWarning className="flex-shrink-0" /> {error}
                    </div>
                )}

                <div className="p-6 space-y-6 max-w-7xl mx-auto">

                    {/* ── Plan banner ── */}
                    {loading ? (
                        <div className="h-24 rounded-2xl bg-gray-200/50 dark:bg-white/10 animate-pulse" />
                    ) : (
                        <div className={`bg-gradient-to-r ${planColor} rounded-2xl p-5 text-gray-900 dark:text-white shadow-lg`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 dark:bg-[#111111]/20 rounded-xl flex items-center justify-center">
                                        <MdStar className="w-5 h-5 text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg">{sub?.plan_name || 'Free'} Plan</span>
                                            {isPaid && daysLeft !== null && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${daysLeft <= 7 ? 'bg-red-400/80' : 'bg-gray-50 dark:bg-[#111111]/20'}`}>
                                                    {daysLeft}d left
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-900 dark:text-white/70 mt-0.5">
                                            {isPaid
                                                ? `${sub.max_scripts - sub.used_scripts} scripts · ${sub.max_audio - sub.used_audio} audio · ${sub.max_voiceovers - sub.used_voiceovers} premium voiceovers remaining`
                                                : `${(sub?.max_scripts || 2) - (sub?.used_scripts || 0)} scripts and ${(sub?.max_audio || 2) - (sub?.used_audio || 0)} audio remaining`
                                            }
                                        </p>
                                    </div>
                                </div>
                                {!isPaid && (
                                    <button
                                        onClick={() => router.push('/dashboard/plans')}
                                        className="flex-shrink-0 bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white dark:bg-[#0a0a0a] transition-colors shadow-sm"
                                    >
                                        Upgrade →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Stat cards ── */}
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 rounded-2xl bg-gray-200/50 dark:bg-white/10 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard icon={MdDescription} label="Scripts" value={totals.total_scripts || 0} color="text-red-500" bg="bg-red-500/10" sub={`${sub?.used_scripts || 0} this period`} />
                            <StatCard icon={MdRecordVoiceOver} label="Audios" value={totals.total_audios || 0} color="text-emerald-500" bg="bg-emerald-500/10" sub={`${sub?.used_audio || 0} this period`} />
                            <StatCard icon={MdImage} label="Images" value={totals.total_images || 0} color="text-purple-600" bg="bg-purple-500/10" sub={`${sub?.used_images || 0} this period`} />
                            <StatCard icon={MdFolderOpen} label="Projects" value={totals.total_scripts || 0} color="text-orange-600" bg="bg-orange-500/10" sub="total scripts" />
                        </div>
                    )}

                    {/* ── YouTube Integration Section ── */}
                    {!loading && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-red-500">
                                        <path d="M23.498 6.163c-.272-1.022-1.074-1.824-2.096-2.097C19.548 3.5 12 3.5 12 3.5s-7.548 0-9.402.566C1.576 4.34 0.774 5.14 0.5 6.163 0 8.02 0 12 0 12s0 3.98.5 5.837c.272 1.022 1.074 1.824 2.096 2.097C4.452 20.5 12 20.5 12 20.5s7.548 0 9.402-.566c1.022-.273 1.824-1.075 2.097-2.097.5-1.856.5-5.837.5-5.837s0-3.98-.5-5.837zm-13.7 9.387V8.45l6.4 3.55-6.4 3.55z" />
                                    </svg>
                                    YouTube Channels
                                </h2>
                                <button
                                    onClick={() => router.push('/dashboard/settings')}
                                    className="text-xs text-red-500 font-bold hover:underline uppercase tracking-wider"
                                >
                                    Manage Links
                                </button>
                            </div>

                            {data?.youtube_channels && data.youtube_channels.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.youtube_channels.map((chan) => (
                                        <div
                                            key={chan.channel_id}
                                            className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 p-5 shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-3.5 mb-4 border-b border-gray-100 dark:border-white/5 pb-3">
                                                {chan.thumbnail ? (
                                                    <img
                                                        src={chan.thumbnail}
                                                        alt={chan.title}
                                                        className="w-11 h-11 rounded-xl border border-emerald-500/20 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 font-bold">
                                                        YT
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[180px]">
                                                        {chan.title}
                                                    </h3>
                                                    <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                        Active Integration
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">
                                                        {Number(chan.subscribers).toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                                                        Subs
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">
                                                        {Number(chan.videos).toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                                                        Videos
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">
                                                        {Number(chan.views).toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                                                        Views
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-red-950/20 via-black to-[#0d0d11] border border-red-500/10 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-[-20%] left-[-10%] w-[200px] h-[200px] bg-red-600/5 rounded-full blur-[80px] pointer-events-none"></div>
                                    <div className="space-y-1 z-10">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Scale your audience on YouTube
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                                            Link your YouTube channel to access direct video publishing, automated description templates, and growth analytics trackers instantly from your dashboard.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => router.push('/dashboard/settings')}
                                        className="flex-shrink-0 z-10 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md self-start md:self-auto uppercase tracking-wider cursor-pointer"
                                    >
                                        Link YouTube Channel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Main grid: usage + recent scripts ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* Usage */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MdBarChart className="w-4 h-4 text-red-400" /> Usage
                               </h2>
                                {!isPaid && (
                                    <button onClick={() => router.push('/dashboard/plans')} className="text-xs text-red-500 font-semibold hover:underline">
                                        Upgrade
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <UsageBar
                                        icon={MdDescription} label="Scripts"
                                        used={sub?.used_scripts || 0} max={sub?.max_scripts || 2}
                                        color="bg-indigo-500"
                                        sublabel={(left, used, max) => left > 0 ? `${left} remaining` : 'Limit reached — upgrade to generate more'}
                                    />
                                    <UsageBar
                                        icon={MdRecordVoiceOver} label="Audio (Edge/Gemini)"
                                        used={sub?.used_audio || 0} max={sub?.max_audio || 2}
                                        color="bg-emerald-500/100"
                                        sublabel={(left) => left > 0 ? `${left} remaining` : 'Limit reached'}
                                    />
                                    <UsageBar
                                        icon={MdAutoAwesome} label="Premium Voiceovers"
                                        used={sub?.used_voiceovers || 0} max={sub?.max_voiceovers || 0}
                                        color="bg-violet-500"
                                        sublabel={(left, used, max) =>
                                            max === 0 ? 'Not included in current plan' :
                                                left > 0 ? `${left} remaining · extra scenes are free` : 'Quota used'
                                        }
                                    />
                                    <UsageBar
                                        icon={MdImage} label="Images"
                                        used={sub?.used_images || 0} max={sub?.max_images || 0}
                                        color="bg-purple-500"
                                        sublabel={(left, used, max) =>
                                            max === 0
                                                ? (sub?.used_audio > 0 ? 'Unlimited — generate freely' : 'Generate audio first to unlock')
                                                : left > 0 ? `${left} remaining` : 'Limit reached'
                                        }
                                    />
                                    <UsageBar
                                        icon={MdAutoAwesome} label="Blog to Script"
                                        used={sub?.used_blog_to_script || 0} max={sub?.max_blog_to_script || 0}
                                        color="bg-red-500"
                                        sublabel={(left, used, max) => max === 0 ? 'Locked on current plan' : left > 0 ? `${left} remaining` : 'Limit reached'}
                                    />
                                    <UsageBar
                                        icon={MdTrendingUp} label="YouTube Channel Audits"
                                        used={sub?.used_youtube_analyzer || 0} max={sub?.max_youtube_analyzer || 0}
                                        color="bg-blue-500"
                                        sublabel={(left, used, max) => max === 0 ? 'Locked on current plan' : left > 0 ? `${left} remaining` : 'Limit reached'}
                                    />
                                    <UsageBar
                                        icon={MdImage} label="SiliconFlow Images"
                                        used={sub?.used_siliconflow_images || 0} max={sub?.max_siliconflow_images || 0}
                                        color="bg-amber-500"
                                        sublabel={(left, used, max) => max === 0 ? 'Locked on current plan' : left > 0 ? `${left} remaining` : 'Limit reached'}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Recent scripts */}
                        <div className="lg:col-span-3 bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MdTrendingUp className="w-4 h-4 text-red-400" /> Recent Scripts
                                </h2>
                                <button
                                    onClick={() => router.push('/dashboard/scripts')}
                                    className="text-xs text-red-500 font-semibold hover:underline flex items-center gap-1"
                                >
                                    View all <MdArrowForward className="w-3 h-3" />
                                </button>
                            </div>

                            {loading ? (
                                <div className="space-y-2">
                                    {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : scripts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-3">
                                        <MdDescription className="w-7 h-7 text-indigo-300" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No scripts yet</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-4">Create your first AI-powered script</p>
                                    <button
                                        onClick={() => router.push('/dashboard/scripts')}
                                        className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 mx-auto"
                                    >
                                        <MdAdd className="w-3.5 h-3.5" /> Create Script
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {scripts.map(s => (
                                        <ScriptRow
                                            key={s.id}
                                            script={s}
                                            onClick={() => router.push('/dashboard/scripts')}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Recent audios + recent images ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Recent audios */}
                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MdRecordVoiceOver className="w-4 h-4 text-emerald-500" /> Recent Audio
                                </h2>
                                <button onClick={() => router.push('/dashboard/audio')} className="text-xs text-emerald-500 font-semibold hover:underline flex items-center gap-1">
                                    View all <MdArrowForward className="w-3 h-3" />
                                </button>
                            </div>

                            {loading ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : audios.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3">
                                        <MdRecordVoiceOver className="w-6 h-6 text-emerald-300" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No audio yet</p>
                                    <p className="text-xs text-gray-555 dark:text-gray-400">Generate audio from any script</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {audios.map(a => (
                                        <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-transparent">
                                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <MdPlayArrow className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-300 truncate">{a.script_title || 'Untitled'}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">{a.voice_name} · {a.provider}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-550 dark:text-gray-400 flex-shrink-0">{timeAgo(a.created_at)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent images */}
                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MdImage className="w-4 h-4 text-purple-500" /> Recent Images
                                </h2>
                                <button onClick={() => router.push('/dashboard/images')} className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1">
                                    View all <MdArrowForward className="w-3 h-3" />
                                </button>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : images.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-3">
                                        <MdImage className="w-6 h-6 text-purple-300" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No images yet</p>
                                    <p className="text-xs text-gray-555 dark:text-gray-400">
                                        {(sub?.used_audio || 0) === 0
                                            ? 'Generate audio first to unlock images'
                                            : 'Generate images from script scenes'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {images.map(img => (
                                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-transparent group cursor-pointer">
                                            <img
                                                src={getSecureUrl(img.image_url)}
                                                alt={img.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-gray-200 dark:bg-black/30 transition-colors rounded-xl flex items-end p-1.5 opacity-0 group-hover:opacity-100">
                                                <p className="text-[9px] text-gray-900 dark:text-white font-semibold line-clamp-2 leading-tight">{img.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Getting started (only shown when no scripts) ── */}
                    {!loading && scripts.length === 0 && (
                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MdAutoAwesome className="w-4 h-4 text-amber-500" /> Getting Started
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { step: 1, title: 'Create a Script', desc: 'Use AI to generate a full YouTube script with scenes', color: 'bg-red-500/5 dark:bg-red-500/10 border-red-100 dark:border-red-950/20', num: 'bg-red-600', action: () => router.push('/dashboard/scripts') },
                                    { step: 2, title: 'Generate Audio', desc: 'Convert your script to professional narration using Edge TTS or premium SiliconFlow voices', color: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-950/20', num: 'bg-emerald-600', action: () => router.push('/dashboard/audio') },
                                    { step: 3, title: 'Create Images', desc: 'Generate AI images for each scene in your script', color: 'bg-purple-500/5 border-purple-100 dark:border-purple-950/20', num: 'bg-purple-600', action: () => router.push('/dashboard/images') },
                                ].map(({ step, title, desc, color, num, action }) => (
                                    <button
                                        key={step}
                                        onClick={action}
                                        className={`text-left p-4 rounded-xl border ${color} hover:shadow-md transition-all group`}
                                    >
                                        <div className={`w-7 h-7 ${num} text-gray-900 dark:text-white rounded-full flex items-center justify-center text-xs font-bold mb-3`}>
                                            {step}
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:underline">{title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 leading-relaxed">{desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}