"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicSEO from '@/components/DynamicSEO';
import BlogSection from '@/components/BlogSection';


import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

import {
    MdPlayArrow, MdArrowForward, MdCheck, MdClose,
    MdDescription, MdRecordVoiceOver, MdImage,
    MdAutoAwesome, MdBolt, MdTrendingUp,
    MdLock, MdCreditCard, MdRocketLaunch, MdStar, MdDiamond
} from 'react-icons/md';

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!started) return;
        let frame = 0;
        const total = 60;
        const timer = setInterval(() => {
            frame++;
            setCount(Math.round((frame / total) * target));
            if (frame >= total) clearInterval(timer);
        }, 20);
        return () => clearInterval(timer);
    }, [started, target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Feature ticker ────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
    'Niche Management', 'Subscription Plans', 'Paystack Payments', 'Instant Activation',
];

function FeatureTicker() {
    return (
        <div className="overflow-hidden border-y border-gray-200 dark:border-white/8 py-3 bg-gray-50 dark:bg-[#111111]">
            <div className="flex gap-10 animate-[ticker_25s_linear_infinite] whitespace-nowrap w-max">
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                    <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                        {item}
                    </span>
                ))}
            </div>
            <style>{`
                @keyframes ticker {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function Step({ n, title, desc, icon: Icon, tags }) {
    return (
        <div className="group relative bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-red-600 text-gray-900 dark:text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {n}
                </div>
                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-red-500" />
                </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{desc}</p>
            <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 bg-gray-200 dark:bg-white/8 text-gray-600 dark:text-gray-500 dark:text-gray-400 rounded-full">{t}</span>
                ))}
            </div>
        </div>
    );
}

// ── Plan card ─────────────────────────────────────────────────────────────────
const PLANS = [
    {
        icon: MdAutoAwesome,
        name: 'Free',
        ngn: '0',
        usd: '0',
        desc: 'Try before you commit',
        highlight: false,
        badge: null,
        cta: 'Start Free',
    },
    {
        icon: MdRocketLaunch,
        name: 'Starter',
        ngn: '2,500',
        usd: '3',
        desc: 'For growing channels',
        highlight: false,
        badge: null,
        cta: 'Get Starter',
    },
    {
        icon: MdStar,
        name: 'Pookie',
        ngn: '5,000',
        usd: '6',
        desc: 'Most popular — best value',
        highlight: true,
        badge: 'Most Popular',
        cta: 'Get Pookie',
    },
    {
        icon: MdDiamond,
        name: 'Creator',
        ngn: '9,000',
        usd: '12',
        desc: 'Scale your automation',
        highlight: false,
        badge: null,
        cta: 'Get Creator',
    },
];

function PlanCard({ plan }) {
    const Icon = plan.icon;
    return (
        <div
            className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200
                ${plan.highlight
                    ? 'ring-2 ring-red-500/50 shadow-2xl shadow-red-900/30 xl:-translate-y-2'
                    : 'ring-1 ring-gray-200 dark:ring-white/8 hover:ring-gray-300 dark:hover:ring-white/15'
                }`}
        >
            {/* Badge */}
            {plan.badge && (
                <div className="absolute top-3.5 right-3.5 z-10">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide ${plan.highlight
                            ? 'bg-red-600 text-gray-900 dark:text-white'
                            : 'bg-gray-200/50 dark:bg-white/10 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/15'
                        }`}>
                        {plan.badge}
                    </span>
                </div>
            )}

            {/* Header */}
            <div className={`p-6 ${plan.highlight ? 'bg-red-600 text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-[#111111]'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${plan.highlight ? 'bg-white/20' : 'bg-red-500/10 dark:bg-red-500/15'}`}>
                    <Icon className={`w-5 h-5 ${plan.highlight ? 'text-gray-900 dark:text-white' : 'text-red-500'}`} />
                </div>
                <h3 className={`text-lg font-bold ${plan.highlight ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                <p className={`text-xs mt-0.5 mb-4 ${plan.highlight ? 'text-red-100' : 'text-gray-500 dark:text-gray-400 dark:text-gray-400'}`}>{plan.desc}</p>
                <div>
                    {plan.ngn === '0' || plan.ngn === 0 ? (
                        <span className={`text-3xl font-black ${plan.highlight ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>Free</span>
                    ) : (
                        <>
                            <div className="flex items-end gap-1">
                                <span className={`text-3xl font-black ${plan.highlight ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>₦{plan.ngn}</span>
                                <span className={`text-xs mb-1.5 ${plan.highlight ? 'text-red-200' : 'text-gray-500 dark:text-gray-400 dark:text-gray-400'}`}>/period</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Features */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#111111] p-5">
                <ul className="space-y-2.5 flex-1">
                    {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            {f.ok
                                ? <MdCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                : <MdClose className="w-4 h-4 text-gray-700 dark:text-gray-300 dark:text-white/15 flex-shrink-0 mt-0.5" />
                            }
                            <span className={`text-xs leading-relaxed ${f.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-white/20'}`}>{f.t}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-6">
                    <Link href='/register'
                        className={`block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${plan.highlight
                                ? 'bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white shadow-lg shadow-red-900/40'
                                : plan.name === 'Free'
                                    ? 'bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-gray-300/50 dark:bg-white/15 text-gray-800 dark:text-gray-300'
                                    : 'bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-gray-300/50 dark:bg-white/15 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                            }`}
                    >
                        {plan.cta}
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

function formatLimit(val) {
    const n = parseInt(val);
    if (!n && n !== 0) return null;
    if (n >= 999999) return 'Unlimited';
    return n.toLocaleString();
}

function buildFeatures(dbPlan) {
    const features = [];
    
    // Scripts
    const scriptVal = formatLimit(dbPlan.max_scripts);
    features.push({ t: scriptVal === 'Unlimited' ? 'Unlimited scripts' : `${scriptVal} script generations`, ok: parseInt(dbPlan.max_scripts) > 0 });
    
    // Audio
    const audioVal = formatLimit(dbPlan.max_audio);
    features.push({ t: audioVal === 'Unlimited' ? 'Unlimited audio renders' : `${audioVal} audio renders`, ok: parseInt(dbPlan.max_audio) > 0 });
    
    // Voices
    if (dbPlan.voice_pack_name) {
        features.push({ t: `Premium voices (${dbPlan.voice_pack_name})`, ok: true });
    } else {
        features.push({ t: 'Premium SiliconFlow voices', ok: false });
    }
    
    // Images
    const imageVal = formatLimit(dbPlan.max_images);
    if (parseInt(dbPlan.max_images) > 0) {
        features.push({ t: imageVal === 'Unlimited' ? 'Unlimited scene images' : `${imageVal} scene images`, ok: true });
    } else {
        features.push({ t: 'Scene image generation', ok: false });
    }

    // Default inclusions
    features.push({ t: 'AI Content generation', ok: true });
    features.push({ t: 'Niche management', ok: true });
    
    return features;
}

function Home() {
    const [activeVoice, setActiveVoice] = useState(0);
    const voices = ['Edge TTS (Free)', 'CosyVoice2', 'Fish Speech 1.5', 'IndexTTS-2'];

    const [dbPlans, setDbPlans] = useState([]);

    useEffect(() => {
        const t = setInterval(() => setActiveVoice(v => (v + 1) % voices.length), 2000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/admin/pricing`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.plans) {
                    setDbPlans(data.plans);
                }
            })
            .catch(err => console.error("Failed to load plans", err));
    }, []);

    const displayPlans = PLANS.map((basePlan, index) => {
        const dbMatch = dbPlans.find(dbP => dbP.name.toLowerCase() === basePlan.name.toLowerCase() || 
            (basePlan.name === 'Pro' && dbP.name.toLowerCase() === 'creator')) || 
            (index < dbPlans.length ? dbPlans[index] : null);

        if (dbMatch) {
            return {
                ...basePlan,
                name: dbMatch.name,
                ngn: Number(dbMatch.price_naira).toLocaleString(),
                features: buildFeatures(dbMatch),
            };
        }
        return basePlan;
    });

    return (
        <div className="bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="relative bg-white dark:bg-[#0a0a0a] overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                    <img src="/youtube.jpeg" alt="" className="w-full h-full object-cover opacity-10 dark:opacity-30" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white dark:from-black/60 dark:via-black/40 dark:to-[#0a0a0a]" />
                    {/* Subtle red glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/5 dark:bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-28 md:py-36 text-center">
                    {/* Eyebrow */}
                    <div className="inline-flex items-center gap-2 bg-red-600/10 dark:bg-red-600/20 backdrop-blur-sm border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-xs font-semibold mb-8 tracking-wide">
                        <MdAutoAwesome className="w-4 h-4" />
                        Powered by Pilot Programme AI Technology
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
                        Faceless YouTube Automation
                        <span className="block bg-gradient-to-r from-red-600 via-red-700 to-red-600 bg-clip-text text-transparent">
                            10x Faster
                        </span>
                    </h1>

                    {/* Subhead */}
                    <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto font-normal leading-relaxed">
                        AI-powered scripts, professional narration, and stunning visuals.
                        <span className="block mt-2 text-gray-500 dark:text-gray-400 dark:text-gray-400">Everything you need to dominate YouTube — no camera, no editing.</span>
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
                        <Link href="/get-started"
                            className="group bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-base font-semibold transition-all shadow-lg shadow-red-600/15 dark:shadow-red-600/50 flex items-center justify-center gap-2 hover:shadow-red-600/30 dark:hover:shadow-red-600/70 hover:scale-105"
                        >
                            <MdPlayArrow className="w-5 h-5 fill-white" />
                            Start Creating Free
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                        <Link href="/pricing"
                            className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 backdrop-blur-sm text-gray-800 dark:text-white px-8 py-3 rounded-lg text-base font-semibold border border-gray-300/40 dark:border-white/20 transition-all flex items-center justify-center"
                        >
                            View Plans
                        </Link>
                    </div>

                    {/* Social proof row */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <MdCheck className="w-3.5 h-3.5 text-green-500" />
                            <span>Free plan available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>Paystack (NGN) · Fast & Secure</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MdLock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                            <span>Secure · No spam</span>
                        </div>
                    </div>
                </div>

                {/* Bottom gradient filler */}
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent" />
            </section>

            {/* ── TICKER ───────────────────────────────────────────────────── */}
            <FeatureTicker />

            {/* ── STATS ────────────────────────────────────────────────────── */}
            <section className="py-14 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/5 transition-colors">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: 3, suffix: '', label: 'TTS Engines' },
                        { value: 24, suffix: '+', label: 'Premium Voices' },
                        { value: 4, suffix: '', label: 'Subscription Plans' },
                        { value: 100, suffix: '%', label: 'Faceless — No Camera' },
                    ].map((s, i) => (
                        <div key={i}>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                <Counter target={s.value} suffix={s.suffix} />
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PARTNERSHIPS ─────────────────────────────────────────────── */}
            <section className="py-16 bg-gray-50 dark:bg-[#0d0d0d] border-y border-gray-200 dark:border-white/8 transition-colors overflow-hidden relative">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[80px]" />
                    <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[80px]" />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Pilot Programme is Powered By</p>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
                            Three industry leaders.{' '}
                            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
                                One platform.
                            </span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            Our partnerships with Google, Gemini AI, and PookieTech form the technological backbone of everything we build — ensuring enterprise-grade reliability, speed, and intelligence.
                        </p>
                    </div>

                    {/* Partner Cards */}
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Google */}
                        <div className="group relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-7 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            {/* Google Logo SVG */}
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                <svg viewBox="0 0 48 48" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                </svg>
                            </div>
                            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                                Infrastructure Partner
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Google</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Enterprise cloud infrastructure, APIs, and world-class compute power. Pilot Programme runs on Google's reliable, globally-distributed technology stack.
                            </p>
                        </div>

                        {/* Gemini */}
                        <div className="group relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-7 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-900/10 transition-all duration-300 flex flex-col items-center text-center ring-1 ring-purple-500/20 dark:ring-purple-500/30">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            {/* Gemini Logo — real image */}
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a1a] shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-2">
                                <img
                                    src="/gemini-logo.png"
                                    alt="Google Gemini AI Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-600 text-white tracking-wide">AI Core</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                                AI Intelligence Partner
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Gemini AI</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Google Gemini 2.5 Flash powers our script engine — generating niche-aware, multi-scene YouTube scripts with visual cues, trending research, and storytelling depth.
                            </p>
                        </div>

                        {/* PookieTech */}
                        <div className="group relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-7 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            {/* PookieTech Logo — real image */}
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a1a] shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-1.5">
                                <img
                                    src="/pookietech.png"
                                    alt="PookieTech Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                                Platform Partner
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">PookieTech</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                The creative and engineering force behind Pilot Programme. PookieTech designs, builds, and maintains the platform — from the voice pipeline to the subscription system.
                            </p>
                        </div>
                    </div>

                    {/* Bottom trust line */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Google Cloud Infrastructure</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>Gemini 2.5 Flash AI Engine</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span>Built by PookieTech</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
            <section className="py-20 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/5 transition-colors">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="mb-12">
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-2">How it works</p>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white max-w-lg leading-tight">
                            From idea to publish-ready in three steps
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        <Step
                            n="1" icon={MdDescription}
                            title="Generate Your Script"
                            desc="Pick a niche, choose your topic, and let Gemini AI write a scene-by-scene script complete with visual suggestions and narration cues."
                            tags={['Gemini AI', 'Scene breakdown', 'Custom duration', 'Topic research']}
                        />
                        <Step
                            n="2" icon={MdRecordVoiceOver}
                            title="Produce Voiceover Audio"
                            desc="Convert each scene to audio using Edge TTS (free), or upgrade to premium SiliconFlow voices — CosyVoice2, Fish Speech, or IndexTTS-2."
                            tags={['Edge TTS', 'CosyVoice2', 'Fish Speech', 'IndexTTS-2']}
                        />
                        <Step
                            n="3" icon={MdImage}
                            title="Generate Scene Images"
                            desc="Each script scene gets a matching AI image — generated via FLUX on SiliconFlow or Pollinations fallback. Download everything and assemble."
                            tags={['FLUX AI', 'SiliconFlow', 'Pollinations', 'Per-scene images']}
                        />
                    </div>
                </div>
            </section>

            {/* ── VOICE SHOWCASE ───────────────────────────────────────────── */}
            <section className="py-20 bg-gray-50 dark:bg-[#111111] border-y border-gray-200 dark:border-white/8 transition-colors">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-2">Premium Audio</p>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                                24 voices across 3 AI models
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                                Free users get Edge TTS — clean, reliable narration at no cost.
                                Paid plans unlock SiliconFlow's premium models with emotion-aware delivery,
                                natural pacing, and studio-quality output.
                            </p>
                            <div className="space-y-2">
                                {[
                                    { label: 'Edge TTS', tier: 'Free', desc: 'Clean narration, 8 voices' },
                                    { label: 'CosyVoice2', tier: 'Paid', desc: 'Emotion prefix, expressive storytelling' },
                                    { label: 'Fish Speech', tier: 'Paid', desc: 'Natural, multilingual output' },
                                    { label: 'IndexTTS-2', tier: 'Paid', desc: 'High-fidelity, consistent narration' },
                                ].map((v, i) => (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${activeVoice === i
                                            ? 'border-red-500/30 bg-red-500/5 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                            : 'border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1a]'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full transition-all ${activeVoice === i ? 'bg-red-600 dark:bg-red-500 animate-pulse' : 'bg-gray-300 dark:bg-white/20'}`} />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{v.label}</span>
                                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${v.tier === 'Free' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {v.tier}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{v.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual block */}
                        <div className="relative">
                            <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs leading-relaxed border border-gray-800 shadow-2xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    <span className="ml-2 text-gray-500 dark:text-gray-400 text-[10px]">scene_audio.py</span>
                                </div>
                                <div className="space-y-1 text-gray-700 dark:text-gray-300">
                                    <div><span className="text-purple-400">model</span> <span className="text-gray-500 dark:text-gray-400">=</span> <span className="text-green-400">"CosyVoice2-0.5B"</span></div>
                                    <div><span className="text-purple-400">voice</span> <span className="text-gray-500 dark:text-gray-400">=</span> <span className="text-green-400">"bella"</span></div>
                                    <div className="mt-2"><span className="text-blue-400">narration_prefix</span> <span className="text-gray-500 dark:text-gray-400">=</span></div>
                                    <div className="ml-4 text-yellow-300 text-[10px] leading-relaxed">"Speak in a calm, engaging<br />storytelling narrator voice.<br />Pace yourself naturally..."</div>
                                    <div className="mt-2 text-gray-500 dark:text-gray-400"># chunks ≤ 800 chars to prevent</div>
                                    <div className="text-gray-500 dark:text-gray-400"># SiliconFlow 50507 timeout</div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-red-400 font-semibold">generate_audio</span>
                                        <span className="text-gray-700 dark:text-gray-300">(scene, voice)</span>
                                        <span className="inline-block w-1.5 h-3.5 bg-white/70 animate-pulse ml-1 rounded-sm" />
                                    </div>
                                </div>
                            </div>
                            {/* Floating badge */}
                            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/15 shadow-2xl rounded-xl px-3 py-2 flex items-center gap-2">
                                <MdAutoAwesome className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Scene-by-scene generation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES GRID ────────────────────────────────────────────── */}
            <section className="py-20 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/5 transition-colors">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-2">Platform Features</p>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Built for serious faceless creators</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { icon: MdDescription, title: 'Gemini Script Engine', desc: 'Multi-scene scripts with visual cues, duration control, and niche-aware prompting.' },
                            { icon: MdRecordVoiceOver, title: 'Multi-Model TTS', desc: 'Edge TTS free tier + CosyVoice2, Fish Speech, and IndexTTS-2 on paid plans. 8 voices per model.' },
                            { icon: MdImage, title: 'FLUX Image Gen', desc: 'Per-scene images via SiliconFlow FLUX or Pollinations fallback — no extra tools.' },
                            { icon: MdAutoAwesome, title: 'AI Content Generator', desc: 'Trending topic fetching + one-click bulk script generation via Gemini 2.5 Flash.' },
                            { icon: MdTrendingUp, title: 'Niche Management', desc: 'Create and organise unlimited niches. All scripts, audio, and images grouped by channel.' },
                            { icon: MdBolt, title: 'Usage Dashboard', desc: 'Real-time quota tracking across scripts, audio, voiceovers, and images per billing cycle.' },
                        ].map((f, i) => (
                            <div key={i} className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-gray-50 dark:bg-[#111111] hover:border-red-500/30 hover:bg-gray-100 dark:hover:bg-gray-100 dark:bg-[#1a1a1a] transition-all duration-200 group">
                                <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-500/20 transition-colors">
                                    <f.icon className="w-4 h-4 text-red-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING PREVIEW ──────────────────────────────────────────── */}
            <section className="py-20 bg-gray-50 dark:bg-[#111111] border-t border-gray-200 dark:border-white/8 transition-colors">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-2">Pricing</p>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 font-sans">Simple, transparent plans</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fast & Secure payment via Paystack (NGN)</p>
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {displayPlans.map(plan => <PlanCard key={plan.name} plan={plan} />)}
                    </div>

                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
                        All plans include access to the dashboard, script editor, and audio downloads.
                        <Link href="/pricing" className="text-red-600 hover:text-red-500 font-semibold ml-1">Full plan details →</Link>
                    </p>
                </div>
            </section>

            {/* ── AFFILIATE PROGRAM ─────────────────────────────────────────── */}
            <section className="py-24 bg-white dark:bg-[#0a0a0a] relative overflow-hidden transition-colors">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl transition-colors">
                        <div className="md:w-3/5 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                                Partner Program
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                                Earn money for every <br />
                                creator you refer
                            </h2>
                            <p className="text-gray-600 dark:text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-8 font-sans">
                                Join our affiliate program and earn commissions on every successful 
                                plan upgrade. Help others discover the power of AI automation and 
                                grow your income together.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start">
                                <Link href="/affiliate"
                                    className="bg-gray-900 dark:bg-white text-gray-900 dark:text-white dark:text-black px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2 group"
                                >
                                    Learn More <MdArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                                    ₦5,000 Minimum Withdrawal · Fast Payments
                                </span>
                            </div>
                        </div>
                        <div className="md:w-2/5 flex justify-center">
                            <div className="p-4 bg-red-600/5 dark:bg-red-600/10 rounded-2xl border border-red-500/10 dark:border-red-500/20 shadow-lg">
                                <MdTrendingUp className="w-32 h-32 text-red-600 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ────────────────────────────────────────────────── */}
            <section className="py-24 bg-white dark:bg-[#0a0a0a] transition-colors">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-4">Ready?</p>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                        Ready to start creating?
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-500 dark:text-gray-400 mb-10 font-normal">
                        Join creators who are automating their YouTube content production
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register"
                            className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-base font-semibold transition-all shadow-lg shadow-red-600/20 dark:shadow-red-600/30 inline-flex items-center justify-center gap-2 hover:shadow-red-600/50 hover:scale-105"
                        >
                            <MdPlayArrow className="w-5 h-5 fill-white" />
                            Create Free Account
                        </Link>
                        <Link href="/pricing"
                            className="bg-gray-150 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white px-8 py-3 rounded-lg text-base font-semibold border border-gray-300 dark:border-white/20 transition-colors inline-flex items-center justify-center"
                        >
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>
            
            <BlogSection limit={3} />
        </div>
    );
}

export default function WrappedHome(props) {
    return (
        <>
            <DynamicSEO 
                pageSlug="home"
                fallbackTitle="Pilot Programme — AI-Powered Faceless YouTube Automation"
                fallbackDescription="Generate YouTube scripts, AI voiceovers, and scene images — all in one platform. Pilot Programme automates faceless YouTube content creation for creators worldwide. Powered by Google, Gemini AI, and PookieTech."
                fallbackKeywords="faceless YouTube, AI YouTube automation, script generator, text to speech, AI voiceover, YouTube scripts, Pilot Programme, faceless YouTube automation, Google AI partnership, Gemini AI, PookieTech, AI content creation"
            />
            <Navbar />
            <Home {...props} />
            <Footer />
        </>
    );
}
