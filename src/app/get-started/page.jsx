"use client";

import Link from 'next/link';

import {
    MdPlayArrow, MdCheck, MdArrowForward,
    MdDescription, MdRecordVoiceOver, MdImage,
    MdAutoAwesome, MdBolt, MdFolder,
} from 'react-icons/md';

const STEPS = [
    {
        n: '01',
        icon: MdFolder,
        title: 'Create a niche',
        desc: 'Set up a niche for your channel. This groups all your scripts, audio, and images in one place.',
    },
    {
        n: '02',
        icon: MdDescription,
        title: 'Generate a script',
        desc: 'Pick a topic — or let the AI generator find trending ones. Gemini writes a full scene-by-scene script in seconds.',
    },
    {
        n: '03',
        icon: MdRecordVoiceOver,
        title: 'Produce voiceover audio',
        desc: 'Choose a voice — Edge TTS (free) or a SiliconFlow premium model. Generate audio per scene or all at once.',
    },
    {
        n: '04',
        icon: MdImage,
        title: 'Generate scene images',
        desc: 'Each scene gets a matching AI image via FLUX. Download all images and assemble your video.',
    },
];

const INCLUDED = [
    { icon: MdDescription, label: 'Gemini AI scripts', free: true },
    { icon: MdRecordVoiceOver, label: 'Edge TTS voiceover', free: true },
    { icon: MdFolder, label: 'Niche management', free: true },
    { icon: MdAutoAwesome, label: 'AI content generator', free: false },
    { icon: MdImage, label: 'Scene image generation', free: false },
    { icon: MdBolt, label: 'Premium SiliconFlow voices', free: false },
];

export default function GetStarted() {
    return (
        <div className="bg-white dark:bg-[#0a0a0a] min-h-screen">

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden py-24 md:py-32">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-red-600/8 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-full text-xs font-medium mb-8">
                        <MdAutoAwesome className="w-4 h-4" />
                        Free plan — no card required
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
                        Ready to create your
                        <span className="block bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent">
                            first AI video?
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
                        Sign up, create a niche, generate a script and audio — all in your first session.
                        No credit card, no tutorials, no friction.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                        <Link href="/register"
                            className="group bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-8 py-3.5 rounded-lg text-base font-semibold transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-red-900/60"
                        >
                            <MdPlayArrow className="w-5 h-5" />
                            Create Free Account
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                        <Link href="/pricing"
                            className="bg-gray-200/50 dark:bg-white/8 hover:bg-gray-300/50 dark:bg-white/15 backdrop-blur-sm border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white px-8 py-3.5 rounded-lg text-base font-medium transition-all flex items-center justify-center gap-2 hover:border-white/25"
                        >
                            Compare Plans
                            <MdArrowForward className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600 dark:text-gray-500">
                        <div className="flex items-center gap-1.5"><MdCheck className="w-3.5 h-3.5 text-green-500" /> No credit card</div>
                        <div className="flex items-center gap-1.5"><MdCheck className="w-3.5 h-3.5 text-green-500" /> Free plan never expires</div>
                        <div className="flex items-center gap-1.5"><MdCheck className="w-3.5 h-3.5 text-green-500" /> Upgrade anytime</div>
                    </div>
                </div>
            </section>

            {/* ── How it works ──────────────────────────────────────────────── */}
            <section className="py-20 bg-gray-50 dark:bg-[#111111] border-y border-gray-200 dark:border-white/8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-14">
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">How it works</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Four steps to your first video</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <div key={i} className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/8 rounded-2xl p-6 hover:border-red-500/20 transition-all group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-3xl font-black text-gray-900 dark:text-white/10 leading-none">{step.n}</span>
                                        <div className="w-9 h-9 bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/25 transition-colors">
                                            <Icon className="w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── What's in the free plan ───────────────────────────────────── */}
            <section className="py-20 bg-white dark:bg-[#0a0a0a]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Free plan</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">What you get for free</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">2 scripts + 2 audio renders per month · forever</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
                        {INCLUDED.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className={`flex items-center justify-between px-6 py-4 ${i < INCLUDED.length - 1 ? 'border-b border-white/5' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.free ? 'bg-red-500/10 dark:bg-red-500/15' : 'bg-gray-200 dark:bg-white/5'}`}>
                                            <Icon className={`w-3.5 h-3.5 ${item.free ? 'text-red-500' : 'text-gray-900 dark:text-white/20'}`} />
                                        </div>
                                        <span className={`text-sm ${item.free ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white/25'}`}>{item.label}</span>
                                    </div>
                                    {item.free
                                        ? <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">Included</span>
                                        : <span className="text-xs text-gray-900 dark:text-white/20 bg-gray-200 dark:bg-white/5 px-2.5 py-1 rounded-full">Paid plans</span>
                                    }
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-center text-xs text-gray-600 dark:text-gray-500 mt-4">
                        Want everything unlocked?{' '}
                        <Link href="/pricing" className="text-red-500 hover:text-red-400 font-semibold">
                            View paid plans →
                        </Link>
                    </p>
                </div>
            </section>

            {/* ── Final CTA ────────────────────────────────────────────────── */}
            <section className="py-20 bg-gray-50 dark:bg-[#111111] border-t border-gray-200 dark:border-white/8">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                        Start your first script now
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-500 dark:text-gray-400 mb-10 font-normal">
                        Takes 2 minutes to set up. First script is free.
                    </p>
                    <Link href="/register"
                        className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-10 py-3.5 rounded-lg text-base font-semibold transition-all shadow-lg shadow-red-900/40 hover:scale-105"
                    >
                        <MdPlayArrow className="w-5 h-5" />
                        Get Started Free
                    </Link>
                </div>
            </section>
        </div>
    );
}