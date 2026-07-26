"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import {
    MdDashboard,
    MdPeople,
    MdDescription,
    MdImage,
    MdAudiotrack,
    MdSettings,
    MdLogout,
    MdChevronLeft,
    MdChevronRight,
    MdMenu,
    MdClose,
    MdExpandMore,
    MdExpandLess,
    MdCategory,
    MdSearch,
    MdTrendingUp,
    MdEdit,
    MdVideoLibrary,
    MdAttachMoney,
    MdRecordVoiceOver,
    MdConfirmationNumber,
    MdVpnKey,
    MdCampaign,
    MdEmail,
    MdSupportAgent,
    MdOndemandVideo,
} from 'react-icons/md';

import { useNavigation } from '@/context/NavigationContext';
import { Loader2 } from 'lucide-react';

export default function AdminSidebar({ collapsed, setCollapsed }) {
    const pathname = usePathname();
    const { startNavigation, navigatingPath } = useNavigation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [contentDropdownOpen, setContentDropdownOpen] = useState(false);
    const [openTickets, setOpenTickets] = useState(0);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const adminData = JSON.parse(localStorage.getItem('admin') || '{}');

    // Fetch open ticket count for badge
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/admin/support/stats`, {
                    headers: { Authorization: `Bearer ${adminData.token}` },
                });
                const data = await res.json();
                if (data.success) setOpenTickets(data.open_tickets || 0);
            } catch { /* silent */ }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 60000); // refresh every 60s
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { icon: MdDashboard, label: 'Dashboard', path: '/control' },
        { icon: MdPeople, label: 'Users', path: '/control/users' },
        { icon: MdAttachMoney, label: 'Plans & Pricing', path: '/control/pricing' },
        { icon: MdRecordVoiceOver, label: 'Voices', path: '/control/voices' },
        { icon: MdVpnKey, label: 'API Keys', path: '/control/keys' },
        { icon: MdCategory, label: 'Niches', path: '/control/niches' },
        { icon: MdEmail, label: 'Marketing', path: '/control/marketing' },
        { icon: MdSettings, label: 'Settings', path: '/control/settings' },
        { icon: MdVideoLibrary, label: 'Story Lab', path: '/control/story-lab' },
        { icon: MdEdit, label: 'Story Lab Settings', path: '/control/story-lab-settings' },
        { icon: MdSearch, label: 'SEO Settings', path: '/control/seo-settings' },
        {
            icon: MdConfirmationNumber,
            label: 'Support',
            path: '/control/support',
            badge: openTickets > 0 ? openTickets : null,
        },
        { icon: MdAttachMoney, label: 'Affiliates', path: '/control/affiliates' },
        { icon: MdOndemandVideo, label: 'Upload Tutorial', path: '/control/tutorials' },
    ];

    const blogItems = [
        { icon: MdDescription, label: 'All Posts', path: '/control/blog' },
        { icon: MdCategory, label: 'Categories', path: '/control/blog/categories' },
    ];

    const researchItems = [
        { icon: MdVideoLibrary, label: 'YouTube Diagnostics', path: '/control/youtube-analyzer' },
        { icon: MdVideoLibrary, label: 'YouTube Hub', path: '/control/youtube' },
        { icon: MdSearch, label: 'Research Hub', path: '/control/research' },
        { icon: MdTrendingUp, label: 'AI Learning', path: '/control/ai-learning' },
        { icon: MdEdit, label: 'Prompt Mgmt', path: '/control/prompts' },
    ];

    const contentItems = [
        { icon: MdDescription, label: 'Scripts', path: '/control/scripts' },
    ];

    const isActive = (path) => pathname === path;
    const isContentActive = contentItems.some(item => pathname === item.path);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-gray-50 dark:bg-[#111111] p-2 rounded-lg shadow-lg border border-gray-200 dark:border-white/10"
            >
                {mobileOpen ? <MdClose className="w-5 h-5" /> : <MdMenu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`${collapsed ? 'w-16' : 'w-56'} bg-gray-100 dark:bg-[#1a1a1a] border-r border-gray-800 transition-all duration-300 flex flex-col h-screen sticky top-0
                    ${mobileOpen ? 'fixed inset-y-0 left-0 z-40' : 'hidden'} lg:flex`}
            >
                {/* Logo */}
                <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                    {!collapsed && (
                        <Link href="/control" className="flex items-center space-x-2">
                            <div className="bg-red-600 rounded-lg p-1.5">
                                <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Admin Panel</span>
                                <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400">Control Center</p>
                            </div>
                        </Link>
                    )}
                    {collapsed && (
                        <div className="bg-red-600 rounded-lg p-1.5 mx-auto">
                            <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const isNavigatingItem = navigatingPath === item.path;
                        return (
                            <Link key={item.path}
                                href={item.path}
                                onClick={() => {
                                    setMobileOpen(false);
                                    startNavigation(item.path, item.label);
                                }}
                                className={`relative flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'justify-start px-3.5 py-2.5'} gap-3 rounded-xl transition-all duration-200 ${active
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold border-l-2 border-red-500 rounded-l-none pl-3 shadow-[inset_1.5px_0_0_rgba(239,68,68,0.1)]'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white font-medium'
                                    }`}
                                title={collapsed ? item.label : ''}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {!collapsed && (
                                    <span className="text-xs font-semibold uppercase tracking-wider flex-1">{item.label}</span>
                                )}
                                {isNavigatingItem && (
                                    <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin ml-auto flex-shrink-0" />
                                )}
                                {/* Badge */}
                                {item.badge && !isNavigatingItem && (
                                    collapsed ? (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    ) : (
                                        <span className="ml-auto text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                    )
                                )}
                            </Link>
                        );
                    })}

                    {/* Blog Section */}
                    {!collapsed && (
                        <div className="px-4 pt-4 pb-1.5 mt-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                            Blog Content
                        </div>
                    )}
                    {blogItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const isNavigatingItem = navigatingPath === item.path;
                        return (
                            <Link key={item.path}
                                href={item.path}
                                onClick={() => {
                                    setMobileOpen(false);
                                    startNavigation(item.path, item.label);
                                }}
                                className={`flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'justify-start px-3.5 py-2.5'} gap-3 rounded-xl transition-all duration-200 ${active
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold border-l-2 border-red-500 rounded-l-none pl-3 shadow-[inset_1.5px_0_0_rgba(239,68,68,0.1)]'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white font-medium'
                                    }`}
                                title={collapsed ? item.label : ''}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {!collapsed && <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>}
                                {isNavigatingItem && (
                                    <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin ml-auto flex-shrink-0" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Intelligence Section */}
                    {!collapsed && (
                        <div className="px-4 pt-4 pb-1.5 mt-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                            Intelligence
                        </div>
                    )}
                    {researchItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const isNavigatingItem = navigatingPath === item.path;
                        return (
                            <Link key={item.path}
                                href={item.path}
                                onClick={() => {
                                    setMobileOpen(false);
                                    startNavigation(item.path, item.label);
                                }}
                                className={`flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'justify-start px-3.5 py-2.5'} gap-3 rounded-xl transition-all duration-200 ${active
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold border-l-2 border-red-500 rounded-l-none pl-3 shadow-[inset_1.5px_0_0_rgba(239,68,68,0.1)]'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white font-medium'
                                    }`}
                                title={collapsed ? item.label : ''}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {!collapsed && <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>}
                                {isNavigatingItem && (
                                    <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin ml-auto flex-shrink-0" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Contents Generated Dropdown */}
                    {!collapsed && (
                        <div className="space-y-1">
                            <button
                                onClick={() => setContentDropdownOpen(!contentDropdownOpen)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 ${isContentActive
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white font-medium'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <MdDescription className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Contents Generated</span>
                                </div>
                                {contentDropdownOpen
                                    ? <MdExpandLess className="w-4 h-4" />
                                    : <MdExpandMore className="w-4 h-4" />
                                }
                            </button>
                            {contentDropdownOpen && (
                                <div className="ml-4 mt-1.5 space-y-1 border-l border-gray-100 dark:border-white/5 pl-2">
                                    {contentItems.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.path);
                                        const isNavigatingItem = navigatingPath === item.path;
                                        return (
                                            <Link key={item.path}
                                                href={item.path}
                                                onClick={() => {
                                                    setMobileOpen(false);
                                                    startNavigation(item.path, item.label);
                                                }}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs ${active
                                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                            >
                                                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="flex-1">{item.label}</span>
                                                {isNavigatingItem && (
                                                    <Loader2 className="w-3 h-3 text-red-500 animate-spin ml-auto flex-shrink-0" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Settings */}
                <div className="p-3 border-t border-gray-800">
                    <Link href="/control/settings"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'justify-start px-3.5 py-2.5'} gap-3 rounded-xl transition-all duration-200 ${isActive('/control/settings')
                            ? 'bg-red-500/10 text-red-655 dark:text-red-400 font-bold border-l-2 border-red-500 rounded-l-none pl-3 shadow-[inset_1.5px_0_0_rgba(239,68,68,0.1)]'
                            : 'text-gray-550 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white font-medium'
                            }`}
                        title={collapsed ? 'Settings' : ''}
                    >
                        <MdSettings className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span className="text-xs font-semibold uppercase tracking-wider">Settings</span>}
                    </Link>
                </div>

                {/* Admin Profile */}
                <div className="p-2 border-t border-gray-800">
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:bg-[#1a1a1a] transition-colors cursor-pointer`}>
                        {!collapsed ? (
                            <>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-gray-900 dark:text-white text-xs font-semibold flex-shrink-0">
                                        A
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">Admin User</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 truncate">Administrator</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { localStorage.removeItem('admin'); window.location.href = '/login'; }}
                                    className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors flex-shrink-0"
                                    title="Logout"
                                >
                                    <MdLogout className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-gray-900 dark:text-white text-xs font-semibold">A</div>
                        )}
                    </div>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:block absolute -right-2.5 top-16 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-800 rounded-full p-1 shadow-sm hover:bg-gray-100 dark:bg-[#1a1a1a] transition-colors z-10"
                >
                    {collapsed
                        ? <MdChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                        : <MdChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                    }
                </button>
            </div>
        </>
    );
}