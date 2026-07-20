"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicSEO from '@/components/DynamicSEO';
import Breadcrumbs from '@/components/Breadcrumbs';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import {
    MdCheck, MdClose, MdPlayArrow, MdAutoAwesome,
    MdRocketLaunch, MdStar, MdDiamond, MdArrowForward,
    MdCreditCard, MdLock, MdVerified,
} from 'react-icons/md';

const PLANS = [
    {
        icon: MdAutoAwesome,
        name: 'Free',
        ngn: '0',
        desc: 'Try before you commit',
        highlight: false,
        badge: null,
        features: [
            { t: '2 script generations / month', ok: true },
            { t: '2 audio renders / month', ok: true },
            { t: 'Edge TTS voices', ok: true },
            { t: 'Niche management', ok: true },
            { t: 'AI content generator', ok: false },
            { t: 'Premium SiliconFlow voices', ok: false },
            { t: 'Scene image generation', ok: false },
        ],
        cta: 'Start Free',
    },
    {
        icon: MdRocketLaunch,
        name: 'Starter',
        ngn: '2,500',
        desc: 'For growing channels',
        highlight: false,
        badge: null,
        features: [
            { t: '20 script generations / month', ok: true },
            { t: '20 audio renders / month', ok: true },
            { t: 'Edge TTS + premium voices', ok: true },
            { t: 'Scene image generation', ok: true },
            { t: 'AI content generator', ok: true },
            { t: 'Niche management', ok: true },
            { t: 'Human support tickets', ok: true },
        ],
        cta: 'Get Starter',
    },
    {
        icon: MdStar,
        name: 'Pookie',
        ngn: '5,000',
        desc: 'Most popular — best value',
        highlight: true,
        badge: 'Most Popular',
        features: [
            { t: '50 script generations / month', ok: true },
            { t: '50 audio renders / month', ok: true },
            { t: 'All premium voice models', ok: true },
            { t: 'Scene image generation', ok: true },
            { t: 'AI content generator', ok: true },
            { t: 'Higher voiceover quota', ok: true },
            { t: 'Priority human support', ok: true },
        ],
        cta: 'Get Pookie',
    },
    {
        icon: MdDiamond,
        name: 'Pro',
        ngn: '9,000',
        desc: 'Scale your automation',
        highlight: false,
        badge: 'Best Value',
        features: [
            { t: 'Unlimited script generations', ok: true },
            { t: 'Unlimited audio renders', ok: true },
            { t: 'All premium voice models', ok: true },
            { t: 'Scene image generation', ok: true },
            { t: 'Highest voiceover quota', ok: true },
            { t: 'AI content generator', ok: true },
            { t: 'Priority support', ok: true },
        ],
        cta: 'Get Pro',
    },
];

const FAQS = [
    {
        q: 'Can I cancel anytime?',
        a: 'Yes — all plans are period-based with no long-term commitment. There are no automatic renewals; you simply subscribe for the active period and renew when you\'re ready.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept payments via Paystack using NGN (debit cards, bank transfer). Payments are fast, secure, and activate your subscription instantly.',
    },
    {
        q: 'What happens to my content when a plan expires?',
        a: 'Your scripts, audio files, and images are all saved. You won\'t be able to generate new content until you renew, but everything you\'ve already created stays accessible.',
    },
    {
        q: 'What is the difference between Edge TTS and premium voices?',
        a: 'Edge TTS is Microsoft\'s free text-to-speech — clean and reliable, included on all plans. Premium voices are SiliconFlow\'s AI models: CosyVoice2 (emotion-aware narration), Fish Speech 1.5 (natural, multilingual), and IndexTTS-2 (high-fidelity). Premium voices unlock on Starter and above.',
    },
    {
        q: 'Does the free plan expire?',
        a: 'No. The free plan is permanent — 2 scripts and 2 audio renders per month, no card required, no expiry date.',
    },
    {
        q: 'Can I upgrade or downgrade my plan?',
        a: 'Yes — subscribe to any plan at any time. Your usage quota resets at the start of each new subscription period.',
    },
];

