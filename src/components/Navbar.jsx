"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { 
    Menu, 
    X, 
    ChevronDown, 
    Sparkles, 
    FileText, 
    Video, 
    Layers, 
    TrendingUp, 
    BookOpen, 
    Users, 
    Zap, 
    Sun, 
    Moon,
    Tv,
    DollarSign,
    Info,
    ArrowRight,
    PhoneCall
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null); // 'tools' | 'resources' | 'company' | null
    const [mobileAccordion, setMobileAccordion] = useState(null); // 'tools' | 'resources' | 'company' | null
    
    const pathname = usePathname();
    const { theme, toggleTheme, mounted } = useTheme();
    const navRef = useRef(null);

    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < 20) {
                setVisible(true);
                setScrolled(false);
            } else {
                setScrolled(true);
                if (currentScrollY > lastScrollY && currentScrollY > 70) {
                    setVisible(false);
                } else {
                    setVisible(true);
                }
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Close dropdowns on route change
    useEffect(() => { 
        setIsOpen(false);
        setActiveDropdown(null);
        setMobileAccordion(null);
    }, [pathname]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) =>
        path === '/' ? pathname === '/' : pathname.startsWith(path);

    const toolsItems = [
        {
            icon: Sparkles,
            title: "YouTube Script Engine",
            desc: "Generate viral faceless video scripts with AI Gemini 2.5 Flash",
            path: "/features",
            badge: "HOT"
        },
        {
            icon: FileText,
            title: "Blog to Script Converter",
            desc: "Convert webpage URLs into full presentation video scripts",
            path: "/features",
            badge: "NEW"
        },
        {
            icon: Video,
            title: "Story to Screenplay Lab",
            desc: "Nollywood & Hollywood film outline and script generator",
            path: "/features"
        },
        {
            icon: Layers,
            title: "AI Voice & Speech Library",
            desc: "Realistic voice cloning via Edge-TTS and SiliconFlow",
            path: "/features"
        },
        {
            icon: TrendingUp,
            title: "YouTube Analytics & Outliers",
            desc: "Track competitor channel outliers and daily video ideas",
            path: "/features"
        }
    ];

    const resourceItems = [
        {
            icon: Tv,
            title: "Video Tutorials",
            desc: "Step-by-step guides on using Pilot Programme tools",
            path: "/tutorial"
        },
        {
            icon: BookOpen,
            title: "Documentation",
            desc: "Complete documentation and platform guide",
            path: "/documentation"
        },
        {
            icon: Zap,
            title: "Blog & Guides",
            desc: "YouTube automation tips, strategy breakdown, and guides",
            path: "/blog",
            badge: "READ"
        },
        {
            icon: DollarSign,
            title: "Affiliate Program",
            desc: "Earn generous recurring commissions referring creators",
            path: "/affiliate"
        }
    ];

    const companyItems = [
        {
            icon: Info,
            title: "About Pilot Programme",
            desc: "Built for creators who want to build faceless channels fast",
            path: "/about"
        },
        {
            icon: DollarSign,
            title: "Plans & Pricing",
            desc: "Transparent pricing for creators at every growth stage",
            path: "/pricing"
        },
        {
            icon: PhoneCall,
            title: "Contact Us",
            desc: "Get in touch with support, make inquiries or partner requests",
            path: "/contact",
            badge: "24/7"
        }
    ];

    return (
        <nav 
            ref={navRef}
            className={`sticky top-0 z-50 transition-all duration-500 ease-in-out transform ${
                visible 
                    ? 'translate-y-0 opacity-100 pointer-events-auto' 
                    : '-translate-y-full opacity-0 pointer-events-none'
            } ${
                scrolled 
                    ? 'bg-white/85 dark:bg-[#0a0a0c]/85 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10 shadow-lg shadow-black/5' 
                    : 'bg-white/95 dark:bg-[#0a0a0c]/95 border-b border-transparent'
            }`}
        >
            {/* Top Red Ambient Accent Glow Line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-red-600 via-purple-600 to-red-500" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-13">

                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
                        <div className="relative">
                            <img 
                                src="/pilotprograme-logo.jpg" 
                                alt="Pilot Programme Logo" 
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 rounded-xl bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xs" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                            Pilot Programme
                            <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">
                                PRO
                            </span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link 
                            href="/"
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                                isActive('/')
                                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5'
                            }`}
                        >
                            Home
                        </Link>

                        {/* AI Tools & Features Dropdown */}
                        <div className="relative" onMouseLeave={() => setActiveDropdown(null)}>
                            <button
                                onMouseEnter={() => setActiveDropdown('tools')}
                                onClick={() => setActiveDropdown(activeDropdown === 'tools' ? null : 'tools')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                    activeDropdown === 'tools' || isActive('/features')
                                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5'
                                }`}
                            >
                                <span>AI Tools</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'tools' ? 'rotate-180 text-red-500' : ''}`} />
                            </button>

                            {/* Dropdown Panel */}
                            {activeDropdown === 'tools' && (
                                <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-[#111116]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 py-1 mb-1">
                                        Core Creation Engines
                                    </div>
                                    <div className="space-y-1">
                                        {toolsItems.map((item, idx) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link 
                                                    key={idx} 
                                                    href={item.path}
                                                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">
                                                                {item.title}
                                                            </span>
                                                            {item.badge && (
                                                                <span className="text-[9px] font-extrabold bg-red-500 text-white px-1.5 py-0.2 rounded uppercase">
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5 line-clamp-1">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
                                        <Link 
                                            href="/features"
                                            className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-red-500/5 transition-colors"
                                        >
                                            <span>Explore All Features & Architecture</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resources Dropdown */}
                        <div className="relative" onMouseLeave={() => setActiveDropdown(null)}>
                            <button
                                onMouseEnter={() => setActiveDropdown('resources')}
                                onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                    activeDropdown === 'resources' || isActive('/tutorial') || isActive('/documentation') || isActive('/blog')
                                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5'
                                }`}
                            >
                                <span>Resources</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180 text-red-500' : ''}`} />
                            </button>

                            {/* Dropdown Panel */}
                            {activeDropdown === 'resources' && (
                                <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-[#111116]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 py-1 mb-1">
                                        Guides & Learning
                                    </div>
                                    <div className="space-y-1">
                                        {resourceItems.map((item, idx) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link 
                                                    key={idx} 
                                                    href={item.path}
                                                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">
                                                                {item.title}
                                                            </span>
                                                            {item.badge && (
                                                                <span className="text-[9px] font-extrabold bg-purple-600 text-white px-1.5 py-0.2 rounded uppercase">
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5 line-clamp-1">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pricing */}
                        <Link 
                            href="/pricing"
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                                isActive('/pricing')
                                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5'
                            }`}
                        >
                            Pricing
                        </Link>

                        {/* About */}
                        <Link 
                            href="/about"
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                                isActive('/about')
                                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5'
                            }`}
                        >
                            About
                        </Link>
                    </div>

                    {/* Desktop CTA Action Group */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-all flex items-center justify-center border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                            aria-label="Toggle theme"
                            title={mounted ? (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : 'Toggle theme'}
                            suppressHydrationWarning
                        >
                            {mounted
                                ? (theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />)
                                : <span className="w-4 h-4 block" />}
                        </button>
                        
                        <Link 
                            href="/login"
                            className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3.5 py-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                            Sign In
                        </Link>

                        <Link 
                            href="/get-started"
                            className="relative group bg-gradient-to-r from-red-600 via-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-900/20 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                        >
                            <span>Get Started Free</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    {/* Mobile Toggle Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                            aria-label="Toggle theme"
                            suppressHydrationWarning
                        >
                            {mounted
                                ? (theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />)
                                : <span className="w-5 h-5 block" />}
                        </button>
                        
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Roll-Down Navigation Dropdown */}
            {isOpen && (
                <div className="md:hidden border-t border-gray-200/60 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-2xl transition-all duration-300 shadow-2xl shadow-black/20 animate-in slide-in-from-top-3 fade-in">
                    <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
                        
                        {/* Quick Hero Banner / Feature Pill inside Roll-Down */}
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500/10 via-purple-500/10 to-red-500/10 border border-red-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
                                <span className="text-xs font-bold text-gray-900 dark:text-white">PILOT PROGRAME AI</span>
                            </div>
                            <span className="text-[10px] font-extrabold uppercase bg-red-500 text-white px-2 py-0.5 rounded-full tracking-wider">
                                PRO ACTIVE
                            </span>
                        </div>

                        {/* Unique Grid Card Tiles */}
                        <div className="grid grid-cols-2 gap-2">
                            <Link 
                                href="/"
                                className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                                    isActive('/') 
                                        ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                                        : 'bg-gray-50 dark:bg-white/5 border-gray-200/60 dark:border-white/5 text-gray-800 dark:text-gray-200 hover:border-red-500/30'
                                }`}
                            >
                                <span className="text-xs font-bold uppercase tracking-wider">Home</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Main overview</span>
                            </Link>

                            <Link 
                                href="/features"
                                className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                                    isActive('/features') 
                                        ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                                        : 'bg-gray-50 dark:bg-white/5 border-gray-200/60 dark:border-white/5 text-gray-800 dark:text-gray-200 hover:border-red-500/30'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider">AI Features</span>
                                    <span className="text-[9px] font-bold bg-red-500 text-white px-1 rounded">HOT</span>
                                </div>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Scripts, Voice & Outliers</span>
                            </Link>
                        </div>

                        {/* Accordions */}
                        <div className="space-y-2">
                            {/* AI Creation Tools Accordion */}
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200/60 dark:border-white/5 overflow-hidden">
                                <button
                                    onClick={() => setMobileAccordion(mobileAccordion === 'tools' ? null : 'tools')}
                                    className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200"
                                >
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-red-500" /> AI Creation Tools
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'tools' ? 'rotate-180 text-red-500' : ''}`} />
                                </button>
                                {mobileAccordion === 'tools' && (
                                    <div className="p-2 space-y-1 border-t border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-black/20">
                                        {toolsItems.map((item, idx) => (
                                            <Link 
                                                key={idx}
                                                href={item.path}
                                                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <item.icon className="w-3.5 h-3.5 text-red-500" /> {item.title}
                                                </span>
                                                {item.badge && <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.2 rounded">{item.badge}</span>}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Resources Accordion */}
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200/60 dark:border-white/5 overflow-hidden">
                                <button
                                    onClick={() => setMobileAccordion(mobileAccordion === 'resources' ? null : 'resources')}
                                    className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200"
                                >
                                    <span className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-purple-500" /> Resources & Tutorials
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'resources' ? 'rotate-180 text-purple-500' : ''}`} />
                                </button>
                                {mobileAccordion === 'resources' && (
                                    <div className="p-2 space-y-1 border-t border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-black/20">
                                        {resourceItems.map((item, idx) => (
                                            <Link 
                                                key={idx}
                                                href={item.path}
                                                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-purple-500 transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <item.icon className="w-3.5 h-3.5 text-purple-500" /> {item.title}
                                                </span>
                                                {item.badge && <span className="text-[9px] font-bold bg-purple-600 text-white px-1.5 py-0.2 rounded">{item.badge}</span>}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Links Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <Link 
                                href="/pricing"
                                className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                                    isActive('/pricing') 
                                        ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                                        : 'bg-gray-50 dark:bg-white/5 border-gray-200/60 dark:border-white/5 text-gray-800 dark:text-gray-200 hover:border-red-500/30'
                                }`}
                            >
                                <span className="text-xs font-bold uppercase tracking-wider">Pricing</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Plans & Tiers</span>
                            </Link>

                            <Link 
                                href="/about"
                                className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                                    isActive('/about') 
                                        ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                                        : 'bg-gray-50 dark:bg-white/5 border-gray-200/60 dark:border-white/5 text-gray-800 dark:text-gray-200 hover:border-red-500/30'
                                }`}
                            >
                                <span className="text-xs font-bold uppercase tracking-wider">About</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Our Platform</span>
                            </Link>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 grid grid-cols-2 gap-2 border-t border-gray-200/60 dark:border-white/10">
                            <Link 
                                href="/login"
                                className="w-full text-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"
                            >
                                Sign In
                            </Link>
                            
                            <Link 
                                href="/get-started"
                                className="w-full text-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-red-500 shadow-md shadow-red-600/20"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
