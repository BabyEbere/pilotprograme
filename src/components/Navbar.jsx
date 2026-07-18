"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Menu, X, Play, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setIsOpen(false); }, [pathname]);

    const links = [
        { to: '/', label: 'Home' },
        { to: '/features', label: 'Features' },
        { to: '/pricing', label: 'Pricing' },
        { to: '/affiliate', label: 'Affiliate' },
        { to: '/about', label: 'About' },
        { to: '/documentation', label: 'Documentation' },
    ];

    const isActive = (path) =>
        path === '/' ? pathname === '/' : pathname.startsWith(path);

    return (
        <nav className={`sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 text-gray-900 dark:text-white border-b transition-all duration-300 ${
            scrolled ? 'border-gray-200 dark:border-white/10 shadow-xl shadow-black/5' : 'border-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
                        <img src="/pilotprograme-logo.jpg" alt="Pilot Programme Logo" className="w-8 h-8 rounded-lg shadow-md transition-transform duration-200 group-hover:scale-105" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                            Pilot Programme
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(({ to, label }) => (
                            <Link key={to}
                                href={to}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(to)
                                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10'
                                        : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-200/50 dark:bg-white/8'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-200/50 dark:bg-white/8 transition-all flex items-center justify-center"
                            aria-label="Toggle theme"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Link href="/login"
                            className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white px-3 py-2 transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link href="/get-started"
                            className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-red-900/10 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-200/50 dark:bg-white/8 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-200/50 dark:bg-white/8 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-white/8 bg-white dark:bg-[#0a0a0a]">
                    <div className="px-4 py-3 space-y-1">
                        {links.map(({ to, label }) => (
                            <Link key={to}
                                href={to}
                                className={`block py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${isActive(to)
                                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10'
                                        : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-200/50 dark:bg-white/8'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                        <div className="pt-2 pb-1 flex flex-col gap-2">
                            <Link href="/login"
                                className="block py-2.5 px-4 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-200/50 dark:bg-white/8 transition-colors text-center border border-gray-200 dark:border-white/10"
                            >
                                Sign in
                            </Link>
                            <Link href="/get-started"
                                className="block bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all text-center shadow-md shadow-red-900/10"
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
