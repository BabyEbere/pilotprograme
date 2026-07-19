"use client";

import { useState, useEffect } from 'react';
import {
    MdAttachMoney, MdSave, MdCheckCircle, MdWarning,
    MdVideoLibrary, MdRecordVoiceOver, MdHeadset,
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

const PLAN_STYLES = {
    Free: { ring: 'ring-gray-200', header: 'bg-white dark:bg-[#0a0a0a]   border-white/5', dot: 'bg-gray-400' },
    Starter: { ring: 'ring-blue-200', header: 'bg-blue-500/10   border-blue-100', dot: 'bg-blue-500/100' },
    Pookie: { ring: 'ring-purple-200', header: 'bg-purple-50 border-purple-100', dot: 'bg-purple-500' },
    Pro: { ring: 'ring-red-200', header: 'bg-red-50    border-red-100', dot: 'bg-red-500' },
};

export default function AdminPricing() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [plans, setPlans] = useState([]);
    const [packs, setPacks] = useState([]);   // voice packs for dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState({ id: null, status: '' });

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
            if (data.success) setPlans(data.plans || []);
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
            <label className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {Icon && <Icon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-500 dark:text-gray-400" />}
                {label}
            </label>
            <input
                type={type}
                value={value ?? ''}
                onChange={e => handleChange(planId, field, e.target.value)}
                placeholder={placeholder || '999999 = unlimited'}
                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-red-400 focus:border-red-400 text-sm bg-gray-50 dark:bg-[#111111] transition-colors"
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
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">

                {/* Header */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pricing &amp; Limits Control</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Configure plan pricing, generation limits, video quotas, premium voiceover counts, and voice pack assignments.
                        </p>
                    </div>
                </div>

                <div className="p-4 sm:p-6 max-w-7xl mx-auto">

                    {error && (
                        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                            <MdWarning className="flex-shrink-0" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        {plans.map(plan => {
                            const style = PLAN_STYLES[plan.name] || PLAN_STYLES.Free;
                            const isFree = plan.name === 'Free';
                            const saving = saveStatus.id === plan.id && saveStatus.status === 'saving';
                            const success = saveStatus.id === plan.id && saveStatus.status === 'success';

                            return (
                                <div
                                    key={plan.id}
                                    className={`bg-gray-50 dark:bg-[#111111] rounded-2xl shadow-sm ring-1 ${style.ring} overflow-hidden flex flex-col`}
                                >
                                    {/* Card header */}
                                    <div className={`p-4 border-b ${style.header} flex items-center justify-center gap-2`}>
                                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">{plan.name} Plan</h2>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 flex-1 space-y-4">

                                        {/* Pricing & Affiliate — hidden for Free */}
                                        {!isFree && (
                                            <div className="flex flex-col gap-3">
                                                <Field label="Price (₦)" icon={MdAttachMoney} planId={plan.id} field="price_naira" value={plan.price_naira} />
                                                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl relative">
                                                    <div className="absolute top-2 right-2 flex space-x-1">
                                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                                                    </div>
                                                    <Field label="Affiliate Referral Reward (₦)" icon={MdAttachMoney} planId={plan.id} field="affiliate_reward" value={plan.affiliate_reward} placeholder="Amount referrer gets..." />
                                                    <p className="text-[10.5px] text-gray-700 dark:text-gray-300 mt-2 font-medium ml-1">If a user buys this plan, their referrer earns this amount.</p>
                                                </div>
                                            </div>
                                        )}

                                        <Field label="Duration (Days)" planId={plan.id} field="duration_days" value={plan.duration_days} placeholder="e.g. 30" />

                                        {/* Generation limits */}
                                        <div>
                                            <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Generation Limits</p>
                                            <div className="space-y-3">
                                                <Field label="Max Scripts" planId={plan.id} field="max_scripts" value={plan.max_scripts} />
                                                <Field label="Max Images" planId={plan.id} field="max_images" value={plan.max_images} />
                                                <Field label="Max Audio Renders" planId={plan.id} field="max_audio" value={plan.max_audio} />
                                            </div>
                                        </div>

                                        {/* Premium features */}
                                        <div>
                                            <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Premium Features</p>
                                            <div className="space-y-3">
                                                <Field
                                                    label="Max Videos"
                                                    icon={MdVideoLibrary}
                                                    planId={plan.id}
                                                    field="max_videos"
                                                    value={plan.max_videos ?? 0}
                                                    placeholder="0 = disabled"
                                                />
                                                <Field
                                                    label="Max Premium Voiceovers"
                                                    icon={MdRecordVoiceOver}
                                                    planId={plan.id}
                                                    field="max_voiceovers"
                                                    value={plan.max_voiceovers ?? 0}
                                                    placeholder="0 = disabled"
                                                />

                                                {/* Voice Pack dropdown */}
                                                <div>
                                                    <label className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                        <MdHeadset className="w-3.5 h-3.5 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                                                        Voice Pack
                                                    </label>
                                                    <select
                                                        value={plan.voice_pack_id ?? ''}
                                                        onChange={e => handleChange(plan.id, 'voice_pack_id', e.target.value || null)}
                                                        className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-gray-50 dark:bg-[#111111] focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors"
                                                    >
                                                        <option value="">— No premium voices —</option>
                                                        {packs.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                    {plan.voice_pack_id ? (
                                                        <p className="text-[10px] text-emerald-500 mt-1">
                                                            ✓ Users on this plan get SiliconFlow voices from <strong>{plan.voice_pack_name || `Pack ${plan.voice_pack_id}`}</strong>
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-1">
                                                            Users on this plan use Edge TTS only
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-white/5">
                                        <button
                                            onClick={() => savePlan(plan)}
                                            disabled={saving}
                                            className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${success
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-gray-900 dark:text-white'
                                                    : 'bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50'
                                                }`}
                                        >
                                            {saving && <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Saving...</span></>}
                                            {success && <><MdCheckCircle className="w-4 h-4" /><span>Saved!</span></>}
                                            {!saving && !success && <><MdSave className="w-4 h-4" /><span>Save Configuration</span></>}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}