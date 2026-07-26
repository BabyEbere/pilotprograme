"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '@/components/GoogleAuthProvider';

import { 
    Mail, 
    Lock, 
    User, 
    Building2, 
    Briefcase, 
    Eye, 
    EyeOff, 
    Globe, 
    ShieldCheck, 
    Check, 
    Loader2, 
    Sparkles, 
    Radio, 
    ArrowRight,
    Tag,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
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

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { enabled: googleEnabled } = useGoogleAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleError, setGoogleError] = useState('');
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [searchCountry, setSearchCountry] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showOptionalFields, setShowOptionalFields] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        countryCode: '',
        countryName: '',
        company: '',
        useCase: '',
        referredByCode: '',
        bot_trap: '', // Honeypot
    });

    const [referralApplied, setReferralApplied] = useState(false);

    // Agreement to Terms & Policy State
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    // Phone input country selection state (default "us")
    const [phoneCountryCode, setPhoneCountryCode] = useState('us');

    // Human Verification States
    const [isHuman, setIsHuman] = useState(false);
    const [verifyingHuman, setVerifyingHuman] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    // Registration Pause / Waitlist states
    const [regDisabled, setRegDisabled] = useState(false);
    const [checkingRegStatus, setCheckingRegStatus] = useState(true);
    const [waitlistData, setWaitlistData] = useState({ email: '', whatsapp: '' });
    const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
    const [waitlistError, setWaitlistError] = useState('');
    const [waitlistSuccess, setWaitlistSuccess] = useState('');
    const [waitlistLoading, setWaitlistLoading] = useState(false);

    // Framed AI Generated Images Showcase State
    const [showcaseImages, setShowcaseImages] = useState(FALLBACK_SHOWCASE);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const API_URL = (typeof window !== 'undefined' 
        ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
            ? 'http://localhost:5000/api' 
            : 'https://s1.pilotprograme.com/api') 
        : 'http://localhost:5000/api');

    // Auto-detect referral code from hash (#aff-CODE) or query params (?ref=CODE, ?aff=CODE)
    useEffect(() => {
        let code = '';
        
        // 1. Check URL query parameters
        if (searchParams) {
            code = searchParams.get('ref') || searchParams.get('aff') || searchParams.get('referredByCode') || '';
        }

        // 2. Check hash if query param wasn't present
        if (!code && typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash) {
                if (hash.startsWith('#aff-')) {
                    code = hash.replace('#aff-', '');
                } else if (hash.startsWith('#ref-')) {
                    code = hash.replace('#ref-', '');
                }
            }
        }

        if (code) {
            setFormData(prev => ({ ...prev, referredByCode: code }));
            setReferralApplied(true);
            setShowOptionalFields(true);
        }
    }, [searchParams]);

    // Fetch public generated images for left frame showcase
    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                const res = await fetch(`${API_URL}/images/public-showcase`);
                const data = await res.json();
                if (data.success && data.images && data.images.length > 0) {
                    setShowcaseImages(data.images);
                }
            } catch (err) {
                console.error("Failed to fetch showcase:", err);
            }
        };
        fetchShowcase();
    }, [API_URL]);

    // Auto-rotate showcase images
    useEffect(() => {
        if (showcaseImages.length <= 1) return;
        const interval = setInterval(() => {
            setActiveImageIndex(prev => (prev + 1) % showcaseImages.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [showcaseImages]);

    useEffect(() => {
        // Check registration status on mount
        const checkRegStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/reg-status`);
                const data = await response.json();
                if (data.success) {
                    setRegDisabled(data.registration_disabled);
                }
            } catch (error) {
                console.error('Error checking registration status:', error);
            } finally {
                setCheckingRegStatus(false);
            }
        };
        checkRegStatus();
    }, [API_URL]);

    // Load countries and detect location
    useEffect(() => {
        const initCountriesAndLocation = async () => {
            const loadedCountries = await fetchCountries();
            if (loadedCountries && loadedCountries.length > 0) {
                await detectUserLocation(loadedCountries);
            }
        };
        initCountriesAndLocation();
    }, []);

    const detectUserLocation = async (availableCountries) => {
        const list = availableCountries || countries;
        if (!list || list.length === 0) return;

        setDetectingLocation(true);
        try {
            const response = await fetch(`${API_URL}/geolocation`);
            const data = await response.json();

            if (data.success && data.country_code) {
                const countryCodeLower = data.country_code.toLowerCase();
                const detectedCountry = list.find(
                    c => c.code.toLowerCase() === countryCodeLower
                );

                if (detectedCountry) {
                    setFormData(prev => ({
                        ...prev,
                        countryCode: detectedCountry.code,
                        countryName: detectedCountry.name,
                    }));
                    setPhoneCountryCode(countryCodeLower);
                }

                if (data.country_calling_code) {
                    setFormData(prev => ({
                        ...prev,
                        phoneNumber: data.country_calling_code,
                    }));
                }
            }
        } catch (error) {
            console.log('Could not detect location:', error);
        } finally {
            setDetectingLocation(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await fetch(`${API_URL}/countries`);
            const data = await response.json();
            if (data.success) {
                setCountries(data.countries);
                return data.countries;
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
        } finally {
            setLoadingCountries(false);
        }
        return [];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleCountrySelect = (country) => {
        setFormData(prev => ({
            ...prev,
            countryCode: country.code,
            countryName: country.name,
            phoneNumber: country.dial_code || prev.phoneNumber,
        }));
        setPhoneCountryCode(country.code.toLowerCase());
        setShowCountryDropdown(false);
        setSearchCountry('');
    };

    const handlePhoneChange = (phone) => {
        setFormData(prev => ({
            ...prev,
            phoneNumber: phone,
        }));
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

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
        country.code.toLowerCase().includes(searchCountry.toLowerCase())
    );

    const getCountryFlag = (countryCode) => {
        if (!countryCode) return '';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!agreeTerms) {
            newErrors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy';
        }

        return newErrors;
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

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        is_human: isHuman,
                        agree_terms: true
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
                } else {
                    if (data.registration_disabled) {
                        setRegDisabled(true);
                    }
                    setErrors({ submit: data.message });
                }
            } catch (error) {
                setErrors({ submit: 'Failed to connect to registration servers. Please try again.' });
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    const handleWaitlistSubmit = async (e) => {
        e.preventDefault();
        setWaitlistError('');
        setWaitlistSuccess('');
        
        if (!waitlistData.email.trim() && !waitlistData.whatsapp.trim()) {
            setWaitlistError('Please provide either an email address or WhatsApp number.');
            return;
        }

        if (waitlistData.email.trim() && !/\S+@\S+\.\S+/.test(waitlistData.email)) {
            setWaitlistError('Please enter a valid email address.');
            return;
        }

        setWaitlistLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/waitlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: waitlistData.email,
                    whatsapp: waitlistData.whatsapp
                }),
            });

            const data = await response.json();
            if (response.ok || data.success) {
                setWaitlistSuccess(data.message || 'Successfully joined the waitlist!');
                setWaitlistSubmitted(true);
            } else {
                setWaitlistError(data.message || 'Failed to join waitlist. Please try again.');
            }
        } catch (error) {
            setWaitlistError('A network error occurred. Please try again.');
        } finally {
            setWaitlistLoading(false);
        }
    };

    // ── Google Sign-Up ──────────────────────────────────────────────────────
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            setGoogleError('');
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();

                const res = await fetch(`${API_URL}/auth/google/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token: tokenResponse.access_token,
                        sub: userInfo.sub,
                        email: userInfo.email,
                        name: userInfo.name,
                        picture: userInfo.picture,
                        referredByCode: formData.referredByCode,
                        agree_terms: true
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('login_time', Date.now().toString());
                    localStorage.setItem('last_activity', Date.now().toString());
                    router.push('/dashboard');
                } else {
                    setGoogleError(data.message || 'Google sign-up failed.');
                }
            } catch (err) {
                setGoogleError('Google sign-up failed. Please try again.');
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
                pageSlug="register"
                fallbackTitle="Create Account — Pilot Programme Creator Studio"
                fallbackDescription="Start for free. Create your Pilot Programme account and generate your first AI YouTube script, voiceover, and video scenes in minutes."
                fallbackKeywords="Register, Create Account, Pilot Programme register, Pilot Programme create account"
                schemaType="WebPage"
            />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07070a] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                
                {/* Ambient Glow Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/5 dark:bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-5xl w-full bg-white dark:bg-[#101014] border border-gray-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/10 grid grid-cols-1 lg:grid-cols-12 min-h-[700px] relative z-10">
                    
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
                                    Start Building Your <span className="bg-gradient-to-r from-red-500 via-purple-400 to-red-400 bg-clip-text text-transparent">AI Video Channel</span>
                                </h2>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Create your free account to access AI Gemini 2.5 script blueprinting, realistic voiceovers, and automatic visual rendering.
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
                                256-bit Encrypted Registration
                            </span>
                            <span className="font-mono text-gray-500">v1.02</span>
                        </div>
                    </div>

                    {/* ── Right Side: Registration Form ─────────────────────────────── */}
                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white dark:bg-[#101014]">
                        <div className="max-w-md w-full mx-auto space-y-5">
                            
                            {/* Title header */}
                            <div className="text-left space-y-1">
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Create Your Studio Account
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Register below to get instant access to your creator dashboard.
                                </p>
                            </div>

                            {regDisabled ? (
                                <div className="space-y-6">
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider">Registrations Temporarily Closed</h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                                We are undergoing scheduled upgrades to optimize local voice models and video generators. Registrations will reopen shortly!
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-center py-2">
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white">Join Priority Waitlist</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Fill in your details below to get notified as soon as registrations reopen.
                                        </p>
                                    </div>

                                    {waitlistSubmitted ? (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-2">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                                                <Check className="w-5 h-5 stroke-[3px]" />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Priority Spot Secured!</h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {waitlistSuccess || "You've been added to our waitlist. We will notify you immediately."}
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                                            {waitlistError && (
                                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-medium">
                                                    {waitlistError}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={waitlistData.email}
                                                        onChange={(e) => setWaitlistData(prev => ({ ...prev, email: e.target.value }))}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#16161c] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                                        placeholder="alex@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                                    WhatsApp Number
                                                </label>
                                                <PhoneInput
                                                    defaultCountry={phoneCountryCode}
                                                    value={waitlistData.whatsapp}
                                                    onChange={(phone) => setWaitlistData(prev => ({ ...prev, whatsapp: phone }))}
                                                    inputClassName="!w-full !bg-gray-50 dark:!bg-[#16161c] !border-gray-200 dark:!border-white/10 !text-gray-900 dark:!text-white !rounded-xl !py-2.5 !pl-10 !h-auto focus:!border-red-500 !text-xs"
                                                    className="phone-input-custom !border-none"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={waitlistLoading}
                                                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                            >
                                                {waitlistLoading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Joining...
                                                    </>
                                                ) : (
                                                    'Notify Me When Registrations Reopen'
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    
                                    {/* Google Sign-Up Button */}
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
                                                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-gray-50 dark:bg-[#16161c] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm group"
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
                                                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
                                            </button>

                                            <div className="relative flex items-center justify-center my-2">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-200 dark:border-white/10" />
                                                </div>
                                                <span className="relative px-3 bg-white dark:bg-[#101014] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    or fill registration form
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-3.5">
                                        
                                        {/* Honeypot */}
                                        <input
                                            type="text"
                                            name="bot_trap"
                                            value={formData.bot_trap}
                                            onChange={handleChange}
                                            className="hidden"
                                            tabIndex="-1"
                                            autoComplete="off"
                                        />

                                        {/* Submit Error */}
                                        {errors.submit && (
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-xs font-semibold">
                                                {errors.submit}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Full Name */}
                                            <div className="space-y-1">
                                                <label htmlFor="fullName" className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Full Name
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        id="fullName"
                                                        name="fullName"
                                                        type="text"
                                                        value={formData.fullName}
                                                        onChange={handleChange}
                                                        placeholder="Alex Johnson"
                                                        className={`w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-[#16161c] border ${
                                                            errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                                                        } rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors`}
                                                    />
                                                </div>
                                                {errors.fullName && <p className="text-[10px] text-red-500 font-medium">{errors.fullName}</p>}
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-1">
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
                                                        placeholder="alex@example.com"
                                                        className={`w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-[#16161c] border ${
                                                            errors.email ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                                                        } rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors`}
                                                    />
                                                </div>
                                                {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>}
                                            </div>

                                            {/* Country Search */}
                                            <div className="space-y-1">
                                                <label htmlFor="country" className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Country
                                                </label>
                                                <div className="relative z-30">
                                                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                                    <input
                                                        type="text"
                                                        value={formData.countryName || searchCountry}
                                                        onChange={(e) => {
                                                            setSearchCountry(e.target.value);
                                                            setShowCountryDropdown(true);
                                                        }}
                                                        onFocus={() => setShowCountryDropdown(true)}
                                                        placeholder="Search country..."
                                                        disabled={loadingCountries}
                                                        className="w-full pl-10 pr-9 py-2 bg-gray-50 dark:bg-[#16161c] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                                                    />
                                                    {formData.countryCode && (
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
                                                            {getCountryFlag(formData.countryCode)}
                                                        </span>
                                                    )}

                                                    {showCountryDropdown && !loadingCountries && (
                                                        <div className="absolute z-40 w-full mt-1 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                            {filteredCountries.length > 0 ? (
                                                                filteredCountries.map((country) => (
                                                                    <button
                                                                        key={country.code}
                                                                        type="button"
                                                                        onClick={() => handleCountrySelect(country)}
                                                                        className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 transition-colors text-xs text-gray-800 dark:text-gray-200"
                                                                    >
                                                                        <span>{getCountryFlag(country.code)}</span>
                                                                        <span className="flex-1 truncate">{country.name}</span>
                                                                        {country.dial_code && (
                                                                            <span className="text-gray-400 text-[10px] font-mono">{country.dial_code}</span>
                                                                        )}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="px-3 py-2 text-gray-400 text-xs">No results</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Phone Number */}
                                            <div className="space-y-1">
                                                <label htmlFor="phoneNumber" className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Phone <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                                </label>
                                                <PhoneInput
                                                    defaultCountry={phoneCountryCode}
                                                    value={formData.phoneNumber}
                                                    onChange={handlePhoneChange}
                                                    inputClassName="!w-full !bg-gray-50 dark:!bg-[#16161c] !border-gray-200 dark:!border-white/10 !text-gray-900 dark:!text-white !rounded-xl !py-2 !pl-10 !h-auto focus:!border-red-500 !text-xs"
                                                    className="phone-input-custom !border-none"
                                                />
                                            </div>

                                            {/* Password */}
                                            <div className="space-y-1">
                                                <label htmlFor="password" className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        id="password"
                                                        name="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        placeholder="••••••••"
                                                        className={`w-full pl-10 pr-9 py-2 bg-gray-50 dark:bg-[#16161c] border ${
                                                            errors.password ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                                                        } rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                {errors.password && <p className="text-[10px] text-red-500 font-medium">{errors.password}</p>}
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="space-y-1">
                                                <label htmlFor="confirmPassword" className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Confirm Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        placeholder="••••••••"
                                                        className={`w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-[#16161c] border ${
                                                            errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                                                        } rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors`}
                                                    />
                                                </div>
                                                {errors.confirmPassword && <p className="text-[10px] text-red-500 font-medium">{errors.confirmPassword}</p>}
                                            </div>
                                        </div>

                                        {/* ── Optional Additional Info Accordion (Referral Code, Company, Use Case) ─────── */}
                                        <div className="pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowOptionalFields(!showOptionalFields)}
                                                className="w-full flex items-center justify-between p-2.5 bg-gray-50 dark:bg-[#16161c] border border-gray-200/60 dark:border-white/5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Tag className="w-3.5 h-3.5 text-red-500" />
                                                    <span>Referral Code & Optional Details</span>
                                                    {referralApplied && (
                                                        <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                                            ✓ LINK APPLIED
                                                        </span>
                                                    )}
                                                </span>
                                                {showOptionalFields ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                                            </button>

                                            {showOptionalFields && (
                                                <div className="mt-2.5 p-3 rounded-xl bg-gray-50/50 dark:bg-[#141418] border border-gray-200/50 dark:border-white/5 space-y-3">
                                                    
                                                    {/* Referral Code Field */}
                                                    <div className="space-y-1">
                                                        <label htmlFor="referredByCode" className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                            Referral / Affiliate Code <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                                        </label>
                                                        <div className="relative">
                                                            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                id="referredByCode"
                                                                name="referredByCode"
                                                                type="text"
                                                                value={formData.referredByCode}
                                                                onChange={handleChange}
                                                                placeholder="e.g. PP01ABC"
                                                                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[#1a1a20] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors uppercase font-mono tracking-wider"
                                                            />
                                                        </div>
                                                        {referralApplied && (
                                                            <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                                                                <Check className="w-3 h-3" />
                                                                Referral code loaded automatically from your affiliate link!
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {/* Company */}
                                                        <div className="space-y-1">
                                                            <label htmlFor="company" className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                                Company <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                                            </label>
                                                            <div className="relative">
                                                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                <input
                                                                    id="company"
                                                                    name="company"
                                                                    type="text"
                                                                    value={formData.company}
                                                                    onChange={handleChange}
                                                                    placeholder="Company name"
                                                                    className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[#1a1a20] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Use Case */}
                                                        <div className="space-y-1">
                                                            <label htmlFor="useCase" className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                                Platform Use Case <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                                            </label>
                                                            <div className="relative">
                                                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                                <select
                                                                    id="useCase"
                                                                    name="useCase"
                                                                    value={formData.useCase}
                                                                    onChange={handleChange}
                                                                    className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[#1a1a20] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
                                                                >
                                                                    <option value="">Select use case</option>
                                                                    <option value="educational">Educational Content</option>
                                                                    <option value="entertainment">Entertainment</option>
                                                                    <option value="documentary">Documentary/Storytelling</option>
                                                                    <option value="business">Business/Marketing</option>
                                                                    <option value="podcast">Podcast to Video</option>
                                                                    <option value="other">Other</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            )}
                                        </div>

                                        {/* ── Terms of Service & Privacy Policy Agreement Checkbox ─────── */}
                                        <div className="pt-1">
                                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#16161c] border border-gray-200/60 dark:border-white/5">
                                                <input
                                                    id="agreeTerms"
                                                    name="agreeTerms"
                                                    type="checkbox"
                                                    checked={agreeTerms}
                                                    onChange={(e) => {
                                                        setAgreeTerms(e.target.checked);
                                                        if (errors.agreeTerms) setErrors(prev => ({ ...prev, agreeTerms: '' }));
                                                    }}
                                                    required
                                                    className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 bg-white dark:bg-[#101014] border-gray-300 dark:border-white/20 cursor-pointer"
                                                />
                                                <label htmlFor="agreeTerms" className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer select-none">
                                                    I have read and agree to the{' '}
                                                    <Link href="/terms" target="_blank" className="font-bold text-red-500 hover:underline">
                                                        Terms of Service
                                                    </Link>{' '}
                                                    and{' '}
                                                    <Link href="/privacy" target="_blank" className="font-bold text-red-500 hover:underline">
                                                        Privacy Policy
                                                    </Link>.
                                                </label>
                                            </div>
                                            {errors.agreeTerms && (
                                                <p className="mt-1 text-[11px] text-red-500 font-bold">{errors.agreeTerms}</p>
                                            )}
                                        </div>

                                        {/* Interactive Human Verification Box */}
                                        <div>
                                            <div 
                                                onClick={handleVerificationCheck}
                                                className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer select-none ${
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
                                            disabled={loading || !isHuman || !agreeTerms}
                                            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                                                isHuman && agreeTerms
                                                    ? 'bg-gradient-to-r from-red-600 via-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer' 
                                                    : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Creating Account...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Register Account</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Login Link */}
                                    <div className="pt-2 text-center border-t border-gray-100 dark:border-white/5">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Already have a Pilot Programme account?{' '}
                                            <Link href="/login" className="font-bold text-red-500 hover:text-red-400 transition-colors">
                                                Sign in instead →
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>

                {/* Click outside to close country dropdown */}
                {showCountryDropdown && (
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowCountryDropdown(false)}
                    />
                )}

                {googleLoading && (
                    <Loader message="Creating your Pilot Programme account..." fullScreen={true} />
                )}
            </div>
        </>
    );
}

export default function Register() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07070a] text-white">Loading Register...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
