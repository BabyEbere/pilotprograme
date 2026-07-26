"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { 
    Mail, 
    Twitter, 
    Youtube, 
    Github, 
    Sparkles, 
    Send, 
    ShieldCheck, 
    ArrowRight, 
    CheckCircle2,
    Activity,
    ExternalLink
} from 'lucide-react';

const PAGE_META = {
    '/': { title: 'Pilot Programme — AI-Powered Faceless YouTube Automation', desc: 'Generate YouTube scripts, AI voiceovers, and scene images in one platform. Pilot Programme automates your entire faceless YouTube workflow.' },
    '/features': { title: 'Features — Pilot Programme', desc: 'Explore Pilot Programme\'s features: Gemini script generation, Edge TTS & SiliconFlow premium voices, FLUX image generation, and niche management.' },
    '/pricing': { title: 'Pricing — Pilot Programme', desc: 'Simple, transparent plans for every creator. Free tier available. Secure payment via Paystack (NGN). Upgrade anytime.' },
    '/about': { title: 'About — Pilot Programme', desc: 'Learn about Pilot Programme — the AI platform built to automate faceless YouTube content creation for creators worldwide.' },
    '/login': { title: 'Sign In — Pilot Programme', desc: 'Sign in to your Pilot Programme account and continue creating AI-powered YouTube content.' },
    '/register': { title: 'Create Account — Pilot Programme', desc: 'Start for free. Create your Pilot Programme account and generate your first AI YouTube script in minutes.' },
    '/documentation': { title: 'Documentation & Guide — Pilot Programme', desc: 'Detailed user documentation on how to use Pilot Programme to generate YouTube scripts, AI voiceovers, and scene images.' },
};

function SEOUpdater() {
    const pathname = usePathname();
    useEffect(() => {
        const meta = PAGE_META[pathname];
        if (!meta) return; // Respect server-rendered metadata on dynamic pages (like blog articles)
        
        document.title = meta.title;
        const set = (attr, key, content) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
            el.content = content;
        };
        set('name', 'description', meta.desc);
        set('name', 'robots', 'index, follow');
        set('property', 'og:title', meta.title);
        set('property', 'og:description', meta.desc);
        set('property', 'og:type', 'website');
        set('property', 'og:site_name', 'Pilot Programme');
        set('name', 'twitter:card', 'summary_large_image');
        set('name', 'twitter:title', meta.title);
        set('name', 'twitter:description', meta.desc);
    }, [pathname]);
    return null;
}

