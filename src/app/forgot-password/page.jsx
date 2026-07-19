"use client";

import { useState } from 'react';
import Link from 'next/link';

import { Mail, AlertCircle, Play, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email,   setEmail]   = useState('');
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);
    const [sent,    setSent]    = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const res  = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/auth/forgot-password`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            const data = await res.json();

            if (data.success) {
                setSent(true);
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">

                {/* Logo + header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                        <div className="bg-red-600 rounded-xl p-2 shadow-md shadow-red-900/40">
                            <Play className="w-5 h-5 text-gray-900 dark:text-white fill-white" />
                        </div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">Pilot Programme</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">Forgot your password?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter your email and we'll send you a reset code
                    </p>
                </div>

                {/* Card */}
                <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-8">
                    {sent ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-green-500/15 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-7 h-7 text-green-500" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Check your inbox</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                                If <span className="text-gray-900 dark:text-white font-medium">{email}</span> is registered,
                                you'll receive a 6-digit reset code within a minute.
                                Check your spam folder if you don't see it.
                            </p>
                            <Link href={`/verify-reset-otp?email=${encodeURIComponent(email)}`}
                                className="block w-full bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white py-2.5 rounded-xl text-sm font-semibold text-center transition-all shadow-md shadow-red-900/40"
                            >
                                Enter Reset Code
                            </Link>
                            <button
                                onClick={() => { setSent(false); setEmail(''); }}
                                className="mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                Use a different email
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError(''); }}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                                        placeholder="your@email.com"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-900/40 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer links */}
                <div className="mt-6 flex items-center justify-between text-sm">
                    <Link href="/login"    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">← Back to sign in</Link>
                    <Link href="/register" className="text-red-500 hover:text-red-400 font-medium transition-colors">Create account</Link>
                </div>
            </div>
        </div>
    );
}
