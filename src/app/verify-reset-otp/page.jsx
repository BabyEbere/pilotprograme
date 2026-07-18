"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { AlertCircle, Play, RefreshCw } from 'lucide-react';

function VerifyResetOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromState = (searchParams && searchParams.get('email')) || '';

    const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
    const [email,     setEmail]     = useState('');
    const [error,     setError]     = useState('');

    useEffect(() => {
        if (emailFromState) {
            setEmail(emailFromState);
        }
    }, [emailFromState]);
    const [loading,   setLoading]   = useState(false);
    const [resending, setResending] = useState(false);
    const [resent,    setResent]    = useState(false);
    const [countdown, setCountdown] = useState(0);

    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleOtpChange = (i, val) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        setError('');
        if (val && i < 5) inputRefs.current[i + 1]?.focus();
        // Auto-submit when all 6 filled
        if (val && i === 5 && next.every(d => d)) {
            handleVerify(next.join(''));
        }
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            const arr = pasted.split('');
            setOtp(arr);
            inputRefs.current[5]?.focus();
            handleVerify(pasted);
        }
    };

    const handleVerify = async (code) => {
        if (!email) { setError('Email is missing. Go back and try again.'); return; }
        setLoading(true);
        setError('');
        try {
            const res  = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/auth/verify-reset-otp`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, otp: code }),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.reset_token)}`);
            } else {
                setError(data.message || 'Incorrect code. Please try again.');
                setOtp(['', '', '', '', '', '']);
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setResending(true);
        setError('');
        try {
            const res  = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/auth/forgot-password`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setResent(true);
                setCountdown(60);
                setOtp(['', '', '', '', '', '']);
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            } else {
                setError(data.message || 'Could not resend. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setResending(false);
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">Enter reset code</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        We sent a 6-digit code to{' '}
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{email || 'your email'}</span>
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-5">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {resent && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm mb-5">
                            New code sent — check your inbox.
                        </div>
                    )}

                    {/* OTP input boxes */}
                    <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleOtpChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`w-11 h-13 text-center text-xl font-bold bg-gray-100 dark:bg-[#1a1a1a] border rounded-xl text-gray-900 dark:text-white transition-all focus:outline-none
                                    ${digit ? 'border-red-500/60' : 'border-gray-200 dark:border-white/10'}
                                    focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30`}
                                style={{ height: '52px' }}
                                disabled={loading}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => handleVerify(otp.join(''))}
                        disabled={loading || otp.some(d => !d)}
                        className="w-full bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-900/40 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>

                    {/* Resend */}
                    <div className="mt-5 text-center">
                        <button
                            onClick={handleResend}
                            disabled={resending || countdown > 0}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                            {countdown > 0 ? `Resend in ${countdown}s` : "Didn't receive it? Resend"}
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                        ← Use a different email
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyResetOTP() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a] text-white">Loading verification...</div>}>
            <VerifyResetOTPContent />
        </Suspense>
    );
}
