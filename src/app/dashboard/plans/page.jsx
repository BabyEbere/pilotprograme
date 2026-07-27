"use client";

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
    MdCheck, MdClose, MdStar, MdLock,
    MdRocketLaunch, MdDiamond, MdAutoAwesome, MdWarning,
    MdArrowForward, MdVerified, MdCreditCard, MdRefresh,
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';
import { useNotification } from '@/context/NotificationContext';

// ── Plan config ───────────────────────────────────────────────────────────────

const PLAN_META = {
    Free: { Icon: MdAutoAwesome, gradient: 'from-gray-400 to-gray-500', ring: 'ring-gray-200', badge: null, popular: false },
    Starter: { Icon: MdRocketLaunch, gradient: 'from-blue-500 to-indigo-500', ring: 'ring-blue-200', badge: null, popular: false },
    Pookie: { Icon: MdStar, gradient: 'from-purple-500 to-violet-600', ring: 'ring-purple-300', badge: 'Most Popular', popular: true },
    Pro: { Icon: MdDiamond, gradient: 'from-rose-500 to-orange-500', ring: 'ring-rose-200', badge: 'Best Value', popular: false },
};

const FEATURE_LABELS = {
    max_scripts: 'Script Generations',
    max_audio: 'Audio Renders',
    max_voiceovers: 'Premium Voiceovers',
    max_images: 'Image Generations',
    max_videos: 'Video Generations',
    max_blog_to_script: 'Blog to Script',
    max_story_to_script: 'Story to Script',
    max_youtube_analyzer: 'YouTube Channel Audits',
    max_siliconflow_images: 'SiliconFlow Images',
    max_youtube_competitors: 'YouTube Competitors',
};

function formatLimit(val) {
    const n = parseInt(val);
    if (!n || n === 0) return null;
    if (n >= 999999) return 'Unlimited';
    return n.toLocaleString();
}

// ── Global overlay loader ─────────────────────────────────────────────────────

