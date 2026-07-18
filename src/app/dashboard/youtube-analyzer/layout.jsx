"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    BarChart3, Users2, Search, ArrowLeft, Menu, X, Youtube, Award, Compass, LayoutDashboard, Sparkles
} from 'lucide-react';

export default function YouTubeAnalyzerLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { id: 'overview', label: 'Creator Overview', path: '/dashboard/youtube-analyzer', icon: BarChart3 },
        { id: 'feed', label: 'Optimization Feed', path: '/dashboard/youtube-analyzer/feed', icon: Compass },
        { id: 'suggestions', label: 'Daily Suggestions', path: '/dashboard/youtube-analyzer/suggestions', icon: Sparkles },
        { id: 'competitors', label: 'Competitor Tracker', path: '/dashboard/youtube-analyzer/competitors', icon: Users2 },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#0d0d11] border-r border-white/5 text-gray-400">
            {/* Logo area */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <div className="w-9 h-9 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500">
                    <Youtube className="w-5 h-5 fill-red-500" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">Creator Studio</h2>
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-none mt-0.5">YouTube Analyzer</p>
                </div>
            </div>

            {/* Menu options */}
            <nav className="flex-1 px-4 py-6 space-y-1.5">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            href={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                                isActive
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-sm shadow-red-500/5'
                                    : 'border-transparent hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Back link */}
            <div className="p-4 border-t border-white/5 space-y-1.5">
                <Link
                    href="/dashboard"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border border-transparent hover:bg-white/5 hover:text-white transition-all"
                >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    <span>Main Dashboard</span>
                </Link>
                <button
                    onClick={() => router.back()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border border-transparent hover:bg-white/5 hover:text-white transition-all text-left"
                >
                    <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                    <span>Go Back</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#07070a] text-white overflow-hidden transition-colors duration-300">
            {/* Desktop Sidebar (Left side) */}
            <aside className={`hidden md:block w-64 flex-shrink-0 transition-all duration-300`}>
                {sidebarContent}
            </aside>

            {/* Mobile Drawer (Overlay backdrop) */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
                    <div className="relative w-64 max-w-xs h-full bg-[#0d0d11]">
                        <button 
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        {sidebarContent}
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Responsive Header */}
                <header className="bg-[#0d0d11]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-2 -ml-2 bg-white/5 hover:bg-white/10 rounded-lg text-white md:hidden"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-wider text-white">YouTube Analyzer</h1>
                            <p className="text-[10px] text-gray-500 leading-none mt-0.5">Grow your YouTube content strategically with Gemini AI</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Status bar */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            Live Sync
                        </div>
                    </div>
                </header>

                {/* Sub-route Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl w-full mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
