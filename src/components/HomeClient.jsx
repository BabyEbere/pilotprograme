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
                                <span className={`text-xs mb-1.5 ${plan.highlight ? 'text-red-200' : 'text-gray-500 dark:text-gray-400 dark:text-gray-400'}`}>/30days</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Features */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#111111] p-5">
                {plan.features && plan.features.core ? (
                    <>
                        {/* Core Features */}
                        <div className="mb-4">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Core Features</p>
                            <ul className="space-y-2">
                                {plan.features.core?.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        {f.ok
                                            ? <MdCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                            : <MdClose className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300 dark:text-white/15 flex-shrink-0 mt-0.5" />
                                        }
                                        <span className={`text-xs leading-relaxed ${f.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-white/20'}`}>{f.t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Premium Features */}
                        {plan.features.premium?.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Premium Features</p>
                                <ul className="space-y-2">
                                    {plan.features.premium.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            {f.ok
                                                ? <MdCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                                : <MdClose className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300 dark:text-white/15 flex-shrink-0 mt-0.5" />
                                            }
                                            <span className={`text-xs leading-relaxed ${f.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-white/20'}`}>{f.t}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* AI Tools */}
                        {plan.features.aiTools?.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">AI Tools</p>
                                <ul className="space-y-2">
                                    {plan.features.aiTools.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            {f.ok
                                                ? <MdCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                                : <MdClose className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300 dark:text-white/15 flex-shrink-0 mt-0.5" />
                                            }
                                            <span className={`text-xs leading-relaxed ${f.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-white/20'}`}>{f.t}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
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
                )}

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

function formatLimit(val) {
    const n = parseInt(val);
    if (!n && n !== 0) return null;
    if (n >= 999999) return 'Unlimited';
    return n.toLocaleString();
}

function buildFeatures(dbPlan) {
    const features = { core: [], premium: [], aiTools: [] };
    const scriptVal = formatLimit(dbPlan.max_scripts);
    features.core.push({ t: scriptVal === 'Unlimited' ? 'Unlimited scripts' : `${scriptVal} script generations`, ok: parseInt(dbPlan.max_scripts) > 0 });
    const audioVal = formatLimit(dbPlan.max_audio);
    features.core.push({ t: audioVal === 'Unlimited' ? 'Unlimited audio renders' : `${audioVal} audio renders`, ok: parseInt(dbPlan.max_audio) > 0 });
    const imageVal = formatLimit(dbPlan.max_images);
    if (parseInt(dbPlan.max_images) > 0) {
        features.core.push({ t: imageVal === 'Unlimited' ? 'Unlimited scene images' : `${imageVal} scene images`, ok: true });
    } else {
        features.core.push({ t: 'Scene image generation', ok: false });
    }
    const voiceoverVal = formatLimit(dbPlan.max_voiceovers);
    if (parseInt(dbPlan.max_voiceovers) > 0) {
        features.premium.push({ t: voiceoverVal === 'Unlimited' ? 'Unlimited voiceovers' : `${voiceoverVal} premium voiceovers`, ok: true });
    } else {
        features.premium.push({ t: 'Premium voiceovers', ok: false });
    }
    const videoVal = formatLimit(dbPlan.max_videos);
    if (parseInt(dbPlan.max_videos) > 0) {
        features.premium.push({ t: videoVal === 'Unlimited' ? 'Unlimited videos' : `${videoVal} video generations`, ok: true });
    }
    const siliconflowVal = formatLimit(dbPlan.max_siliconflow_images);
    if (parseInt(dbPlan.max_siliconflow_images) > 0) {
        features.premium.push({ t: siliconflowVal === 'Unlimited' ? 'Unlimited SiliconFlow images' : `${siliconflowVal} SiliconFlow images`, ok: true });
    }
    if (dbPlan.voice_pack_name) {
        features.premium.push({ t: `Premium voices (${dbPlan.voice_pack_name})`, ok: true });
    } else {
        features.premium.push({ t: 'Premium SiliconFlow voices', ok: false });
    }
    const blogVal = formatLimit(dbPlan.max_blog_to_script);
    if (parseInt(dbPlan.max_blog_to_script) > 0) {
        features.aiTools.push({ t: blogVal === 'Unlimited' ? 'Unlimited blog to script' : `${blogVal} blog to script`, ok: true });
    }
    const storyVal = formatLimit(dbPlan.max_story_to_script);
    if (parseInt(dbPlan.max_story_to_script) > 0) {
        features.aiTools.push({ t: storyVal === 'Unlimited' ? 'Unlimited story to script' : `${storyVal} story to script`, ok: true });
    }
    const youtubeVal = formatLimit(dbPlan.max_youtube_analyzer);
    if (parseInt(dbPlan.max_youtube_analyzer) > 0) {
        features.aiTools.push({ t: youtubeVal === 'Unlimited' ? 'Unlimited YouTube audits' : `${youtubeVal} YouTube channel audits`, ok: true });
    }
    const competitorsVal = formatLimit(dbPlan.max_youtube_competitors);
    if (parseInt(dbPlan.max_youtube_competitors) > 0) {
        features.aiTools.push({ t: `${competitorsVal} YouTube competitors analysis`, ok: true });
    }
    features.core.push({ t: 'AI Content generation', ok: true });
    features.core.push({ t: 'Niche management', ok: true });
    return features;
}

export default function HomeClient(props) {
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
        <>
            <DynamicSEO pageSlug="home" />
            <Navbar />
            <div className="bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
                {/* ── HERO ─────────────────────────────────────────────────────── */}
                <section className="relative bg-white dark:bg-[#0a0a0a] overflow-hidden">
                    <div className="absolute inset-0">
                        <img src="/youtube.jpeg" alt="" className="w-full h-full object-cover opacity-10 dark:opacity-30" aria-hidden="true" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white dark:from-black/60 dark:via-black/40 dark:to-[#0a0a0a]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/5 dark:bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                    </div>

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-28 md:py-36 text-center">
                        <div className="inline-flex items-center gap-2 bg-red-600/10 dark:bg-red-600/20 backdrop-blur-sm border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-xs font-semibold mb-8 tracking-wide">
                            <MdAutoAwesome className="w-4 h-4" />
                            Powered by Pilot Programme AI Technology
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
                            Faceless YouTube Automation
                            <span className="block bg-gradient-to-r from-red-600 via-red-700 to-red-600 bg-clip-text text-transparent">
                                10x Faster
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto font-normal leading-relaxed">
                            AI-powered scripts, professional narration, and stunning visuals.
                            <span className="block mt-2 text-gray-500 dark:text-gray-400 dark:text-gray-400">Everything you need to dominate YouTube — no camera, no editing.</span>
                        </p>

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
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent" />
                </section>

                <FeatureTicker />

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

                <section className="py-16 bg-gray-50 dark:bg-[#0d0d0d] border-y border-gray-200 dark:border-white/8 transition-colors overflow-hidden relative">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                        <div className="text-center mb-12">
                            <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Pilot Programme is Powered By</p>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
                                Three industry leaders.{' '}
                                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
                                    One platform.
                                </span>
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                                Our partnerships with Google, Gemini AI, and PookieTech form the technological backbone of everything we build.
                            </p>
                        </div>
                    </div>
                </section>

                <BlogSection limit={3} />
            </div>
            <Footer />
        </>
    );
}
