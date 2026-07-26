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
    MdLock, MdCreditCard, MdRocketLaunch, MdStar, MdDiamond,
    MdExpandMore, MdGroup, MdShare, MdHelpOutline
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

// ── FAQ section ───────────────────────────────────────────────────────────────
// Real long-tail questions people search before signing up for a tool like this.
// FAQPage schema should be added in DynamicSEO/head for this section to earn
// "People Also Ask" placement — plain accordion markup alone won't do that.
const FAQ_ITEMS = [
    {
        q: 'Is Pilot Programme really free to start?',
        a: 'Yes. The Free plan gives you 2 script generations and 2 audio renders a month with Edge TTS narration, no card required. You can upgrade any time your niche channel starts scaling.',
    },
    {
        q: 'Do I need any editing or camera skills to use this?',
        a: 'No. Pilot Programme is built specifically for faceless channels — you pick a niche and topic, Gemini writes the scene-by-scene script, you generate narration and matching images, then assemble the download in your video editor and publish.',
    },
    {
        q: 'How does billing work — do you charge in Naira or Dollars?',
        a: 'Checkout runs through Paystack in NGN. Pricing is shown in Naira across every plan, so there\'s no card-conversion guesswork or USD billing surprises for Nigerian and African creators.',
    },
    {
        q: 'What TTS voices are available, and are any of them free?',
        a: 'Edge TTS is free on every plan, including Free. Paid plans unlock premium SiliconFlow voices — CosyVoice2 for emotion-aware narration, Fish Speech 1.5 for natural multilingual delivery, and IndexTTS-2 for high-fidelity output.',
    },
    {
        q: 'Can I turn an existing blog post or article into a video script?',
        a: 'Yes — the Blog to Script tool ingests any article URL, crawls the text, and converts it into either a presenter-monologue script or a storytelling treatment, available from the Starter plan up.',
    },
    {
        q: 'Does Pilot Programme work for any YouTube niche?',
        a: 'Niche management is built into every plan, and the AI Content Generator surfaces trending topic ideas per niche — so whether you\'re running a folklore channel, a crime-drama channel, or a news-recap channel, the workflow is the same.',
    },
];

function FaqItem({ item, isOpen, onToggle }) {
    return (
        <div className="border-b border-gray-200 dark:border-white/10">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
            >
                <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {item.q}
                </span>
                <MdExpandMore
                    className={`w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-500' : ''}`}
                />
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}
                style={{ display: 'grid' }}
            >
                <div className="overflow-hidden">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pr-8">
                        {item.a}
                    </p>
                </div>
            </div>
        </div>
    );
}

