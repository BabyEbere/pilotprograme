"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '@/components/GoogleAuthProvider';

import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    AlertCircle, 
    ShieldCheck, 
    Sparkles, 
    Globe, 
    Check, 
    Loader2, 
    ArrowRight,
    Radio
} from 'lucide-react';
import Loader from '@/components/Loader';
import DynamicSEO from '@/components/DynamicSEO';

// Fallback showcase images when database has no public generated images yet
const FALLBACK_SHOWCASE = [
    {
        id: 'fb1',
        title: 'Nollywood Film Scene',
        image_url: '/youtube.jpeg'
    },
    {
        id: 'fb2',
        title: 'Faceless Tech B-Roll',
        image_url: '/pilotprograme-logo.jpg'
    }
];

function LoginContent() {
    const router = useRouter();
    const pathname = usePathname();
    const { enabled: googleEnabled } = useGoogleAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleError, setGoogleError] = useState('');
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: true, // Default to true so creators stay signed in for 3 days without needing UI prompt
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [timeoutMessage, setTimeoutMessage] = useState('');

    // Framed AI Generated Images Showcase State
    const [showcaseImages, setShowcaseImages] = useState(FALLBACK_SHOWCASE);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // 2FA login verification states
    const [requires2fa, setRequires2fa] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    // Human Verification States
    const [isHuman, setIsHuman] = useState(false);
    const [verifyingHuman, setVerifyingHuman] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    const searchParams = useSearchParams();

    const API_URL = (typeof window !== 'undefined' 
        ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
            ? 'http://localhost:5000/api' 
            : 'https://s1.pilotprograme.com/api') 
        : 'http://localhost:5000/api');

    // Fetch generated images for the left frame showcase
    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                const res = await fetch(`${API_URL}/images/public-showcase`);
                const data = await res.json();
                if (data.success && data.images && data.images.length > 0) {
                    setShowcaseImages(data.images);
                }
            } catch (err) {
                console.error("Failed to fetch public image showcase:", err);
            }
        };
        fetchShowcase();
    }, [API_URL]);

    // Auto-rotate framed showcase images every 3.5 seconds
    useEffect(() => {
        if (showcaseImages.length <= 1) return;
        const interval = setInterval(() => {
            setActiveImageIndex(prev => (prev + 1) % showcaseImages.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [showcaseImages]);

    // Check for timeout parameter
    useEffect(() => {
        if (searchParams && searchParams.get('timeout') === 'true') {
            setTimeoutMessage('Your session expired due to inactivity. Please sign in again.');
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value,
        }));

        if (errors[e.target.name]) {
            setErrors(prev => ({
                ...prev,
                [e.target.name]: '',
            }));
        }
    };

    const handleVerificationCheck = () => {
        if (isHuman || verifyingHuman) return;
        
        setVerifyingHuman(true);
        setVerificationError('');
        
        setTimeout(() => {
            setVerifyingHuman(false);
            setIsHuman(true);
        }, 800);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    const setSessionData = (userObj, isRemember) => {
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('login_time', Date.now().toString());
        localStorage.setItem('last_activity', Date.now().toString());
        
        if (isRemember) {
            localStorage.setItem('remember_me', 'true');
        } else {
            localStorage.removeItem('remember_me');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isHuman) {
            setVerificationError('Please complete the security check to continue.');
            return;
        }

        const newErrors = validate();

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            setErrors({});
            setTimeoutMessage('');

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        is_human: isHuman,
                        remember_me: formData.remember
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    if (data.requires_2fa) {
                        setRequires2fa(true);
                        setTwoFactorMethod(data.two_factor_method);
                        setVerificationCode('');
                    } else {
                        setSessionData(data.user, formData.remember);

                        if (data.user.role === 'admin') {
                            router.push('/control');
                        } else {
                            router.push('/dashboard');
                        }
                    }
                } else {
                    if (data.locked) {
                        setErrors({
                            submit: data.message,
                            locked: true
                        });
                    } else {
                        setErrors({ submit: data.message });
                    }
                }
            } catch (error) {
                setErrors({ submit: 'Failed to connect to authentication servers. Please try again.' });
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    const handleVerify2fa = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            setErrors({ submit2fa: 'Please enter the 6-digit verification code' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${API_URL}/auth/verify-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    code: verificationCode,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSessionData(data.user, formData.remember);

                if (data.user.role === 'admin') {
                    router.push('/control');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setErrors({ submit2fa: data.message || 'Verification failed. Please check your code.' });
            }
        } catch (error) {
            setErrors({ submit2fa: 'Verification connection failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // ── Google Sign-In ────────────────────────────────────────────────────
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            setGoogleError('');
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();

                const res = await fetch(`${API_URL}/auth/google/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token: tokenResponse.access_token,
                        sub: userInfo.sub,
                        email: userInfo.email,
                        picture: userInfo.picture,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    setSessionData(data.user, true); // Always remember Google logins in background
                    router.push(data.user.role === 'admin' ? '/control' : '/dashboard');
                } else {
                    setGoogleError(data.message || 'Google sign-in failed.');
                }
            } catch (err) {
                setGoogleError('Google sign-in failed. Please try again.');
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => setGoogleError('Google sign-in was cancelled or failed.'),
        flow: 'implicit',
    });

    const activeImage = showcaseImages[activeImageIndex] || FALLBACK_SHOWCASE[0];

    return (
        <>
            <DynamicSEO 
                pageSlug="login"
                fallbackTitle="Sign In — Pilot Programme Creator Studio"
                fallbackDescription="Sign in to your Pilot Programme account and access AI Gemini 2.5 script generation, Edge-TTS voiceovers, and visual automation tools."
                fallbackKeywords="Sign In, Login, Pilot Programme sign in, Pilot Programme login, Creator Studio"
                schemaType="WebPage"
            />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07070a] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                
                {/* Ambient Glow Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/5 dark:bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-5xl w-full bg-white dark:bg-[#101014] border border-gray-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/10 grid grid-cols-1 lg:grid-cols-12 min-h-[660px] relative z-10">
                    
                    {/* ── Left Side: Pro Brand & Tilted Wooden Picture Frame Showcase Panel ──────────── */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-[#0d0d12] via-[#121218] to-[#0a0a0d] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden text-white">
                        
                        {/* Subtle Background Pattern */}
                        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

                        {/* Top Header & Logo */}
                        <div className="relative z-10 space-y-5">
                            <Link href="/" className="inline-flex items-center gap-3 group">
                                <div className="relative">
                                    <img 
                                        src="/pilotprograme-logo.jpg" 
                                        alt="Pilot Programme Logo" 
                                        className="w-9 h-9 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105" 
                                    />
                                </div>
                                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                                    Pilot Programme
                                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">
                                        PRO
                                    </span>
                                </span>
                            </Link>

                            <div className="space-y-2.5">
                                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[11px] font-semibold">
                                    <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
                                    <span>SYSTEMS OPERATIONAL</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                                    Welcome back to your <span className="bg-gradient-to-r from-red-500 via-purple-400 to-red-400 bg-clip-text text-transparent">Creator Studio</span>
                                </h2>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Automate your faceless YouTube channels with AI Gemini 2.5 scripts, realistic voice synthesis, and blog-to-script conversions.
                                </p>
                            </div>

                            {/* ── Tilted Wooden Picture Frame Showcase (Protected / Locked Image Display) ────────────────── */}
                            <div 
                                className="pt-3 pb-1 flex flex-col items-center relative z-10 space-y-3 select-none"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <div className="relative transform -rotate-2 hover:rotate-0 transition-transform duration-500 ease-out cursor-pointer group w-full max-w-[340px]">
                                    
                                    {/* Wooden Frame Outer Box */}
                                    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-[#5a361e] via-[#3b2314] to-[#25150b] shadow-[0_20px_40px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.6)] border border-[#784828]/40 relative">
                                        
                                        {/* Wooden Bevel Inner Shadow Matting */}
                                        <div className="p-2 bg-[#1a110a] rounded-lg shadow-inner border border-[#2b190e]">
                                            
                                            {/* Image Canvas with Transparent Protection Shield */}
                                            <div className="relative h-44 sm:h-48 w-full rounded-md overflow-hidden bg-black shadow-inner select-none">
                                                
                                                {/* Transparent Anti-Download Shield Overlay */}
                                                <div 
                                                    className="absolute inset-0 z-30 bg-transparent select-none cursor-pointer" 
                                                    onContextMenu={(e) => e.preventDefault()}
                                                    onDragStart={(e) => e.preventDefault()}
                                                />

                                                <img 
                                                    src={activeImage.image_url} 
                                                    alt="AI Scene Generated on Pilot Programme"
                                                    onContextMenu={(e) => e.preventDefault()}
                                                    onDragStart={(e) => e.preventDefault()}
                                                    style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
                                                />
                                                
                                                {/* Glass Reflection Highlight Overlay */}
                                                <div className="absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Brass Mounting Corner Accents */}
                                        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-[#d4af37]/60 rounded-tl pointer-events-none" />
                                        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-[#d4af37]/60 rounded-tr pointer-events-none" />
                                        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-[#d4af37]/60 rounded-bl pointer-events-none" />
                                        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-[#d4af37]/60 rounded-br pointer-events-none" />
                                    </div>
                                </div>

                                {/* Clear "Generated on Pilot Programme" Label */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-bold text-gray-300 backdrop-blur-md">
                                    <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />
                                    <span>Generated on Pilot Programme</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom SLA Footer */}
                        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 mt-4 lg:mt-0">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                256-bit Encrypted Session
                            </span>
                            <span className="font-mono text-gray-500">v1.02</span>
                        </div>
                    </div>

                    {/* ── Right Side: Login Form / 2FA panel ─────────────────────── */}
                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white dark:bg-[#101014]">
                        <div className="max-w-md w-full mx-auto space-y-6">
                            
                            {/* Header (Mobile logo + Title) */}
                            <div className="text-left space-y-1">
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Sign In to Your Account
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Enter your credentials below to access your dashboard.
                                </p>
                            </div>

                            {/* 2FA Verification Mode */}
                            {requires2fa ? (
                                <form onSubmit={handleVerify2fa} className="space-y-4 pt-2">
                                    <div className="text-center p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 text-red-500">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Security Required</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {twoFactorMethod === 'email_otp'
                                                ? `Verification code sent to ${formData.email}`
                                                : 'Enter the 6-digit code from your authenticator app.'}
                                        </p>
                                    </div>

                                    {/* Submit 2FA Error */}
                                    {errors.submit2fa && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>{errors.submit2fa}</span>
                                        </div>
                                    )}

                                    <div>
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="000 000"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-center tracking-[0.4em] text-lg font-bold focus:border-red-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/20"
                                    >
                                        {loading ? 'Verifying Code...' : 'Verify & Enter Studio'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRequires2fa(false)}
                                        className="w-full text-center text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        ← Back to Sign In
                                    </button>
                                </form>
                            ) : (
                                /* Standard Login Form */
                                <div className="space-y-5">
                                    
                                    {/* Google Sign-In Button */}
                                    {googleEnabled && (
                                        <div className="space-y-3">
                                            {googleError && (
                                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                    <span>{googleError}</span>
                                                </div>
                                            )}
                                            
                                            <button
                                                type="button"
                                                onClick={() => { setGoogleError(''); googleLogin(); }}
                                                disabled={googleLoading}
                                                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-50 dark:bg-[#16161c] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm group"
                                            >
                                                {googleLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                ) : (
                                                    <svg viewBox="0 0 48 48" className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                                                        <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                                        <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                        <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                                    </svg>
                                                )}
                                                <span>{googleLoading ? 'Signing in with Google...' : 'Continue with Google Account'}</span>
                                            </button>

                                            <div className="relative flex items-center justify-center my-3">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-200 dark:border-white/10" />
                                                </div>
                                                <span className="relative px-3 bg-white dark:bg-[#101014] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    or sign in with email
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        
                                        {/* Timeout Notification */}
                                        {timeoutMessage && (
                                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <span>{timeoutMessage}</span>
                                            </div>
                                        )}

                                        {/* Submit Error */}
                                        {errors.submit && (
                                            <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                                                errors.locked
                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                                    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                                            }`}>
                                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1 space-y-1">
                                                    <p>{errors.submit}</p>
                                                    {errors.locked && (
                                                        <Link href="/forgot-password" className="text-amber-500 font-bold underline inline-block">
                                                            Reset Password Now →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Email Input */}
                                        <div className="space-y-1.5">
                                            <label htmlFor="email" className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="alex@example.com"
                                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#16161c] border ${
                                                        errors.email ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                                                    } rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors`}
                                                />
                                            </div>
                                            {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>}
                                        </div>

                                        {/* Password Input */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label htmlFor="password" className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Password
                                                </label>
                                                <Link href="/forgot-password" className="text-[11px] font-bold text-red-500 hover:text-red-400 transition-colors">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="••••••••"
                                                    className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#16161c] border ${
                                                        errors.password ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                                                    } rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-[11px] text-red-500 font-medium">{errors.password}</p>}
                                        </div>

                                        {/* Remember Me Checkbox */}
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#16161c] border border-gray-200/60 dark:border-white/5">
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    id="remember"
                                                    name="remember"
                                                    type="checkbox"
                                                    checked={formData.remember}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-white dark:bg-[#101014] border-gray-300 dark:border-white/20 cursor-pointer"
                                                />
                                                <label htmlFor="remember" className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer select-none">
                                                    Remember me on this device
                                                </label>
                                            </div>
                                        </div>

                                        {/* Interactive Human Verification Box */}
                                        <div className="pt-1">
                                            <div 
                                                onClick={handleVerificationCheck}
                                                className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer select-none ${
                                                    isHuman 
                                                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                                                        : verifyingHuman 
                                                            ? 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 animate-pulse'
                                                            : 'bg-gray-50 dark:bg-[#16161c] border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                                        isHuman 
                                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                            : 'border-gray-300 dark:border-white/20 bg-white dark:bg-black/40'
                                                    }`}>
                                                        {isHuman ? (
                                                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                                        ) : verifyingHuman ? (
                                                            <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                                                        ) : null}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {isHuman 
                                                                ? 'Verification Completed' 
                                                                : verifyingHuman 
                                                                    ? 'Checking security signature...' 
                                                                    : 'Click to verify human check'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono font-semibold text-gray-400">SECURE</span>
                                            </div>
                                            {verificationError && (
                                                <p className="mt-1 text-[11px] text-red-500 font-bold">{verificationError}</p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={loading || !isHuman}
                                            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                                                isHuman 
                                                    ? 'bg-gradient-to-r from-red-600 via-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer' 
                                                    : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Signing In...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Sign In to Creator Studio</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Register Link */}
                                    <div className="pt-2 text-center border-t border-gray-100 dark:border-white/5">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Don't have a Pilot Programme account?{' '}
                                            <Link href="/register" className="font-bold text-red-500 hover:text-red-400 transition-colors">
                                                Create account for free →
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>

                {googleLoading && (
                    <Loader message="Signing in with Google..." fullScreen={true} />
                )}
            </div>
        </>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07070a] text-white">Loading Sign In...</div>}>
            <LoginContent />
        </Suspense>
    );
}
