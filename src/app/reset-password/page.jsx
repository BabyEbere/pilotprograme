"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Lock, Eye, EyeOff, AlertCircle, Play, CheckCircle } from 'lucide-react';

function StrengthBar({ password }) {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-green-500'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-gray-200/50 dark:bg-white/10'}`} />
                ))}
            </div>
            <p className={`text-[10px] ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-amber-400' : score === 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                {labels[score]}
            </p>
        </div>
    );
}

export default function ResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resetToken = (searchParams && searchParams.get('token')) || '';
    const email = (searchParams && searchParams.get('email')) || '';

    const [form, setForm] = useState({ password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    if (!resetToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a] px-4">
                <div className="text-center max-w-sm">
                    <p className="text-gray-600 dark:text-gray-500 dark:text-gray-400 text-sm mb-4">Invalid or expired reset link.</p>
                    <Link href="/forgot-password" className="text-red-500 hover:text-red-400 text-sm font-semibold">
                        Start over →
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
        if (form.password !== form.confirm) { setError('Passwords do not match'); return; }

        setLoading(true);
        try {
            const res = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_token: resetToken, new_password: form.password }),
            });
            const data = await res.json();
            if (data.success) {
                setDone(true);
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a] py-12 px-4">
            <div className="max-w-md w-full">

                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                        <div className="bg-red-600 rounded-xl p-2 shadow-md shadow-red-900/40">
                            <Play className="w-5 h-5 text-gray-900 dark:text-white fill-white" />
                        </div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">Pilot Programme</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">Set new password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {email ? `For ${email}` : 'Choose a strong password'}
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-8">
                    {done ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-green-500/15 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-7 h-7 text-green-500" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Password updated</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 mb-6">Your password has been changed. You can now sign in with your new password.</p>
                            <Link href="/login"
                                className="block w-full bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white py-2.5 rounded-xl text-sm font-semibold text-center transition-all shadow-md shadow-red-900/40"
                            >
                                Sign In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            {/* New password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(''); }}
                                        className="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                                        placeholder="Minimum 8 characters"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(s => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
                                    >
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <StrengthBar password={form.password} />
                            </div>

                            {/* Confirm */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={form.confirm}
                                        onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setError(''); }}
                                        className={`w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-[#1a1a1a] border rounded-xl text-gray-900 dark:text-white placeholder-gray-600 text-sm focus:outline-none transition-all
                                            ${form.confirm && form.confirm !== form.password
                                                ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/30'
                                                : form.confirm && form.confirm === form.password
                                                    ? 'border-green-500/40'
                                                    : 'border-gray-200 dark:border-white/10 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30'
                                            }`}
                                        placeholder="Re-enter your password"
                                    />
                                </div>
                                {form.confirm && form.confirm !== form.password && (
                                    <p className="mt-1 text-[11px] text-red-400">Passwords don't match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-900/40 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                            >
                                {loading ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>

                {!done && (
                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                            ← Back to sign in
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}