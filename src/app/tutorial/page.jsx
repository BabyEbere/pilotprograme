"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicSEO from '@/components/DynamicSEO';
import Breadcrumbs from '@/components/Breadcrumbs';

function TutorialsList() {
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    useEffect(() => {
        fetch(`${API_URL}/tutorials`)
            .then(r => r.json())
            .then(d => {
                if (d.success) setTutorials(d.tutorials || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-[#0a0a0a] min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Tutorials</p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                        Learn how to use Pilot Programme
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        Watch step-by-step guides on script writing, voiceovers generation, scene design, and direct YouTube metadata optimization.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : tutorials.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-gray-200 dark:border-white/8 rounded-2xl bg-gray-50 dark:bg-[#111111]/30">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No tutorials have been uploaded yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tutorials.map(t => (
                            <div key={t.id} className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden transition-all duration-300 hover:border-red-500/20 hover:shadow-xl hover:-translate-y-1 group">
                                <div className="aspect-video relative overflow-hidden bg-black">
                                    <iframe 
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${t.youtube_id}`}
                                        title={t.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-red-500 transition-colors">
                                        {t.title}
                                    </h3>
                                    {t.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                            {t.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function WrappedTutorials() {
    return (
        <>
            <DynamicSEO 
                pageSlug="tutorial"
                fallbackTitle="Video Tutorials — Pilot Programme"
                fallbackDescription="Learn how to automate your faceless YouTube workflow using Pilot Programme. View our step-by-step video tutorials and guides."
                fallbackKeywords="YouTube automation tutorials, Pilot Programme guides, faceless video automation, AI video creation"
                schemaType="WebPage"
            />
            <Navbar />
            <Breadcrumbs />
            <TutorialsList />
            <Footer />
        </>
    );
}
