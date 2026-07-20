"use client";

import { useState, useEffect } from 'react';
import {
    MdAttachMoney, MdSave, MdCheckCircle, MdWarning,
    MdVideoLibrary, MdRecordVoiceOver, MdHeadset,
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

const PLAN_STYLES = {
    Free: { ring: 'ring-gray-200', header: 'bg-white dark:bg-[#0a0a0a] border-white/5', dot: 'bg-gray-400' },
    Starter: { ring: 'ring-blue-200', header: 'bg-blue-500/10 border-blue-100', dot: 'bg-blue-500/100' },
    Pookie: { ring: 'ring-purple-200', header: 'bg-purple-50 border-purple-100', dot: 'bg-purple-500' },
    Pro: { ring: 'ring-red-200', header: 'bg-red-50 border-red-100', dot: 'bg-red-500' },
};

export default function AdminPricing() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [plans, setPlans] = useState([]);
    const [packs, setPacks] = useState([]);   // voice packs for dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState({ id: null, status: '' });
    const [activePlanTab, setActivePlanTab] = useState(null);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const adminData = JSON.parse(localStorage.getItem('user') || '{}');
    const authHeader = { Authorization: `Bearer ${adminData.token}` };

    useEffect(() => {
        fetchPlans();
        fetchPacks();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/pricing`, { headers: authHeader });
            const data = await res.json();
            if (data.success) {
                const fetchedPlans = data.plans || [];
                setPlans(fetchedPlans);
                if (fetchedPlans.length > 0) {
                    setActivePlanTab(fetchedPlans[0].id);
                }
            }
            else setError(data.message);
        } catch { setError('Failed to load subscription plans.'); }
        finally { setLoading(false); }
    };

    const fetchPacks = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/pricing/voice-packs`, { headers: authHeader });
            const data = await res.json();
            if (data.success) setPacks(data.packs || []);
        } catch { /* non-critical */ }
    };

    const handleChange = (id, field, value) =>
        setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

    const savePlan = async (plan) => {
        setSaveStatus({ id: plan.id, status: 'saving' });
        try {
            const res = await fetch(`${API_URL}/admin/pricing/${plan.id}`, {
                method: 'POST',
                headers: { ...authHeader, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price_naira: plan.price_naira,
                    price_dollar: plan.price_dollar,
                    duration_days: plan.duration_days,
                    max_scripts: plan.max_scripts,
                    max_images: plan.max_images,
                    max_audio: plan.max_audio,
                    max_videos: plan.max_videos ?? 0,
                    max_voiceovers: plan.max_voiceovers ?? 0,
                    affiliate_reward: plan.affiliate_reward ?? 0,
                    voice_pack_id: plan.voice_pack_id ?? null,
                    max_blog_to_script: plan.max_blog_to_script ?? 0,
                    max_story_to_script: plan.max_story_to_script ?? 0,
                    max_youtube_analyzer: plan.max_youtube_analyzer ?? 0,
                    max_siliconflow_images: plan.max_siliconflow_images ?? 0,
                    max_youtube_competitors: plan.max_youtube_competitors ?? 3,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSaveStatus({ id: plan.id, status: 'success' });
                setTimeout(() => setSaveStatus({ id: null, status: '' }), 2000);
            } else {
                setSaveStatus({ id: plan.id, status: 'error' });
                setError(data.message || 'Save failed.');
            }
        } catch {
            setSaveStatus({ id: plan.id, status: 'error' });
            setError('Network error. Try again.');
        }
    };

    // ── Reusable field ─────────────────────────────────────────────────────
    const Field = ({ label, icon: Icon, planId, field, value, placeholder, type = 'number' }) => (
        <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                {Icon && <Icon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-500 dark:text-gray-455" />}
                {label}
            </label>
            <input
                type={type}
                value={value ?? ''}
                onChange={e => handleChange(planId, field, e.target.value)}
                placeholder={placeholder || '999999 = unlimited'}
                className="w-full px-3 py-2 border border-gray-250 dark:border-white/5 rounded-xl focus:ring-1 focus:ring-red-400 focus:border-red-400 text-xs bg-gray-50 dark:bg-[#15151b] text-gray-900 dark:text-white transition-colors focus:outline-none"
            />
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
                <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading plan configurations...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">

                {/* Header */}
                <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pricing &amp; Limits Control</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Redesign &amp; monetize plans: Configure duration, pricing, generation limits, and specific feature quotas.
                        </p>
                    </div>
                </div>

                <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

                    {error && (
                        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <MdWarning className="flex-shrink-0 w-4 h-4" /> {error}
                        </div>
                    )}

                    {/* Plan Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-white/5 pb-4 overflow-x-auto">
                        {plans.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => setActivePlanTab(plan.id)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                                    activePlanTab === plan.id
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/15'
                                        : 'bg-white dark:bg-[#111111] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10'
                                }`}
                            >
                                {plan.name} Plan
                            </button>
                        ))}
                    </div>

                    {/* Active Plan Tab Configuration Pane */}
                    {(() => {
                        const plan = plans.find(p => p.id === activePlanTab);
                        if (!plan) return null;
                        const isFree = plan.name === 'Free';
                        const saving = saveStatus.id === plan.id && saveStatus.status === 'saving';
                        const success = saveStatus.id === plan.id && saveStatus.status === 'success';

                        return (
                            <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl animate-in fade-in duration-300">
                                {/* Header banner */}
                                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-red-600/5 to-purple-600/5">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-650 animate-pulse" />
                                        <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">{plan.name} Plan Settings</h2>
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-gray-450 dark:text-gray-400">PLAN ID: {plan.id}</span>
                                </div>

                                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Column 1: Pricing & Info */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">Plan Setup & Info</h3>
                                        <Field label="Duration (Days)" planId={plan.id} field="duration_days" value={plan.duration_days} placeholder="e.g. 30" />
                                        
                                        {!isFree && (
                                            <>
                                                <Field label="Price (₦ Naira)" icon={MdAttachMoney} planId={plan.id} field="price_naira" value={plan.price_naira} />
                                                <Field label="Price ($ USD)" icon={MdAttachMoney} planId={plan.id} field="price_dollar" value={plan.price_dollar} />
                                                
                                                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-4">
                                                    <Field label="Affiliate Referral Reward (₦)" icon={MdAttachMoney} planId={plan.id} field="affiliate_reward" value={plan.affiliate_reward} placeholder="Referrer reward..." />
                                                    <p className="text-[10.5px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Referrer earns this flat reward when a user upgrades/subscribes to this plan.</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Column 2: Core Generation Limits */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">Creation Quotas</h3>
                                        <Field label="Max Scripts" planId={plan.id} field="max_scripts" value={plan.max_scripts} />
                                        <Field label="Max Images (All Providers)" planId={plan.id} field="max_images" value={plan.max_images} />
                                        <Field label="Max Audio Renders" planId={plan.id} field="max_audio" value={plan.max_audio} />
                                    </div>

                                    {/* Column 3: Premium Feature Quotas */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">Premium Features</h3>
                                        <Field label="Max Videos" icon={MdVideoLibrary} planId={plan.id} field="max_videos" value={plan.max_videos ?? 0} placeholder="0 = disabled" />
                                        <Field label="Max ElevenLabs Voiceovers" icon={MdRecordVoiceOver} planId={plan.id} field="max_voiceovers" value={plan.max_voiceovers ?? 0} placeholder="0 = disabled" />
                                        
                                        <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-4">
                                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Monetized Add-ons (0 = locked)</h4>
                                            <Field label="Max Blog to Script conversions" planId={plan.id} field="max_blog_to_script" value={plan.max_blog_to_script ?? 0} placeholder="0 = locked" />
                                            <Field label="Max Story to Script conversions" planId={plan.id} field="max_story_to_script" value={plan.max_story_to_script ?? 0} placeholder="0 = locked" />
                                            <Field label="Max YouTube channel audits" planId={plan.id} field="max_youtube_analyzer" value={plan.max_youtube_analyzer ?? 0} placeholder="0 = locked" />
                                            <Field label="Max SiliconFlow images" planId={plan.id} field="max_siliconflow_images" value={plan.max_siliconflow_images ?? 0} placeholder="0 = locked" />
                                            <Field label="Max YouTube competitors" planId={plan.id} field="max_youtube_competitors" value={plan.max_youtube_competitors ?? 3} placeholder="e.g. 3" />
                                        </div>

                                        {/* Voice Pack Dropdown */}
                                        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                                            <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                                <MdHeadset className="w-4 h-4 text-gray-650" />
                                                SiliconFlow Voice Pack
                                            </label>
                                            <select
                                                value={plan.voice_pack_id ?? ''}
                                                onChange={e => handleChange(plan.id, 'voice_pack_id', e.target.value || null)}
                                                className="w-full px-3 py-2 border border-gray-250 dark:border-white/5 rounded-xl text-xs bg-gray-50 dark:bg-[#15151b] focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors text-gray-900 dark:text-white focus:outline-none"
                                            >
                                                <option value="">— No premium voices —</option>
                                                {packs.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            {plan.voice_pack_id ? (
                                                <p className="text-[10px] text-emerald-500 mt-1.5 font-semibold uppercase tracking-wider">
                                                    ✓ SiliconFlow voices from: {plan.voice_pack_name || `Pack ${plan.voice_pack_id}`}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-gray-500 mt-1.5 font-medium">
                                                    Users on this plan are limited to Edge TTS voices.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Save Button */}
                                <div className="p-6 bg-gray-50 dark:bg-[#0d0d12] border-t border-gray-200 dark:border-white/5 flex justify-end">
                                    <button
                                        onClick={() => savePlan(plan)}
                                        disabled={saving}
                                        className={`px-8 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all min-w-[220px] shadow-lg ${
                                            success
                                                ? 'bg-emerald-600 text-gray-900 dark:text-white shadow-emerald-600/15'
                                                : 'bg-red-650 hover:bg-red-700 text-white disabled:opacity-50 shadow-red-600/15'
                                        }`}
                                    >
                                        {saving && <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Saving...</span></>}
                                        {success && <><MdCheckCircle className="w-4 h-4" /><span>Saved Config!</span></>}
                                        {!saving && !success && <><MdSave className="w-4 h-4" /><span>Save {plan.name} Settings</span></>}
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}