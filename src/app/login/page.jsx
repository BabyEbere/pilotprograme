"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '@/components/GoogleAuthProvider';

import { Mail, Lock, Eye, EyeOff, AlertCircle, Shield, User, Globe, Check, Loader2 } from 'lucide-react';
import Loader from '@/components/Loader';

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
        remember: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [timeoutMessage, setTimeoutMessage] = useState('');

    // 2FA login verification states
    const [requires2fa, setRequires2fa] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    // Human Verification States
    const [isHuman, setIsHuman] = useState(false);
    const [verifyingHuman, setVerifyingHuman] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    const searchParams = useSearchParams();

    // Check for timeout parameter
    useEffect(() => {
        if (searchParams && searchParams.get('timeout') === 'true') {
            setTimeoutMessage('Your session expired due to inactivity. Please login again.');
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });

        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    const handleVerificationCheck = () => {
        if (isHuman || verifyingHuman) return;
        
        setVerifyingHuman(true);
        setVerificationError('');
        
        setTimeout(() => {
            setVerifyingHuman(false);
            setIsHuman(true);
        }, 1200);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isHuman) {
            setVerificationError('Please verify that you are human.');
            return;
        }

        const newErrors = validate();

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            setErrors({});
            setTimeoutMessage('');

            try {
                const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        is_human: isHuman
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    if (data.requires_2fa) {
                        setRequires2fa(true);
                        setTwoFactorMethod(data.two_factor_method);
                        setVerificationCode('');
                    } else {
                        // Store user data and login time
                        localStorage.setItem('user', JSON.stringify(data.user));
                        localStorage.setItem('login_time', Date.now().toString());
                        localStorage.setItem('last_activity', Date.now().toString());

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
                setErrors({ submit: 'Failed to login. Please try again.' });
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
            setErrors({ submit2fa: 'Please enter verification code' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/auth/verify-2fa`, {
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
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('login_time', Date.now().toString());
                localStorage.setItem('last_activity', Date.now().toString());

                if (data.user.role === 'admin') {
                    router.push('/control');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setErrors({ submit2fa: data.message || 'Verification failed. Please try again.' });
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

                const res = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/auth/google/login`, {
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
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('login_time', Date.now().toString());
                    localStorage.setItem('last_activity', Date.now().toString());
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07070a] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full bg-white/90 dark:bg-[#111115]/50 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[700px] backdrop-blur-xl">
                
                {/* ── Left Side: Brand Panel ────────────────────────────────── */}
                <div className="lg:col-span-5 bg-gradient-to-br from-red-950/20 via-black to-[#09090b] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden">
                    {/* Ambient glows */}
                    <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-red-800/5 rounded-full blur-[100px] pointer-events-none"></div>

                    {/* Logo & Brand Header */}
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center space-x-3 mb-6 lg:mb-10 group">
                            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-2 shadow-lg group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold tracking-wider text-gray-900 dark:text-white uppercase">PilotPrograme</span>
                        </Link>

                        <div className="space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight">
                                Unleash <span className="text-red-500">AI Video</span> automation
                            </h2>
                            <p className="text-gray-600 dark:text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium leading-relaxed">
                                Instantly convert scripts into fully-loaded, engaging visual projects with natural AI voiceovers and custom generated images.
                            </p>
                        </div>
                    </div>

                    {/* Features List - Collapsed on Mobile, Fully visible on Desktop */}
                    <div className="hidden lg:block space-y-6 my-8 relative z-10">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-red-500 flex-shrink-0">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">AI Content Blueprinting</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select niche-specific strategies to structure high-performing outlines automatically.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-red-550 flex-shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Local Voice Cloning</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Synthesize expressive voiceovers directly from your machine using local Coqui XTTS v2.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-red-500 flex-shrink-0">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Automated Scene Rendering</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generate stunning visuals aligned with each script scene block dynamically.</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial / Social Proof - Hidden on Mobile */}
                    <div className="hidden lg:block relative z-10 bg-gray-100/50 dark:bg-white/[0.01] border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-red-500 text-xs">★</span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 italic leading-relaxed">
                            "PilotPrograme changed how I make faceless YouTube videos. Outlines and local voice cloning are incredible."
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-red-600/30 flex items-center justify-center text-[10px] text-gray-900 dark:text-white font-bold">A</div>
                            <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Alex T. — Creator</span>
                        </div>
                    </div>
                </div>

                {/* ── Right Side: Login Form / 2FA panel ─────────────────────── */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white/80 dark:bg-[#0e0e12]/80">
                    <div className="max-w-md w-full mx-auto">
                        
                        {/* Logo header only visible on mobile */}
                        <div className="flex lg:hidden flex-col items-center mb-6">
                            <Link href="/" className="inline-flex items-center space-x-2.5 mb-4">
                                <div className="bg-red-600 rounded-lg p-2 shadow-md">
                                    <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">PilotPrograme</span>
                            </Link>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Welcome back</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 text-center">Sign in to continue creating content.</p>
                        </div>

                        {/* 2FA Verification Mode */}
                        {requires2fa ? (
                            <form onSubmit={handleVerify2fa} className="space-y-5">
                                <div className="text-center mb-6">
                                    <div className="w-11 h-11 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Shield className="w-5 h-5 text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Two-Factor Authentication</h3>
                                    <p className="text-[11px] text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mt-1 font-medium">
                                        {twoFactorMethod === 'email_otp'
                                            ? `We sent a 6-digit verification code to your registered email: ${formData.email}`
                                            : 'Please enter the 6-digit verification code from your Google Authenticator app.'}
                                    </p>
                                </div>

                                {/* Submit 2FA Error */}
                                {errors.submit2fa && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                                        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                                        <span>{errors.submit2fa}</span>
                                    </div>
                                )}

                                <div>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="000000"
                                        required
                                        className="w-full px-4 py-3 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-650 text-center tracking-[0.5em] text-lg font-bold focus:ring-1 focus:ring-red-500/30 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-300"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Log In'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRequires2fa(false)}
                                    className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
                                >
                                    Back to Log In
                                </button>
                            </form>
                        ) : (
                            /* Standard Form */
                            <>
                            {/* ── Google Sign-In Button ───────────────────── */}
                            {googleEnabled && !requires2fa && (
                                <div className="mb-4">
                                    {googleError && (
                                        <div className="mb-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold leading-relaxed">
                                            {googleError}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => { setGoogleError(''); googleLogin(); }}
                                        disabled={googleLoading}
                                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 shadow-sm"
                                    >
                                        {googleLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-gray-400" />
                                        ) : (
                                            <svg viewBox="0 0 48 48" className="w-4 h-4 flex-shrink-0">
                                                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                            </svg>
                                        )}
                                        {googleLoading ? 'Signing in...' : 'Sign in with Google'}
                                    </button>
                                    <div className="relative flex items-center justify-center my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200 dark:border-white/8" />
                                        </div>
                                        <span className="relative px-3 bg-white dark:bg-[#0e0e12] text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                            or sign in with email
                                        </span>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="hidden lg:block mb-6">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Welcome back</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Sign in to continue creating amazing content.</p>
                                </div>

                                {/* Timeout Message */}
                                {timeoutMessage && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2.5 rounded-xl text-xs font-medium flex items-start gap-2">
                                        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                                        <span>{timeoutMessage}</span>
                                    </div>
                                )}

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className={`border px-4 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                                        errors.locked
                                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p>{errors.submit}</p>
                                            {errors.locked && (
                                                <Link href="/forgot-password" className="text-orange-300 underline font-bold mt-1 inline-block">
                                                    Reset Password Now
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-[10px] font-black text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#16161a] border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-white/10'} rounded-xl text-gray-900 dark:text-white placeholder-gray-600 text-xs focus:ring-1 focus:ring-red-500/30 focus:border-transparent transition-all outline-none`}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-[10px] font-black text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-12 py-2.5 bg-white dark:bg-[#16161a] border ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-white/10'} rounded-xl text-gray-900 dark:text-white placeholder-gray-600 text-xs focus:ring-1 focus:ring-red-500/30 focus:border-transparent transition-all outline-none`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center">
                                        <input
                                            id="remember"
                                            name="remember"
                                            type="checkbox"
                                            checked={formData.remember}
                                            onChange={handleChange}
                                            className="h-3.5 w-3.5 bg-white dark:bg-[#16161a] border-gray-200 dark:border-white/10 text-red-600 focus:ring-red-500 rounded"
                                        />
                                        <label htmlFor="remember" className="ml-2 block text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400">
                                            Remember me
                                        </label>
                                    </div>

                                    <Link href="/forgot-password" className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-wider">
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Human Verification check box */}
                                <div className="pt-1.5">
                                    <div 
                                        onClick={handleVerificationCheck}
                                        className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer select-none ${
                                            isHuman 
                                                ? 'bg-emerald-950/10 border-emerald-500/20' 
                                                : verifyingHuman 
                                                    ? 'bg-gray-100/50 dark:bg-white/[0.01] border-gray-200 dark:border-white/10 animate-pulse'
                                                    : 'bg-white dark:bg-[#16161a] border-gray-200 dark:border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                                isHuman 
                                                    ? 'bg-emerald-500 border-emerald-500 text-gray-900 dark:text-white' 
                                                    : 'border-white/20 bg-gray-200 dark:bg-black/30'
                                            }`}>
                                                {isHuman ? (
                                                    <Check className="w-3 h-3 stroke-[3px]" />
                                                ) : verifyingHuman ? (
                                                    <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                                                ) : null}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                                    {isHuman 
                                                        ? 'Verification success' 
                                                        : verifyingHuman 
                                                            ? 'Securing connection...' 
                                                            : 'I am not a robot'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-mono text-gray-550 tracking-wider">SECURE CHECK</span>
                                    </div>
                                    {verificationError && (
                                        <p className="mt-1 text-xs text-red-500 font-bold uppercase tracking-wider">{verificationError}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !isHuman}
                                    className={`w-full py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-300 ${
                                        isHuman 
                                            ? 'bg-red-600 hover:bg-red-750 text-gray-900 dark:text-white hover:scale-[1.002] cursor-pointer' 
                                            : 'bg-gray-200 dark:bg-white/5 border border-white/5 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>
                            </>
                        )}

                        {/* Divider */}
                        <div className="mt-5 relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <span className="relative px-3 bg-white dark:bg-[#0e0e12] text-[9px] font-bold text-gray-650 uppercase tracking-wider">
                                Don't have an account?
                            </span>
                        </div>

                        {/* Register Link */}
                        <div className="mt-4 text-center">
                            <Link href="/register"
                                className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
            {googleLoading && (
                <Loader message="Signing in with Google..." fullScreen={true} />
            )}
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07070a] text-white">Loading Login...</div>}>
            <LoginContent />
        </Suspense>
    );
}