const YEAR = new Date().getFullYear();

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
    };

    return (
        <>
            <SEOUpdater />
            <footer className="relative bg-white dark:bg-[#08080a] border-t border-gray-200/80 dark:border-white/10 text-gray-600 dark:text-gray-400 overflow-hidden">
                {/* Top Glowing Neon Gradient Accent Bar */}
                <div className="h-[2px] w-full bg-gradient-to-r from-red-600 via-purple-600 to-red-500" />

                {/* Decorative Background Ambient Glows */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
                    
                    {/* Newsletter / Creator Updates Card */}
                    <div className="mb-16 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#111116] dark:via-[#16161c] dark:to-[#111116] border border-gray-200/80 dark:border-white/10 p-8 sm:p-10 rounded-3xl shadow-xl shadow-black/5 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="space-y-2 text-center lg:text-left max-w-xl">
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                <Sparkles className="w-3.5 h-3.5" />
                                Creator Intelligence
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                Stay ahead of the YouTube AI revolution
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Join 10,000+ faceless creators getting weekly prompt blueprints, niche trends, and platform feature releases directly to their inbox.
                            </p>
                        </div>

                        <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex-1 max-w-md">
                            {subscribed ? (
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in duration-300">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>You're subscribed! Welcome to Creator Intelligence.</span>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your creator email..."
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-red-600 via-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-600/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
                                    >
                                        <span>Subscribe</span>
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Columns Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
                        
                        {/* Brand Column */}
                        <div className="col-span-2">
                            <Link href="/" className="flex items-center gap-3 mb-4 group w-fit">
                                <div className="relative">
                                    <img 
                                        src="/pilotprograme-logo.jpg" 
                                        alt="Pilot Programme Logo" 
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105" 
                                    />
                                </div>
                                <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                                    Pilot Programme
                                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">
                                        AI
                                    </span>
                                </span>
                            </Link>

                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 max-w-sm">
                                The ultimate faceless YouTube automation platform. Generate viral Gemini scripts, human-like voiceovers, blog-to-script video presentations, and screenplay outlines in one seamless environment.
                            </p>

                            {/* Live System Operational Badge */}
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[11px] font-bold mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>PILOT PROGRAME SYSTEMS OPERATIONAL</span>
                            </div>

                            {/* Social Icons */}
                            <div className="flex items-center gap-2">
                                {[
                                    { href: 'https://twitter.com', Icon: Twitter, label: 'Twitter' },
                                    { href: 'https://youtube.com', Icon: Youtube, label: 'YouTube' },
                                    { href: 'https://github.com', Icon: Github, label: 'GitHub' },
                                    { href: 'mailto:support@pilotprograme.com', Icon: Mail, label: 'Email Support' },
                                ].map(({ href, Icon, label }) => (
                                    <a 
                                        key={label} 
                                        href={href} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label} 
                                        className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/30 transition-all hover:scale-105"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Column 1: AI Engines & Features */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                                AI Engines
                            </h4>
                            <ul className="space-y-2.5 text-xs">
                                {[
                                    ['YouTube Script Engine', '/features'],
                                    ['Blog to Script Ingest', '/features'],
                                    ['Story to Screenplay Lab', '/features'],
                                    ['AI Voiceover Synthesis', '/features'],
                                    ['FLUX Scene Generation', '/features'],
                                    ['YouTube Outlier Audits', '/features'],
                                ].map(([label, to]) => (
                                    <li key={label}>
                                        <Link href={to} className="hover:text-gray-900 dark:hover:text-white transition-colors hover:translate-x-0.5 inline-block">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 2: Resources & Guides */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-purple-500" />
                                Resources
                            </h4>
                            <ul className="space-y-2.5 text-xs">
                                {[
                                    ['Video Tutorials', '/tutorial'],
                                    ['Platform Guide & Docs', '/documentation'],
                                    ['YouTube Growth Blog', '/blog'],
                                    ['Affiliate Partner Program', '/affiliate'],
                                    ['Paystack NGN Billing', '/pricing'],
                                ].map(([label, to]) => (
                                    <li key={label}>
                                        <Link href={to} className="hover:text-gray-900 dark:hover:text-white transition-colors hover:translate-x-0.5 inline-block">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Company & Legal */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                Company & Legal
                            </h4>
                            <ul className="space-y-2.5 text-xs">
                                {[
                                    ['About Pilot Programme', '/about'],
                                    ['Contact Support & Inquiries', '/contact'],
                                    ['Pricing Plans & Tiers', '/pricing'],
                                    ['Sign In to Studio', '/login'],
                                    ['Create Free Account', '/register'],
                                    ['Privacy Policy', '/privacy'],
                                    ['Terms of Service', '/terms'],
                                ].map(([label, to]) => (
                                    <li key={label}>
                                        <Link href={to} className="hover:text-gray-900 dark:hover:text-white transition-colors hover:translate-x-0.5 inline-block">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Copyright Bar */}
                    <div className="pt-8 border-t border-gray-200/60 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            <p>© {YEAR} Pilot Programme. All rights reserved.</p>
                            <span className="hidden sm:inline text-gray-300 dark:text-white/20">|</span>
                            <a 
                                href="https://pookietech.com.ng" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[11px] font-bold text-gray-900 dark:text-white transition-all hover:scale-105"
                            >
                                <span className="text-gray-500 dark:text-gray-400 font-medium">POWERED BY</span>
                                <span className="text-red-500 group-hover:text-red-400 font-black tracking-wider uppercase">POOKIETECH</span>
                                <ExternalLink className="w-3 h-3 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
                            <span>·</span>
                            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</Link>
                            <span>·</span>
                            <Link href="/documentation" className="hover:text-gray-900 dark:hover:text-white transition-colors">Support & Docs</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}