function GlobalLoader({ message }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white dark:bg-[#111111] rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-2xl max-w-sm w-full mx-4 border border-gray-200 dark:border-white/5 transition-colors">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-white/5" />
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">Please don't close this page</p>
                </div>
            </div>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

function PlansContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { showToast } = useNotification();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNigerian, setIsNigerian] = useState(false);
    const [processingPlanId, setProcessingPlanId] = useState(null);

    const [globalLoading, setGlobalLoading] = useState(false);
    const [globalMessage, setGlobalMessage] = useState('');

    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState('');

    const wasExpired = typeof window !== 'undefined' && window.history?.state?.expired === true;
    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

    // ── Geolocation (Disabled — NGN Only) ────────────────────────────────────
    useEffect(() => {
        setIsNigerian(true); // Always NGN
    }, []);

    // ── Load data ─────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const [pr, sr] = await Promise.all([
                    fetch(`${API_URL}/plans`),
                    fetch(`${API_URL}/plans/my-subscription?user_id=${user.id}`),
                ]);
                const pd = await pr.json();
                const sd = await sr.json();
                if (pd.success) setPlans(pd.plans);
                if (sd.success) setSubscription(sd.subscription);
            } catch { /* ignore */ }
            finally { setLoading(false); }
        })();
    }, []);

    // ── Paystack return ───────────────────────────────────────────────────────
    useEffect(() => {
        const status = searchParams.get('status');
        const ref = searchParams.get('ref');
        const provider = searchParams.get('provider');
        const session_id = searchParams.get('session_id');

        if (status === 'success' && ref) {
            window.history.replaceState({}, document.title, '/dashboard/plans');
            if (provider === 'stripe' && session_id) {
                verifyStripe(session_id, ref);
            } else {
                verifyPaystack(ref);
            }
        }
    }, [searchParams]);

    const activateSubscription = async (verifyFn) => {
        setGlobalLoading(true);
        setGlobalMessage('Verifying your payment…');
        try {
            const data = await verifyFn();
            if (data.success) {
                setPaymentStatus('success');
                setPaymentMessage(data.message);
                const sr = await fetch(`${API_URL}/plans/my-subscription?user_id=${user.id}`);
                const sd = await sr.json();
                if (sd.success) setSubscription(sd.subscription);
                localStorage.setItem('sub_status', 'active');
            } else {
                setPaymentStatus('failed');
                setPaymentMessage(data.message || 'Verification failed.');
            }
        } catch {
            setPaymentStatus('failed');
            setPaymentMessage('Network error during verification.');
        } finally {
            setGlobalLoading(false);
        }
    };

    const verifyPaystack = (reference) => activateSubscription(async () => {
        const res = await fetch(`${API_URL}/plans/paystack/verify`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference }),
        });
        return res.json();
    });

    const verifyStripe = (session_id, reference) => {
        console.warn('Stripe verification called but Stripe is disabled');
    };

    // ── Checkout ──────────────────────────────────────────────────────────────
    const handleChoosePlan = async (plan) => {
        if (plan.name === 'Free' || subscription?.plan_name === plan.name) return;

        setProcessingPlanId(plan.id);
        setGlobalLoading(true);
        setGlobalMessage(`Preparing ${plan.name} checkout…`);

        try {
            // Always use Paystack (NGN)
            const endpoint = `${API_URL}/plans/paystack/initialize`;
            
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    plan_id: plan.id,
                    email: user.email,
                    currency: 'NGN',
                }),
            });
            const data = await res.json();

            if (data.success && data.authorization_url) {
                setGlobalMessage('Redirecting to secure payment…');
                window.location.href = data.authorization_url;
            } else {
                setGlobalLoading(false);
                showToast('Could not start payment: ' + (data.message || 'Unknown error'), 'error');
            }
        } catch {
            setGlobalLoading(false);
            showToast('Network error. Please try again.', 'error');
        } finally {
            setProcessingPlanId(null);
        }
    };

    const isCurrentPlan = (plan) => subscription?.plan_name === plan.name;
    const currency = isNigerian ? '₦' : '$';
    const processor = isNigerian ? 'Paystack' : 'Stripe';

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a]">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <div className="flex-1 p-6 space-y-4">
                    <div className="h-12 w-64 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-[480px] rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {globalLoading && <GlobalLoader message={globalMessage} />}

            <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

                <div className="flex-1 overflow-y-auto">

                    {/* ── Header ── */}
                    <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10 transition-colors">
                        <div className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                                    <MdCreditCard className="w-3.5 h-3.5" />
                                    Prices in Nigerian Naira (NGN) · Paystack
                                </p>
                            </div>
                            {subscription?.plan_name && subscription.plan_name !== 'Free' && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-semibold">
                                    <MdVerified className="w-3.5 h-3.5" />
                                    {subscription.plan_name} · Active
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-8 max-w-6xl mx-auto">

                        {/* ── Expired banner ── */}
                        {wasExpired && (
                            <div className="mb-6 p-4 bg-amber-55/10 dark:bg-amber-500/10 border border-amber-250 dark:border-amber-500/30 rounded-xl flex items-start gap-3">
                                <MdWarning className="w-5 h-5 text-amber-600 dark:text-amber-550 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Your subscription has expired</p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                        Renew below to continue — all your scripts, audio, and images are saved and waiting.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Payment success ── */}
                        {paymentStatus === 'success' && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MdCheck className="w-5 h-5 text-gray-900 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-green-800">Payment Confirmed</p>
                                    <p className="text-xs text-green-600 mt-0.5">{paymentMessage}</p>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-gray-900 dark:text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    Go to Dashboard <MdArrowForward className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* ── Payment failed ── */}
                        {paymentStatus === 'failed' && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MdClose className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-red-800">Payment Failed</p>
                                    <p className="text-xs text-red-600 mt-0.5">{paymentMessage}</p>
                                </div>
                                <button onClick={() => setPaymentStatus(null)} className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-650 p-1">
                                    <MdClose className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* ── Section heading ── */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose your plan</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Paid via {processor} · Cancel anytime · Data preserved across all plan changes
                            </p>
                        </div>

                        {/* ── Plans grid ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {plans.map((plan) => {
                                const meta = PLAN_META[plan.name] || PLAN_META['Free'];
                                const { Icon } = meta;
                                const isCurrent = isCurrentPlan(plan);
                                const isFree = plan.name === 'Free';
                                const price = isNigerian ? plan.price_naira : plan.price_dollar;

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative flex flex-col rounded-2xl bg-white dark:bg-[#111111] border-2 overflow-hidden transition-all duration-200
                                            ${isCurrent
                                                ? `${meta.ring} ring-2 shadow-lg`
                                                : meta.popular
                                                    ? 'border-purple-400 shadow-xl'
                                                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md'
                                            }`}
                                    >
                                        {/* Badge */}
                                        {(meta.badge || isCurrent) && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide ${isCurrent
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700'
                                                        : `bg-gradient-to-r ${meta.gradient} text-gray-900 dark:text-white`
                                                    }`}>
                                                    {isCurrent ? '✓ Active' : meta.badge}
                                                </span>
                                            </div>
                                        )}

                                        {/* Gradient header */}
                                        <div className={`bg-gradient-to-br ${meta.gradient} p-6`}>
                                            <div className="w-10 h-10 bg-black/20 dark:bg-white/10 rounded-xl flex items-center justify-center mb-4">
                                                <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
                                            </div>
                                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{plan.name}</h3>
                                            <div className="mt-3">
                                                {isFree ? (
                                                    <span className="text-3xl font-black text-gray-900 dark:text-white">Free</span>
                                                ) : (
                                                    <div className="flex items-end gap-1">
                                                        <span className="text-3xl font-black text-gray-900 dark:text-white">
                                                            {currency}{Number(price).toLocaleString()}
                                                        </span>
                                                        <span className="text-gray-900/70 dark:text-white/70 text-xs mb-1.5">/{plan.duration_days} days</span>
                                                    </div>
                                                )}
                                            </div>
                                            {!isFree && (
                                                <p className="text-gray-900/70 dark:text-white/70 text-[11px] mt-1 font-medium">
                                                    Billed via {processor}
                                                </p>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <div className="flex-1 flex flex-col p-5 bg-gray-50/50 dark:bg-[#0d0d0d]">
                                            {/* Core Features */}
                                            <div className="mb-4">
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Core Features</p>
                                                <ul className="space-y-2">
                                                    {['max_scripts', 'max_audio', 'max_images'].map((key) => {
                                                        const val = formatLimit(plan[key]);
                                                        if (val === null) return null;
                                                        const isUnlimited = val === 'Unlimited';
                                                        return (
                                                            <li key={key} className="flex items-center gap-2 text-xs">
                                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isUnlimited
                                                                        ? `bg-gradient-to-br ${meta.gradient}`
                                                                        : 'bg-gray-200 dark:bg-white/10'
                                                                    }`}>
                                                                    <MdCheck className={`w-2.5 h-2.5 ${isUnlimited ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                                                </div>
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    <span className="font-semibold">{val}</span>{' '}
                                                                    <span className="text-gray-500 dark:text-gray-400 font-normal">{FEATURE_LABELS[key]}</span>
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>

                                            {/* Premium Features */}
                                            <div className="mb-4">
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Premium Features</p>
                                                <ul className="space-y-2">
                                                    {['max_voiceovers', 'max_videos', 'max_siliconflow_images'].map((key) => {
                                                        const val = formatLimit(plan[key]);
                                                        if (val === null || val === '0') return null;
                                                        const isUnlimited = val === 'Unlimited';
                                                        return (
                                                            <li key={key} className="flex items-center gap-2 text-xs">
                                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isUnlimited
                                                                        ? `bg-gradient-to-br ${meta.gradient}`
                                                                        : 'bg-gray-200 dark:bg-white/10'
                                                                    }`}>
                                                                    <MdCheck className={`w-2.5 h-2.5 ${isUnlimited ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                                                </div>
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    <span className="font-semibold">{val}</span>{' '}
                                                                    <span className="text-gray-500 dark:text-gray-400 font-normal">{FEATURE_LABELS[key]}</span>
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                    {plan.voice_pack_name && (
                                                        <li className="flex items-center gap-2 text-xs">
                                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${meta.gradient}`}>
                                                                <MdCheck className="w-2.5 h-2.5 text-gray-900 dark:text-white" />
                                                            </div>
                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                <span className="font-semibold">Premium Voices</span>{' '}
                                                                <span className="text-gray-500 dark:text-gray-400 font-normal">({plan.voice_pack_name})</span>
                                                            </span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>

                                            {/* AI Tools */}
                                            <div className="mb-4">
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">AI Tools</p>
                                                <ul className="space-y-2">
                                                    {['max_blog_to_script', 'max_story_to_script', 'max_youtube_analyzer', 'max_youtube_competitors'].map((key) => {
                                                        const val = formatLimit(plan[key]);
                                                        if (val === null || val === '0') return null;
                                                        const isUnlimited = val === 'Unlimited';
                                                        return (
                                                            <li key={key} className="flex items-center gap-2 text-xs">
                                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isUnlimited
                                                                        ? `bg-gradient-to-br ${meta.gradient}`
                                                                        : 'bg-gray-200 dark:bg-white/10'
                                                                    }`}>
                                                                    <MdCheck className={`w-2.5 h-2.5 ${isUnlimited ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                                                </div>
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    <span className="font-semibold">{val}</span>{' '}
                                                                    <span className="text-gray-500 dark:text-gray-400 font-normal">{FEATURE_LABELS[key]}</span>
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>

                                            {/* Security Info */}
                                            <div className="flex items-center gap-2 text-xs pt-2 mt-1 border-t border-gray-200 dark:border-white/10">
                                                <MdLock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {isFree ? 'No credit card required' : `Secure ${processor} checkout`}
                                                </span>
                                            </div>

                                            {/* CTA */}
                                            <div className="mt-5">
                                                {isFree ? (
                                                    <div className="w-full py-2.5 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium text-center cursor-default">
                                                        Always Free
                                                    </div>
                                                ) : isCurrent ? (
                                                    <div className="w-full py-2.5 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold text-center cursor-default flex items-center justify-center gap-2">
                                                        <MdVerified className="w-4 h-4" /> Current Plan
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleChoosePlan(plan)}
                                                        disabled={!!processingPlanId}
                                                        className={`w-full py-2.5 bg-gradient-to-r ${meta.gradient}
                                                            text-gray-900 dark:text-white rounded-xl text-sm font-bold
                                                            hover:opacity-90 active:scale-[0.98] transition-all
                                                            shadow-md hover:shadow-lg
                                                            disabled:opacity-50 disabled:cursor-not-allowed
                                                            flex items-center justify-center gap-2`}
                                                    >
                                                        {processingPlanId === plan.id ? (
                                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            `Upgrade to ${plan.name}`
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Trust strip ── */}
                        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-white/10">
                            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 dark:text-gray-400 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <MdLock className="w-3.5 h-3.5" />
                                    <span>Encrypted checkout</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MdVerified className="w-3.5 h-3.5" />
                                    <span>Card details never stored</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MdCheck className="w-3.5 h-3.5" />
                                    <span>Data saved across all plan changes</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MdRefresh className="w-3.5 h-3.5" />
                                    <span>Instant activation after payment</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

export default function Plans() {
    return (
        <Suspense fallback={<div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-white p-6 text-xs font-bold">Loading Plans...</div>}>
            <PlansContent />
        </Suspense>
    );
}