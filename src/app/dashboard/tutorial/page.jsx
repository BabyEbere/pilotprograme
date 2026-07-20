"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Play, BookOpen, Video, HelpCircle } from 'lucide-react';
import Toast from '@/components/Toast';

export default function UserTutorials() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMsg, setToastMsg] = useState(null);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    useEffect(() => {
        fetchTutorials();
    }, []);

    const fetchTutorials = async () => {
        try {
            const res = await fetch(`${API_URL}/tutorials`);
            const d = await res.json();
            if (d.success) {
                setTutorials(d.tutorials || []);
            } else {
                setToastMsg({ type: 'error', message: d.message || 'Failed to fetch tutorials.' });
            }
        } catch {
            setToastMsg({ type: 'error', message: 'Error loading tutorials.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            
            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/5 sticky top-0 z-10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Video className="w-5 h-5 text-red-500" />
                                Video Tutorials
                            </h1>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Learn how to maximize your automation speed and master our tools.</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-6 max-w-7xl mx-auto space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-32">
                            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : tutorials.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-gray-200 dark:border-white/8 rounded-3xl bg-gray-50/50 dark:bg-[#111111]/10 flex flex-col items-center justify-center space-y-4">
                            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">No tutorials found</h3>
                                <p className="text-xs text-gray-500 mt-1">Our team hasn't uploaded any video guides yet. Check back soon!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tutorials.map(t => (
                                <div key={t.id} className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:border-red-500/25 hover:-translate-y-1 group">
                                    <div className="aspect-video bg-black relative">
                                        <iframe 
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${t.youtube_id}`}
                                            title={t.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug group-hover:text-red-500 transition-colors">
                                            {t.title}
                                        </h3>
                                        {t.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">
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

            {toastMsg && <Toast type={toastMsg.type} message={toastMsg.message} onClose={() => setToastMsg(null)} />}
        </div>
    );
}
