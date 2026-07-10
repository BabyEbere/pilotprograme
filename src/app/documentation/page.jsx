"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


import React, { useState } from 'react';
import Link from 'next/link';

import {
    MdMenu,
    MdBook,
    MdExtension,
    MdSettings,
    MdArrowForward,
    MdDashboard,
    MdDescription,
    MdImage,
    MdAudiotrack,
    MdVideoLibrary,
    MdPeople,
    MdMovie
} from 'react-icons/md';

function Documentation() {
    const [activeSection, setActiveSection] = useState('getting-started');

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Use Pilot Programme for Faceless YouTube Video Automation",
        "description": "Learn how to automate your faceless YouTube channel workflow, generate scripts, create AI voiceovers, and render custom scene images.",
        "image": typeof window !== 'undefined' ? `${window.location.origin}/pilotprograme-logo.jpg` : '',
        "step": [
            {
                "@type": "HowToStep",
                "name": "Choose a Niche",
                "text": "Select a content category (Niche) with optimized instructions for high retention and viral potential.",
                "url": typeof window !== 'undefined' ? `${window.location.origin}/documentation#getting-started` : ''
            },
            {
                "@type": "HowToStep",
                "name": "Generate a Script",
                "text": "Use the two-step Blueprint and Draft generator to create a structured hook, story arcs, and full script narrative.",
                "url": typeof window !== 'undefined' ? `${window.location.origin}/documentation#script-generator` : ''
            },
            {
                "@type": "HowToStep",
                "name": "Create AI Voiceovers",
                "text": "Convert script text to voice using Microsoft Edge TTS (Standard) or advanced AI scene-by-scene generators (Premium).",
                "url": typeof window !== 'undefined' ? `${window.location.origin}/documentation#audio-generation` : ''
            },
            {
                "@type": "HowToStep",
                "name": "Generate Visual Assets",
                "text": "Render custom illustration or photo backdrops directly from visual scene prompts mapped to each script part.",
                "url": typeof window !== 'undefined' ? `${window.location.origin}/documentation#image-generation` : ''
            },
            {
                "@type": "HowToStep",
                "name": "Produce & Download Video",
                "text": "Combine script voiceovers and custom visual scene images into finished MP4 video drafts for your YouTube channel.",
                "url": typeof window !== 'undefined' ? `${window.location.origin}/documentation#video-rendering` : ''
            }
        ]
    };

    const faqSchemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is Pilot Programme?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Pilot Programme is an AI-powered YouTube automation platform that helps creators generate video concepts, write structured scripts using a two-step blueprint/draft process, generate realistic AI voiceovers, and render matching scene visual assets."
                }
            },
            {
                "@type": "Question",
                "name": "How does script extension work?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can extend scripts by adding consecutive parts. The system prompts you with the settings used in previous parts to ensure tone and voiceover consistency across the entire episode."
                }
            },
            {
                "@type": "Question",
                "name": "What voice providers are supported?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The platform supports Microsoft Edge TTS and Google TTS for Standard voiceovers, and premium engines for ultra-realistic, expressive scene-by-scene voiceovers."
                }
            }
        ]
    };

    const sections = {
        'getting-started': {
            title: 'Getting Started',
            icon: MdBook,
            content: (
                <div className="space-y-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Welcome to the Pilot Programme user guide. This platform is designed to automate the entire creation workflow for faceless YouTube videos. By leveraging state-of-the-art AI architectures, you can take a video concept from a simple idea to a fully produced script, professional voiceover, and custom scene images in just a few minutes. Check out our <Link href="/features" className="text-purple-600 dark:text-purple-400 hover:underline">detailed features list</Link> or view our <Link href="/pricing" className="text-purple-600 dark:text-purple-400 hover:underline">pricing plans</Link> to get started.
                    </p>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h3 className="text-gray-900 dark:text-white text-sm font-bold flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs flex items-center justify-center font-bold">1</span>
                            Choose a Niche
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                            Start by choosing a content category (Niche). Each niche has customized AI instructions optimized for high retention and viral potential. Explore our available niches on the <Link href="/features" className="text-purple-600 dark:text-purple-400 hover:underline">Features page</Link>.
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h3 className="text-gray-900 dark:text-white text-sm font-bold flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs flex items-center justify-center font-bold">2</span>
                            Draft a Script
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                            Generate scripts automatically or provide a custom brief. Extend scripts into consecutive parts (e.g. Part 1, Part 2) to build multi-minute stories or episodic series. Learn more in the Script Editor guide below.
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h3 className="text-gray-900 dark:text-white text-sm font-bold flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs flex items-center justify-center font-bold">3</span>
                            Render Audio & Visuals
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                            Convert narration texts into ultra-realistic AI voiceovers and render relevant images to establish the visual assets for your video scenes.
                        </p>
                    </div>
                </div>
            )
        },
        'script-generator': {
            title: 'Script Generator & Editor',
            icon: MdDescription,
            content: (
                <div className="space-y-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        The script generator utilizes a two-step logic (Blueprint & Draft) to guarantee that briefs are followed logically with solid structural hooks and conversational narrator voiceovers. Compare generator capabilities across our tier levels in the <Link href="/pricing" className="text-purple-600 dark:text-purple-400 hover:underline">pricing structure</Link>.
                    </p>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Two-Step Generation Logic</h4>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 leading-relaxed">
                            <li><strong>Step 1 (Blueprint):</strong> The AI creates a structural architecture outlining hook style (e.g. spec bomb, core dilemma), story arcs, emotional targets, and key scenes to keep viewers engaged. Learn how we optimize for viral mechanics in the <Link href="/features" className="text-purple-600 dark:text-purple-400 hover:underline">Features section</Link>.</li>
                            <li><strong>Step 2 (Draft):</strong> The writer drafts the full script content at a spoken 6th-grade reading level using human contractions and avoiding generic AI-isms.</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Extending Your Scripts</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                            You can build longer videos dynamically by chaining extensions together:
                        </p>
                        <ul className="list-decimal list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 leading-relaxed">
                            <li>Click <strong>Extend Script</strong> in the modifications sidebar.</li>
                            <li>Choose the <strong>AI Continuation</strong> tab, provide custom instructions on what should happen next, select a desired tone, and choose the number of scenes (3, 4, 5, 8, or 10) to add.</li>
                            <li>Alternatively, use <strong>Write Manually</strong> to append a blank section and draft the narration yourself.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        'audio-generation': {
            title: 'AI Voiceovers (TTS)',
            icon: MdAudiotrack,
            content: (
                <div className="space-y-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Convert your script's narration sections into professional spoken voiceovers. You can render audio separately for each script Part to maintain clean segmentation and download individual mp3 files. Learn how to configure these systems on the <Link href="/about" className="text-purple-600 dark:text-purple-400 hover:underline">About page</Link>.
                    </p>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Voice Providers</h4>
                        <div className="grid sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl">
                                <span className="text-purple-600 dark:text-purple-400 font-bold block mb-1">Standard Voices</span>
                                <p className="text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">Fast and reliable text-to-speech utilizing Microsoft Edge TTS or Google TTS engines.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl">
                                <span className="text-amber-600 dark:text-amber-400 font-bold block mb-1">Premium Voices</span>
                                <p className="text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">Ultra-realistic, expressive voiceovers powered by advanced AI models. Generates audio scene-by-scene. Details can be found in our <Link href="/features" className="text-purple-600 dark:text-purple-400 hover:underline">Features summary</Link>.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Voice Consistency Memory</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                            When generating voiceovers for subsequent parts (Part 2+), the system detects the exact voice settings, provider, and speed used in Part 1. A warning reminder is shown, allowing you to click "Apply Part 1 Settings" to quickly match the tone and speed of previous sections.
                        </p>
                    </div>
                </div>
            )
        },
        'image-generation': {
            title: 'Scene Visuals & Prompts',
            icon: MdImage,
            content: (
                <div className="space-y-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Each scene in Part 1 contains a visual prompt area describing the imagery that matches the narrator's text. You can use these descriptions to render custom illustration or photo-style backdrops for your videos. Review all custom model details in our <Link href="/features" className="text-purple-600 dark:text-purple-400 hover:underline">Features list</Link>.
                    </p>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Generating Images</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                            Navigate to the Image Generation interface. The tool pulls scene prompts directly from your active scripts. You can choose output sizes (landscape, portrait, square) and generate beautiful assets aligned with the narrative flow of your script.
                        </p>
                    </div>
                </div>
            )
        },
        'video-rendering': {
            title: 'Video Production',
            icon: MdMovie,
            content: (
                <div className="space-y-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        For niches with Video production enabled, you can combine the generated voiceover audio and visual scene assets into a single cohesive video. Learn about the creators behind the platform on our <Link href="/about" className="text-purple-600 dark:text-purple-400 hover:underline">About page</Link>.
                    </p>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Workflow Integration</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                            Once your script has a finalized voiceover and the scene visual prompts are successfully rendered as image assets, the platform coordinates these components to generate a final MP4 draft, ready for download and upload directly to YouTube.
                        </p>
                    </div>
                </div>
            )
        },
        'affiliates': {
            title: 'Affiliate Program',
            icon: MdPeople,
            content: (
                <div className="space-y-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Earn passive income by sharing the platform. The built-in Affiliate system tracks referrals and pays commissions on successful subscriptions. Learn all requirements and guidelines on our dedicated <Link href="/affiliate" className="text-purple-600 dark:text-purple-400 hover:underline">Affiliate details page</Link>.
                    </p>
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm">How it Works</h4>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 leading-relaxed">
                            <li>Visit the <strong>Affiliates</strong> tab to copy your unique referral link.</li>
                            <li>Share the link on social media, blogs, or YouTube videos.</li>
                            <li>When a user registers and pays for any premium plan using your referral link, you receive a direct percentage commission. Compare plan payouts on the <Link href="/pricing" className="text-purple-600 dark:text-purple-400 hover:underline">Pricing page</Link>.</li>
                            <li>Track your referred clicks, registrations, active subscriptions, and pending payouts directly on the dashboard.</li>
                        </ul>
                    </div>
                </div>
            )
        }
    };

    return (
        <div className="bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(faqSchemaData)}
            </script>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Documentation</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">Platform Guide</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 font-normal max-w-xl mx-auto leading-relaxed">
                        Learn how to use Pilot Programme to generate viral faceless content, manage scripts, create AI audio voiceovers, and generate custom images.
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-1">
                        {Object.keys(sections).map((key) => {
                            const SectionIcon = sections[key].icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveSection(key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                                        activeSection === key
                                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400 shadow-md'
                                            : 'bg-gray-50 dark:bg-[#111111] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-200 dark:border-white/10 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <SectionIcon className="w-4 h-4 flex-shrink-0" />
                                    <span>{sections[key].title}</span>
                                </button>
                            );
                        })}

                        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-white/5">
                            <Link href="/get-started"
                                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white transition-all shadow-lg shadow-red-950/20"
                            >
                                <span>Get Started Free</span>
                                <MdArrowForward className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
                        <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                            {(() => {
                                const ActiveIcon = sections[activeSection].icon;
                                return <ActiveIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
                            })()}
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {sections[activeSection].title}
                            </h2>
                        </div>

                        <div>
                            {sections[activeSection].content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function WrappedDocumentation(props) {
    return (
        <>
            <Navbar />
            <Documentation {...props} />
            <Footer />
        </>
    );
}
