"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import {
    MdDashboard,
    MdVideoLibrary,
    MdDescription,
    MdImage,
    MdAudiotrack,
    MdSettings,
    MdLogout,
    MdChevronLeft,
    MdChevronRight,
    MdMenu,
    MdClose,
    MdTrendingUp,
    MdPeople,
    MdMovie,
    MdMoreHoriz,
    MdBook,
    MdLink,
    MdLock,
    MdOndemandVideo,
    MdHelp
} from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [storyLabEnabled, setStoryLabEnabled] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const [sub, setSub] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    useEffect(() => {
        fetch(`${API_URL}/videos/status`)
            .then(r => r.json())
            .then(d => { if (d.success) setVideoEnabled(d.enabled); })
            .catch(() => {});
        
        fetch(`${API_URL}/admin/story/status`)
            .then(r => r.json())
            .then(d => { if (d.success) setStoryLabEnabled(d.enabled); })
            .catch(() => {});

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.id) {
            fetch(`${API_URL}/plans/my-subscription?user_id=${user.id}`, {
                headers: { 'Authorization': `Bearer ${user.token || ''}` }
            })
                .then(r => r.json())
                .then(d => {
                    if (d.success) {
                        setSub(d.subscription);
                    }
                    setLoadingPlan(false);
                })
                .catch(() => setLoadingPlan(false));
        } else {
            setLoadingPlan(false);
        }
    }, []);

    const isLocked = (label) => {
        if (loadingPlan) return false;
        if (label === 'YouTube Analyzer' || label === 'YT Analyzer') {
            return !sub || sub.max_youtube_analyzer === 0;
        }
        if (label === 'Blog to Script') {
            return !sub || sub.max_blog_to_script === 0;
        }
        if (label === 'Story to Script') {
            return !sub || sub.max_story_to_script === 0;
        }
        return false;
    };

    const topItems = [
        { icon: MdDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: MdVideoLibrary, label: 'Projects', path: '/dashboard/projects' },
        { icon: MdDescription, label: 'Scripts', path: '/dashboard/scripts' },
        { icon: MdTrendingUp, label: 'YouTube Analyzer', path: '/dashboard/youtube-analyzer' },
        ...(storyLabEnabled ? [{ icon: MdLink, label: 'Blog to Script', path: '/dashboard/blog-to-script' }] : []),
    ];

    const bottomItems = [
        { icon: MdTrendingUp, label: 'Subscriptions', path: '/dashboard/plans' },
        { icon: MdPeople, label: 'Affiliates', path: '/dashboard/affiliates' },
        { icon: MdImage, label: 'Images', path: '/dashboard/images' },
        { icon: MdAudiotrack, label: 'Audio', path: '/dashboard/audio' },
        ...(videoEnabled ? [{ icon: MdMovie, label: 'Videos', path: '/dashboard/videos' }] : []),
        { icon: MdOndemandVideo, label: 'Tutorials', path: '/dashboard/tutorial' },
        { icon: MdHelp, label: 'Support', path: '/dashboard/support' },
        { icon: MdBook, label: 'Documentation', path: '/documentation' },
        { icon: MdSettings, label: 'Settings', path: '/dashboard/settings' },
    ];

    const isActive = (path) => pathname === path;

    return (
        <>
            {/* Sidebar */}
            <div
                className={`${collapsed ? 'w-16' : 'w-56'
                    } bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-white/10 transition-all duration-300 flex flex-col h-screen sticky top-0 hidden lg:flex`}
            >
                {/* Logo */}
                <div className="p-3 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                    {!collapsed && (
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <img src="/pilotprograme-logo.jpg" alt="Pilot Programme" className="w-7 h-7 rounded-sm object-contain" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Pilot Programme</span>
                        </Link>
                    )}
                    {collapsed && (
                        <Link href="/dashboard" className="mx-auto block hover:opacity-80 transition-opacity">
                            <img src="/pilotprograme-logo.jpg" alt="Logo" className="w-7 h-7 rounded-sm object-contain" />
                        </Link>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {/* Render Top items */}
                    {topItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const locked = isLocked(item.label);

                        return (
                            <Link key={item.path}
                                href={locked ? '/dashboard/plans' : item.path}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'
                                    } gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${active
                                        ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white dark:bg-[#0a0a0a] hover:text-gray-900 dark:hover:text-gray-900 dark:text-white'
                                    } ${locked ? 'opacity-65' : ''}`}
                                title={collapsed ? item.label : ''}
                            >
                                <div className="relative flex items-center">
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {locked && collapsed && (
                                        <MdLock className="absolute -top-1 -right-1 w-2.5 h-2.5 text-amber-500 bg-white dark:bg-[#111111] rounded-full" />
                                    )}
                                </div>
                                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                                {locked && !collapsed && (
                                    <MdLock className="w-3.5 h-3.5 text-amber-500 ml-auto flex-shrink-0" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Movie Production category */}
                    {storyLabEnabled && (
                        <>
                            {!collapsed ? (
                                <div className="text-[9px] font-black text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 pt-3 pb-1 border-t border-gray-100 dark:border-white/5 mt-2">
                                    Movie Production
                                </div>
                            ) : (
                                <div className="border-t border-gray-100 dark:border-white/5 my-2" />
                            )}
                            {[
                                { icon: MdMovie, label: 'Story Writer', path: '/dashboard/story-writer' },
                                { icon: MdDescription, label: 'Story to Script', path: '/dashboard/story-to-script' }
                            ].map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                const locked = isLocked(item.label);
                                return (
                                    <Link key={item.path}
                                        href={locked ? '/dashboard/plans' : item.path}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'
                                            } gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${active
                                                ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'
                                                : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white dark:bg-[#0a0a0a] hover:text-gray-900 dark:hover:text-gray-900 dark:text-white'
                                            } ${locked ? 'opacity-65' : ''}`}
                                        title={collapsed ? item.label : ''}
                                    >
                                        <div className="relative flex items-center">
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            {locked && collapsed && (
                                                <MdLock className="absolute -top-1 -right-1 w-2.5 h-2.5 text-amber-500 bg-white dark:bg-[#111111] rounded-full" />
                                            )}
                                        </div>
                                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                                        {locked && !collapsed && (
                                            <MdLock className="w-3.5 h-3.5 text-amber-500 ml-auto flex-shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                            {!collapsed ? (
                                <div className="border-t border-gray-100 dark:border-white/5 pt-2 mt-1" />
                            ) : (
                                <div className="border-t border-gray-100 dark:border-white/5 my-2" />
                            )}
                        </>
                    )}

                    {/* Render Bottom items */}
                    {bottomItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link key={item.path}
                                href={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'
                                    } gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${active
                                        ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white dark:bg-[#0a0a0a] hover:text-gray-900 dark:hover:text-gray-900 dark:text-white'
                                    }`}
                                title={collapsed ? item.label : ''}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-2 border-t border-gray-200 dark:border-white/5">
                    <div
                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'
                            } gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white dark:bg-[#0a0a0a] transition-colors cursor-pointer`}
                    >
                        {!collapsed ? (
                            <>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-gray-900 dark:text-white text-xs font-semibold flex-shrink-0">
                                        {JSON.parse(localStorage.getItem('user') || '{}').full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                            {JSON.parse(localStorage.getItem('user') || '{}').full_name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            Free Plan
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white transition-colors flex-shrink-0 mr-2"
                                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                >
                                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('user');
                                        window.location.href = '/login';
                                    }}
                                    className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white transition-colors flex-shrink-0"
                                    title="Logout"
                                >
                                    <MdLogout className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-gray-900 dark:text-white text-xs font-semibold">
                                {JSON.parse(localStorage.getItem('user') || '{}').full_name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Toggle Button - Desktop Only */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:block absolute -right-2.5 top-16 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-full p-1 shadow-sm hover:bg-gray-50 dark:hover:bg-white dark:bg-[#0a0a0a] transition-colors z-10"
                >
                    {collapsed ? (
                        <MdChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                    ) : (
                        <MdChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                    )}
                </button>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#111111] border-t border-gray-200 dark:border-white/10 z-40 flex items-center justify-around px-4">
                {/* Dashboard */}
                <Link href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/dashboard') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white'}`}
                >
                    <MdDashboard className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Dashboard</span>
                </Link>

                {/* Scripts */}
                <Link href="/dashboard/scripts"
                    onClick={() => setMenuOpen(false)}
                    className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/dashboard/scripts') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white'}`}
                >
                    <MdDescription className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Scripts</span>
                </Link>

                {/* Audio */}
                <Link href="/dashboard/audio"
                    onClick={() => setMenuOpen(false)}
                    className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/dashboard/audio') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white'}`}
                >
                    <MdAudiotrack className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Audio</span>
                </Link>

                {/* Menu (3 Dots) */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`flex flex-col items-center justify-center gap-1 transition-colors ${menuOpen ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white'}`}
                >
                    <MdMoreHoriz className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Menu</span>
                </button>
            </div>

            {/* Mobile Popup Menu for remaining items */}
            {menuOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                        onClick={() => setMenuOpen(false)}
                    />
                    
                    {/* Menu Panel */}
                    <div className="fixed bottom-20 left-4 right-4 bg-white/95 dark:bg-[#111111]/95 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-50 lg:hidden animate-in slide-in-from-bottom-5 duration-200 max-h-[70vh] overflow-y-auto backdrop-blur-md">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Navigation</div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            {/* Projects */}
                            <Link href="/dashboard/projects"
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/projects') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'}`}
                            >
                                <MdVideoLibrary className="w-5 h-5 flex-shrink-0" />
                                <span className="text-xs font-semibold">Projects</span>
                            </Link>

                            {/* Images */}
                            <Link href="/dashboard/images"
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/images') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'}`}
                            >
                                <MdImage className="w-5 h-5 flex-shrink-0" />
                                <span className="text-xs font-semibold">Images</span>
                            </Link>

                            {/* Subscriptions */}
                            <Link href="/dashboard/plans"
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/plans') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'}`}
                            >
                                <MdTrendingUp className="w-5 h-5 flex-shrink-0" />
                                <span className="text-xs font-semibold">Plans</span>
                            </Link>

                            {/* YouTube Analyzer */}
                            <Link href={isLocked('YT Analyzer') ? '/dashboard/plans' : '/dashboard/youtube-analyzer'}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/youtube-analyzer') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'} ${isLocked('YT Analyzer') ? 'opacity-65' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <MdTrendingUp className="w-5 h-5 flex-shrink-0 text-red-500" />
                                    <span className="text-xs font-semibold">YT Analyzer</span>
                                </div>
                                {isLocked('YT Analyzer') && <MdLock className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                            </Link>

                            {/* Affiliates */}
                            <Link href="/dashboard/affiliates"
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/affiliates') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'}`}
                            >
                                <MdPeople className="w-5 h-5 flex-shrink-0" />
                                <span className="text-xs font-semibold">Affiliates</span>
                            </Link>

                            {/* Videos (Conditional) */}
                            {videoEnabled && (
                                <Link href="/dashboard/videos"
                                    onClick={() => setMenuOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/videos') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'}`}
                                >
                                    <MdMovie className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-xs font-semibold">Videos</span>
                                </Link>
                            )}

                            {/* Story Writer & Story to Script */}
                            {storyLabEnabled && (
                                <>
                                    <Link href={isLocked('Story Writer') ? '/dashboard/plans' : '/dashboard/story-writer'}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/story-writer') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'} ${isLocked('Story Writer') ? 'opacity-65' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MdMovie className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-xs font-semibold">Story Writer</span>
                                        </div>
                                        {isLocked('Story Writer') && <MdLock className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                                    </Link>
                                    <Link href={isLocked('Story to Script') ? '/dashboard/plans' : '/dashboard/story-to-script'}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/story-to-script') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'} ${isLocked('Story to Script') ? 'opacity-65' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MdDescription className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-xs font-semibold">Story to Script</span>
                                        </div>
                                        {isLocked('Story to Script') && <MdLock className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                                    </Link>
                                    <Link href={isLocked('Blog to Script') ? '/dashboard/plans' : '/dashboard/blog-to-script'}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/blog-to-script') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'} ${isLocked('Blog to Script') ? 'opacity-65' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MdLink className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-xs font-semibold">Blog to Script</span>
                                        </div>
                                        {isLocked('Blog to Script') && <MdLock className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                                    </Link>
                                </>
                            )}

                            {/* Tutorials */}
                            <Link href="/dashboard/tutorial"
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/tutorial') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'}`}
                            >
                                <MdOndemandVideo className="w-5 h-5 flex-shrink-0" />
                                <span className="text-xs font-semibold">Tutorials</span>
                            </Link>

                            {/* Support */}
                            <Link href="/dashboard/support"
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/support') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'}`}
                            >
                                <MdHelp className="w-5 h-5 flex-shrink-0" />
                                <span className="text-xs font-semibold">Support</span>
                            </Link>

                            {/* Settings */}
                            <Link href="/dashboard/settings"
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive('/dashboard/settings') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'}`}
                            >
                                <MdSettings className="w-5 h-5 flex-shrink-0" />
                                <span className="text-xs font-semibold">Settings</span>
                            </Link>

                            {/* Documentation */}
                            <Link href="/documentation"
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive('/documentation') ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'}`}
                            >
                                <MdBook className="w-5 h-5 flex-shrink-0" />
                                <span className="text-xs font-semibold">Docs</span>
                            </Link>
                        </div>
                        
                        {/* User Profile */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between px-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-gray-900 dark:text-white text-sm font-semibold flex-shrink-0">
                                    {JSON.parse(localStorage.getItem('user') || '{}').full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                        {JSON.parse(localStorage.getItem('user') || '{}').full_name || 'User'}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 truncate">Free Plan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleTheme}
                                    className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-200/50 dark:bg-white/8 transition-colors flex items-center justify-center"
                                    aria-label="Toggle theme"
                                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                >
                                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('user');
                                        window.location.href = '/login';
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
                                >
                                    <MdLogout className="w-3.5 h-3.5" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}