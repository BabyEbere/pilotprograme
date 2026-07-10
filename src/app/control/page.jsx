"use client";

import { useState, useEffect } from 'react';
import {
    MdPeople, MdDescription, MdImage, MdAudiotrack,
    MdCategory, MdTrendingUp, MdAttachMoney, MdWarning,
    MdCheckCircle, MdBlock, MdSchedule, MdRefresh,
    MdCreditCard, MdBarChart, MdRecordVoiceOver,
    MdMovie, MdArrowForward,
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function fmt(n) { return (n ?? 0).toLocaleString(); }

function MiniBar({ value, max, color = 'bg-indigo-500' }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
    );
}

function StatCard({ icon: Icon, label, value, sub, iconColor, iconBg, border = 'border-gray-200 dark:border-white/10' }) {
    return (
        <div className={`bg-gray-50 dark:bg-[#111111] rounded-xl p-4 border ${border} flex flex-col gap-2`}>
            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                {sub && <p className="text-[11px] text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            {children}
        </h2>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000');
    const adminData = JSON.parse(localStorage.getItem('user') || '{}');
    const headers = { Authorization: `Bearer ${adminData.token}` };

    const fetchStats = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/admin/dashboard/stats`, { headers });
            const json = await res.json();
            if (json.success) setData(json);
            else setError(json.message || 'Failed to load stats.');
        } catch {
            setError('Network error — could not load admin stats.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Admin Control | AI Studio';
        fetchStats();
    }, []);

    const p = data?.stats?.platform || {};
    const c = data?.stats?.content || {};
    const r = data?.stats?.revenue || {};
    const pb = data?.plans_breakdown || [];
    const expiring = data?.expiring_soon || [];
    const activity = data?.recent_activity || [];
    const topNiches = data?.topNiches || [];
    const subTrend = data?.sub_trend || [];

    const maxNicheAssets = Math.max(...topNiches.map(n => n.assets || 0), 1);
    const maxPlanSubs = Math.max(...pb.map(x => x.total_subscribers || 0), 1);
    const subHistory = [...subTrend].slice(0, 12);
    const sl = data?.stats?.story_lab || {};
    const slRecent = data?.story_lab_recent || [];

    if (loading) {
        return (
            <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
                <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400">Loading admin stats…</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">

                {/* Header */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Platform overview · revenue · subscriptions · content</p>
                        </div>
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:bg-white dark:bg-[#0a0a0a] transition-colors disabled:opacity-50"
                        >
                            <MdRefresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
                        <MdWarning className="flex-shrink-0" /> {error}
                    </div>
                )}

                <div className="p-6 space-y-8 max-w-7xl mx-auto">

                    {/* ── Users ── */}
                    <section>
                        <SectionTitle>Users</SectionTitle>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <StatCard icon={MdPeople} label="Total Users" value={fmt(p.users)} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
                            <StatCard icon={MdCheckCircle} label="Active" value={fmt(p.active_users)} iconColor="text-green-600" iconBg="bg-green-50" />
                            <StatCard icon={MdCreditCard} label="Paid Now" value={fmt(p.paid_users)} iconColor="text-violet-600" iconBg="bg-violet-50" border="border-violet-100" sub="active subscriptions" />
                            <StatCard icon={MdTrendingUp} label="New Subs (30d)" value={fmt(p.new_subs_30d)} iconColor="text-red-500" iconBg="bg-red-500/10" />
                            <StatCard icon={MdWarning} label="Suspended" value={fmt(p.suspended_users)} iconColor="text-amber-500" iconBg="bg-amber-500/10" />
                            <StatCard icon={MdBlock} label="Banned" value={fmt(p.banned_users)} iconColor="text-red-600" iconBg="bg-red-50" />
                        </div>
                    </section>

                    {/* ── Content & Revenue ── */}
                    <section>
                        <SectionTitle>Content & Revenue</SectionTitle>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            <StatCard icon={MdDescription} label="Scripts" value={fmt(c.scripts)} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
                            <StatCard icon={MdRecordVoiceOver} label="Audio Files" value={fmt(c.audio)} iconColor="text-green-600" iconBg="bg-green-50" />
                            <StatCard icon={MdImage} label="Images" value={fmt(c.images)} iconColor="text-purple-600" iconBg="bg-purple-50" />
                            <StatCard
                                icon={MdAttachMoney}
                                label="Revenue (NGN)"
                                value={`₦${fmt(Math.round(r.ngn || 0))}`}
                                sub="All time · Paystack"
                                iconColor="text-emerald-500"
                                iconBg="bg-emerald-500/10"
                                border="border-emerald-100"
                            />
                        </div>
                    </section>

                    {/* ── Story Lab Analytics ── */}
                    <section>
                        <SectionTitle>Story Lab</SectionTitle>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard icon={MdMovie} label="Stories" value={fmt(sl.stories)} iconColor="text-rose-400" iconBg="bg-rose-500/10" />
                            <StatCard icon={MdDescription} label="Movie Scripts" value={fmt(sl.scripts)} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
                            <StatCard icon={MdBarChart} label="Blog Ingestions" value={fmt(sl.blogs)} iconColor="text-cyan-400" iconBg="bg-cyan-500/10" />
                            <StatCard icon={MdTrendingUp} label="Total Items" value={fmt(sl.total)} iconColor="text-violet-400" iconBg="bg-violet-500/10" sub="all story lab assets" />
                        </div>
                        {slRecent.length > 0 && (
                            <div className="mt-4 bg-gray-50 dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Recent Story Lab Items</span>
                                    <a href="/control/story-lab" className="text-[10px] text-red-400 font-bold hover:underline flex items-center gap-1">
                                        Open Story Lab <MdArrowForward className="w-3 h-3" />
                                    </a>
                                </div>
                                <div className="space-y-1.5">
                                    {slRecent.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white dark:bg-[#0a0a0a] transition-colors">
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                    item.type === 'story' ? 'bg-rose-500' :
                                                    item.type === 'script' ? 'bg-amber-500' : 'bg-cyan-500'
                                                }`} />
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{item.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                                    item.type === 'story' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                    item.type === 'script' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                }`}>{item.type}</span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400">{timeAgo(item.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ── Plans breakdown + Expiring soon ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <section className="bg-gray-50 dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 p-5">
                            <SectionTitle>Plans Breakdown</SectionTitle>
                            {pb.length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 text-center py-8">No subscription data yet.</p>
                            ) : (
                                <div className="space-y-5">
                                    {pb.map((plan) => (
                                        <div key={plan.plan_name}>
                                            <div className="flex items-start justify-between mb-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-bold text-gray-200">{plan.plan_name}</span>
                                                    <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                                                        {plan.active_subscribers} active
                                                    </span>
                                                    {plan.expired_subscribers > 0 && (
                                                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-white/5 px-1.5 py-0.5 rounded-full">
                                                            {plan.expired_subscribers} expired
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">₦{fmt(plan.price_naira)}</p>
                                                    <p className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400">{fmt(plan.total_subscribers)} total</p>
                                                </div>
                                            </div>
                                            <MiniBar value={plan.total_subscribers} max={maxPlanSubs} color="bg-violet-400" />
                                            <p className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-1">
                                                Revenue: ₦{fmt(Math.round(plan.total_revenue))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="bg-gray-50 dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 p-5">
                            <SectionTitle>
                                Expiring Soon
                                {expiring.length > 0 && (
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-200 px-2 py-0.5 rounded-full normal-case tracking-normal">
                                        {expiring.length} in next 7 days
                                    </span>
                                )}
                            </SectionTitle>
                            {expiring.length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 text-center py-8">No subscriptions expiring in the next 7 days.</p>
                            ) : (
                                <div className="space-y-2">
                                    {expiring.map((row, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-100 rounded-lg">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-200 truncate">{row.full_name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.email}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-3">
                                                <p className="text-xs font-bold text-amber-300">{row.plan_name}</p>
                                                <p className="text-[11px] text-amber-500 flex items-center gap-1 justify-end">
                                                    <MdSchedule className="w-3 h-3" />
                                                    {row.days_left <= 0 ? 'Today' : `${row.days_left}d left`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ── Sub history + Top niches ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <section className="bg-gray-50 dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 p-5">
                            <SectionTitle>Subscription History (Last 30 Days)</SectionTitle>
                            {subHistory.length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 text-center py-8">No subscription activity in the last 30 days.</p>
                            ) : (
                                <div className="overflow-hidden rounded-lg border border-white/5">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-white dark:bg-[#0a0a0a] border-b border-white/5">
                                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Plan</th>
                                                <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Count</th>
                                                <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {subHistory.map((row, i) => (
                                                <tr key={i} className="hover:bg-white dark:bg-[#0a0a0a] transition-colors">
                                                    <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-mono">{row.date}</td>
                                                    <td className="px-3 py-2 text-xs font-semibold text-gray-200">{row.plan_name}</td>
                                                    <td className="px-3 py-2 text-center text-xs font-bold text-gray-700 dark:text-gray-300">{row.count}</td>
                                                    <td className="px-3 py-2 text-right text-xs font-semibold text-emerald-300">
                                                        {row.currency === 'USD'
                                                            ? `$${fmt(Math.round(row.revenue || 0))}`
                                                            : `₦${fmt(Math.round(row.revenue || 0))}`}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section className="bg-gray-50 dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 p-5">
                            <SectionTitle>Top Niches by Total Assets</SectionTitle>
                            {topNiches.length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 text-center py-8">No niche data available.</p>
                            ) : (
                                <div className="space-y-4">
                                    {topNiches.map((niche, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="w-5 h-5 rounded bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-200 truncate">{niche.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                    <span>{niche.scripts}s</span>
                                                    <span>{niche.audios}a</span>
                                                    <span>{niche.images}i</span>
                                                    <span className="font-bold text-gray-600 dark:text-gray-500 dark:text-gray-400">{fmt(niche.assets)}</span>
                                                </div>
                                            </div>
                                            <MiniBar value={niche.assets} max={maxNicheAssets} color="bg-indigo-400" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ── Recent activity ── */}
                    <section className="bg-gray-50 dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 p-5">
                        <SectionTitle>Recent Activity</SectionTitle>
                        {activity.length === 0 ? (
                            <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 text-center py-6">No recent activity.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                {activity.map((a, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:bg-[#0a0a0a] transition-colors">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === 'subscription' ? 'bg-violet-500' : 'bg-blue-400'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-200 truncate">{a.user}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.action}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${a.type === 'subscription'
                                                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                                                    : 'bg-blue-500/10 text-blue-300 border-blue-200'
                                                }`}>
                                                {a.type}
                                            </span>
                                            <span className="text-[11px] text-gray-600 dark:text-gray-500 dark:text-gray-400">{timeAgo(a.time)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    );
}