function FaqSection() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="py-16 md:py-20 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/5">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
                        <MdHelpOutline className="w-4 h-4" />
                        Frequently Asked Questions
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                        Everything you're wondering before you start
                    </h2>
                </div>

                <div>
                    {FAQ_ITEMS.map((item, i) => (
                        <FaqItem
                            key={i}
                            item={item}
                            isOpen={openIndex === i}
                            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── Affiliate teaser ─────────────────────────────────────────────────────────
function AffiliateTeaser() {
    return (
        <section className="py-16 bg-gray-50 dark:bg-[#0d0d0d] border-y border-gray-200 dark:border-white/8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/10 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                        <MdShare className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-500 uppercase tracking-widest mb-2">
                            <MdGroup className="w-3.5 h-3.5" />
                            Affiliate Program
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1.5">
                            Know creators who'd use this? Earn recurring commission.
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get your referral link, track signups in real time, and get paid every time someone you refer subscribes — no cap on payouts.
                        </p>
                    </div>
                    <Link
                        href="/affiliate"
                        className="flex-shrink-0 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-red-600/15 hover:scale-105"
                    >
                        Become an Affiliate
                        <MdArrowForward className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ── Rotating Word Rotator ───────────────────────────────────────────────────
function RotatingWords() {
    const words = [
        "Faceless YouTube Channels",
        "Viral AI Video Scripts",
        "Blog to Script Videos",
        "Story to Screenplay Lab",
        "Realistic Voiceovers & Scenes",
        "YouTube Competitor Audits"
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % words.length);
                setFade(true);
            }, 300);
        }, 2600);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="inline-block relative min-w-[280px] sm:min-w-[420px] text-left">
            <span
                className={`inline-block bg-gradient-to-r from-red-500 via-purple-500 to-red-600 bg-clip-text text-transparent font-black transition-all duration-300 transform ${
                    fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
                }`}
            >
                {words[index]}
            </span>
        </span>
    );
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

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
                        <div className="inline-flex items-center gap-2 bg-red-600/10 dark:bg-red-600/20 backdrop-blur-sm border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide">
                            <MdAutoAwesome className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                            <span>Powered by Pilot Programme AI Engine</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
                            Automate & Scale Your <br className="hidden sm:inline" />
                            <RotatingWords />
                        </h1>

                        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto font-normal leading-relaxed">
                            Generate viral scripts with Gemini AI, synthesize human-like voiceovers, ingest any blog URL into video presentations, and audit competitor channel outliers.
                            <span className="block mt-2.5 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                                Complete faceless creator suite — No camera required, no video editing experience, no USD conversion surprises.
                            </span>
                        </p>

                        {/* Feature Badges with Crisp Vector Icons */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-3xl mx-auto">
                            {[
                                { label: "Gemini 2.5 Scripting", icon: MdAutoAwesome },
                                { label: "Edge-TTS & SiliconFlow Voices", icon: MdRecordVoiceOver },
                                { label: "Web Blog to Script", icon: MdDescription },
                                { label: "Nollywood & Hollywood Screenplays", icon: MdRocketLaunch },
                                { label: "YouTube Outlier Audits", icon: MdTrendingUp }
                            ].map((badge, idx) => {
                                const Icon = badge.icon;
                                return (
                                    <span key={idx} className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3.5 py-1.5 rounded-full text-gray-700 dark:text-gray-300">
                                        <Icon className="w-3.5 h-3.5 text-red-500" />
                                        {badge.label}
                                    </span>
                                );
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
                            <Link href="/get-started"
                                className="group bg-gradient-to-r from-red-600 via-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-8 py-3.5 rounded-xl text-sm sm:text-base font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <MdPlayArrow className="w-5 h-5 fill-white" />
                                Start Creating Free
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                            <Link href="/pricing"
                                className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 backdrop-blur-sm text-gray-800 dark:text-white px-8 py-3.5 rounded-xl text-sm sm:text-base font-bold uppercase tracking-wider border border-gray-300/40 dark:border-white/20 transition-all flex items-center justify-center"
                            >
                                View Pricing Plans
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <MdCheck className="w-3.5 h-3.5 text-green-500" />
                                <span>Free plan available</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MdCreditCard className="w-3.5 h-3.5 text-red-500" />
                                <span>Paystack (NGN) · Fast & Secure</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MdLock className="w-3.5 h-3.5 text-gray-400" />
                                <span>Instant Setup · No Spam</span>
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
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
                        <div className="text-center">
                            <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Pilot Programme is Powered By</p>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
                                Three industry leaders.{' '}
                                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
                                    One platform.
                                </span>
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                                Our integration with Google Cloud, Gemini AI, and PookieTech forms the technological backbone of our automated creation engine.
                            </p>
                        </div>

                        {/* POWERED BY CARDS: GOOGLE, GEMINI, POOKIETECH */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {/* Google Card */}
                            <div className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300 shadow-sm hover:shadow-xl group flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform">
                                        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                                            Infrastructure & Cloud
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 group-hover:text-blue-500 transition-colors">
                                            Google Cloud
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                                            High-performance cloud infrastructure providing sub-second low-latency processing, high-availability data storage, and global API reliability.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] font-bold text-blue-500">
                                    <span>Powered by Google</span>
                                    <span>⚡ 99.9% Uptime</span>
                                </div>
                            </div>

                            {/* Gemini AI Card */}
                            <div className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 shadow-sm hover:shadow-xl group flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center p-2 group-hover:scale-105 transition-transform overflow-hidden">
                                        <img src="/gemini-logo.png" alt="Google Gemini AI Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                                            Generative Intelligence
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 group-hover:text-purple-500 transition-colors">
                                            Google Gemini AI
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                                            Multimodal artificial intelligence powering deep script synthesis, visual scene prompt extraction, and structured storytelling logic.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] font-bold text-purple-500 dark:text-purple-400">
                                    <span>Gemini 2.5 Flash Engine</span>
                                    <span>✨ Multimodal AI</span>
                                </div>
                            </div>

                            {/* PookieTech Card */}
                            <div className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-red-500/40 transition-all duration-300 shadow-sm hover:shadow-xl group flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center p-2 group-hover:scale-105 transition-transform overflow-hidden">
                                        <img src="/pookietech.png" alt="PookieTech Systems Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                                            Proprietary Automation
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 group-hover:text-red-500 transition-colors">
                                            PookieTech Systems
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                                            Proprietary faceless video pipelines, audio synthesis orchestrators, YouTube competitor analysis, and automated channel growth tools.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] font-bold text-red-500">
                                    <span>PookieTech Core</span>
                                    <span>🚀 Automation Suite</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <BlogSection limit={3} />

                <FaqSection />

                <AffiliateTeaser />
            </div>
            <Footer />
        </>
    );
}