function formatLimit(val) {
    const n = parseInt(val);
    if (!n && n !== 0) return null;
    if (n >= 999999) return 'Unlimited';
    return n.toLocaleString();
}

function buildFeatures(dbPlan) {
    const features = {
        core: [],
        premium: [],
        aiTools: []
    };
    
    // Core Features
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
    
    // Premium Features
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
    
    // AI Tools
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
    
    // Default inclusions
    features.core.push({ t: 'AI Content generation', ok: true });
    features.core.push({ t: 'Niche management', ok: true });
    
    return features;
}

function PricingLanding() {
    const [dbPlans, setDbPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/admin/pricing`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.plans) {
                    setDbPlans(data.plans);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load plans", err);
                setLoading(false);
            });
    }, []);

    const displayPlans = PLANS.map((basePlan, index) => {
        // Match by name or fallback to index position
        const dbMatch = dbPlans.find(dbP => dbP.name.toLowerCase() === basePlan.name.toLowerCase() || 
            (basePlan.name === 'Pro' && dbP.name.toLowerCase() === 'creator')) || 
            (index < dbPlans.length ? dbPlans[index] : null);

        if (dbMatch) {
            return {
                ...basePlan,
                name: dbMatch.name, // Will use exact DB name like 'Creator'
                ngn: Number(dbMatch.price_naira).toLocaleString(),
                features: buildFeatures(dbMatch),
            };
        }
        return basePlan;
    });

    return (
        <div className="bg-white dark:bg-[#0a0a0a]">

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden border-b border-gray-200 dark:border-white/8 py-20 md:py-28">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/8 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Pricing</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
                        Simple, transparent plans
                        <span className="block bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent">
                            for every creator
                        </span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
                        Start free. Upgrade when you're ready. No hidden fees, no automatic renewals.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-gray-600 dark:text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <MdCheck className="w-3.5 h-3.5 text-green-500" />
                            <span>Free plan — no card required</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MdCreditCard className="w-3.5 h-3.5 text-blue-400" />
                            <span>Paystack (NGN Only)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MdLock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-500" />
                            <span>Secure checkout</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Pricing cards ─────────────────────────────────────────────── */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white dark:bg-[#0a0a0a]/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                                <span className="text-gray-900 dark:text-white text-sm font-semibold flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    Syncing Live Prices...
                                </span>
                            </div>
                        )}
                        {displayPlans.map((plan) => {
                            const Icon = plan.icon;
                            return (
                                <div
                                    key={plan.name}
                                    className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200
                                        ${plan.highlight
                                            ? 'ring-2 ring-red-500/50 shadow-2xl shadow-red-900/30 xl:-translate-y-2'
                                            : 'ring-1 ring-white/8 hover:ring-white/15'
                                        }`}
                                >
                                    {/* Badge */}
                                    {plan.badge && (
                                        <div className="absolute top-3.5 right-3.5 z-10">
                                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide ${plan.highlight
                                                    ? 'bg-red-600 text-gray-900 dark:text-white'
                                                    : 'bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/15'
                                                }`}>
                                                {plan.badge}
                                            </span>
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div className={`p-6 ${plan.highlight ? 'bg-red-600' : 'bg-gray-50 dark:bg-[#111111]'}`}>
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${plan.highlight ? 'bg-white/20' : 'bg-red-500/10 dark:bg-red-500/15'}`}>
                                            <Icon className={`w-5 h-5 ${plan.highlight ? 'text-gray-900 dark:text-white' : 'text-red-500'}`} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                        <p className={`text-xs mt-0.5 mb-4 ${plan.highlight ? 'text-red-100' : 'text-gray-500 dark:text-gray-400'}`}>{plan.desc}</p>
                                        <div>
                                            {plan.ngn === '0' ? (
                                                <span className="text-3xl font-black text-gray-900 dark:text-white">Free</span>
                                            ) : (
                                                <>
                                                    <div className="flex items-end gap-1">
                                                        <span className="text-3xl font-black text-gray-900 dark:text-white">₦{plan.ngn}</span>
                                                        <span className={`text-xs mb-1.5 ${plan.highlight ? 'text-red-200' : 'text-gray-500 dark:text-gray-400'}`}>/30days</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#111111] p-5">
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
                                                                    : <MdClose className="w-3.5 h-3.5 text-gray-900 dark:text-white/15 flex-shrink-0 mt-0.5" />
                                                                }
                                                                <span className={`text-xs leading-relaxed ${f.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white/20'}`}>{f.t}</span>
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
                                                                        : <MdClose className="w-3.5 h-3.5 text-gray-900 dark:text-white/15 flex-shrink-0 mt-0.5" />
                                                                    }
                                                                    <span className={`text-xs leading-relaxed ${f.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white/20'}`}>{f.t}</span>
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
                                                                        : <MdClose className="w-3.5 h-3.5 text-gray-900 dark:text-white/15 flex-shrink-0 mt-0.5" />
                                                                    }
                                                                    <span className={`text-xs leading-relaxed ${f.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white/20'}`}>{f.t}</span>
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
                                                            : <MdClose className="w-4 h-4 text-gray-900 dark:text-white/15 flex-shrink-0 mt-0.5" />
                                                        }
                                                        <span className={`text-xs leading-relaxed ${f.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white/20'}`}>{f.t}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="mt-6">
                                            <Link href={plan.name === 'Free' ? '/register' : '/register'}
                                                className={`block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${plan.highlight
                                                        ? 'bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white shadow-lg shadow-red-900/40'
                                                        : plan.name === 'Free'
                                                            ? 'bg-gray-200/50 dark:bg-white/8 hover:bg-gray-300/50 dark:bg-white/15 text-gray-700 dark:text-gray-300'
                                                            : 'bg-gray-200/50 dark:bg-white/8 hover:bg-gray-300/50 dark:bg-white/15 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                                                    }`}
                                            >
                                                {plan.cta}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Payment methods strip ─────────────────────────────────────── */}
            <section className="py-10 border-y border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-[#111111]">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-500 mb-4 uppercase tracking-widest font-semibold">Secure payment via</p>
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-500 dark:text-gray-400">
                            <div className="w-8 h-8 bg-[#00C3F7] rounded-lg flex items-center justify-center">
                                <span className="text-gray-900 dark:text-white text-[10px] font-black">P</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Paystack</p>
                                <p className="text-[10px] text-gray-600 dark:text-gray-500">NGN · Secure Payment</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200/50 dark:bg-white/8" />
                        <div className="flex items-center gap-2">
                            <MdVerified className="w-5 h-5 text-green-500" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Card details never stored</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────── */}
            <section className="py-20 bg-white dark:bg-[#0a0a0a]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">FAQ</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Common questions</h2>
                    </div>
                    <div className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 hover:border-gray-300 dark:border-white/15 transition-colors">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────────── */}
            <section className="py-20 bg-gray-50 dark:bg-[#111111] border-t border-gray-200 dark:border-white/8">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-4">Get Started</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                        Start creating today
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-500 dark:text-gray-400 mb-10 font-normal">
                        Free forever. Upgrade when you're ready.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-base font-semibold transition-all shadow-lg shadow-red-900/40 hover:scale-105">
                            <MdPlayArrow className="w-5 h-5" />
                            Create Free Account
                        </Link>
                        <Link href="/features" className="inline-flex items-center justify-center gap-2 bg-gray-200/50 dark:bg-white/8 hover:bg-gray-300/50 dark:bg-white/15 border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-base font-semibold transition-all">
                            See All Features
                            <MdArrowForward className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function WrappedPricingLanding(props) {
    return (
        <>
            <DynamicSEO 
                pageSlug="pricing"
                fallbackTitle="Pricing — Pilot Programme AI YouTube Automation"
                fallbackDescription="Choose the perfect plan for your faceless YouTube channel. Free, Starter, Pro, and Enterprise plans with varying features for AI content creation."
                fallbackKeywords="Pilot Programme pricing, faceless YouTube plans, AI automation pricing, YouTube automation subscription"
                schemaType="Product"
            />
            <Navbar />
            <Breadcrumbs />
            <PricingLanding {...props} />
            <Footer />
        </>
    );
}
