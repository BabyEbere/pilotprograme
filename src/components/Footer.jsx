"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Play, Mail, Twitter, Youtube, Github } from 'lucide-react';

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
        const meta = PAGE_META[pathname] || { title: 'Pilot Programme — AI YouTube Automation', desc: 'AI-powered YouTube content creation — scripts, voiceovers, and images.' };
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
    return (
        <>
            <SEOUpdater />
            <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/8 text-gray-500 dark:text-gray-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <div className="grid md:grid-cols-4 gap-10 mb-10">

                        {/* Brand */}
                        <div className="md:col-span-1">
                            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
                                <img src="/pilotprograme-logo.jpg" alt="Pilot Programme Logo" className="w-8 h-8 rounded-lg shadow-md shadow-red-900/40 transition-transform duration-200 group-hover:scale-105 bg-black" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">Pilot Programme</span>
                            </Link>
                            <p className="text-xs leading-relaxed mb-5">
                                AI-powered YouTube automation for creators worldwide. Scripts, voiceovers, and images — in one platform.
                            </p>
                            <div className="flex gap-1">
                                {[
                                    { href: '#', Icon: Twitter, label: 'Twitter' },
                                    { href: '#', Icon: Youtube, label: 'YouTube' },
                                    { href: '#', Icon: Github, label: 'GitHub' },
                                    { href: '#', Icon: Mail, label: 'Email' },
                                ].map(({ href, Icon, label }) => (
                                    <a key={label} href={href} aria-label={label} className="p-2 rounded-lg text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:text-white hover:bg-gray-200/50 dark:bg-white/8 transition-colors">
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h3 className="text-gray-900 dark:text-white text-xs font-semibold mb-4 uppercase tracking-widest">Product</h3>
                            <ul className="space-y-2.5 text-xs">
                                {[['Features', '/features'], ['Pricing', '/pricing'], ['Affiliate Program', '/affiliate'], ['Documentation', '/documentation'], ['Changelog', '#'], ['Roadmap', '#']].map(([label, to]) => (
                                    <li key={label}><Link href={to} className="hover:text-gray-900 dark:text-white transition-colors">{label}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-gray-900 dark:text-white text-xs font-semibold mb-4 uppercase tracking-widest">Company</h3>
                            <ul className="space-y-2.5 text-xs">
                                {[['About', '/about'], ['Blog', '#'], ['Careers', '#'], ['Contact', '#']].map(([label, to]) => (
                                    <li key={label}><Link href={to} className="hover:text-gray-900 dark:text-white transition-colors">{label}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="text-gray-900 dark:text-white text-xs font-semibold mb-4 uppercase tracking-widest">Legal</h3>
                            <ul className="space-y-2.5 text-xs">
                                {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Cookie Policy', '/cookies'], ['Refund Policy', '/refund']].map(([label, to]) => (
                                    <li key={label}><Link href={to} className="hover:text-gray-900 dark:text-white transition-colors">{label}</Link></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-white/8 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-600 dark:text-gray-500">
                        <p>© {YEAR} Pilot Programme. All rights reserved.</p>
                        <p className="flex items-center gap-1.5">Made for YouTube creators worldwide <span className="text-red-500">♥</span></p>
                    </div>
                </div>
            </footer>
        </>
    );
}