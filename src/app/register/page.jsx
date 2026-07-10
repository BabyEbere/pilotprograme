"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Mail, Lock, User, Building2, Briefcase, Eye, EyeOff, Globe, Shield, Check, Loader2 } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

export default function Register() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [searchCountry, setSearchCountry] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
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
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    // Phone input country selection state (default "us")
    const [phoneCountryCode, setPhoneCountryCode] = useState('us');

    // Human Verification States
    const [isHuman, setIsHuman] = useState(false);
    const [verifyingHuman, setVerifyingHuman] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#aff-')) {
            const code = hash.replace('#aff-', '');
            setFormData(prev => ({ ...prev, referredByCode: code }));
        }
    }, []);

    // Load countries, and once loaded, run location detection
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
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/geolocation`);
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
                    // Dynamically set phone country flag
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
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/countries`);
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
        setFormData({
            ...formData,
            [name]: value,
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    const handleCountrySelect = (country) => {
        setFormData({
            ...formData,
            countryCode: country.code,
            countryName: country.name,
            phoneNumber: country.dial_code || formData.phoneNumber,
        });
        setPhoneCountryCode(country.code.toLowerCase());
        setShowCountryDropdown(false);
        setSearchCountry('');
    };

    const handlePhoneChange = (phone) => {
        setFormData({
            ...formData,
            phoneNumber: phone,
        });
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
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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

            try {
                const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        is_human: isHuman
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    router.push('/verify-otp', { state: { email: formData.email } });
                } else {
                    setErrors({ submit: data.message });
                }
            } catch (error) {
                setErrors({ submit: 'Failed to register. Please try again.' });
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07070a] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full bg-white/90 dark:bg-[#111115]/50 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[750px] backdrop-blur-xl">
                
                {/* ── Left Side: Brand Panel ────────────────────────────────── */}
                <div className="lg:col-span-5 bg-gradient-to-br from-red-950/20 via-black to-[#09090b] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden">
                    {/* Atmospheric Glow - Coordinated & Subdued */}
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

                    {/* Testimonial / Social Proof - Hidden on Mobile to avoid scrolling overflow */}
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

                {/* ── Right Side: Register Form ─────────────────────────────── */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white/80 dark:bg-[#0e0e12]/80">
                    <div className="max-w-xl w-full mx-auto">
                        
                        {/* Logo header only visible on mobile (since the brand panel is collapsed/smaller) */}
                        <div className="flex lg:hidden flex-col items-center mb-6">
                            <Link href="/" className="inline-flex items-center space-x-2.5 mb-4">
                                <div className="bg-red-600 rounded-lg p-2 shadow-md">
                                    <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">PilotPrograme</span>
                            </Link>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create your account</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 text-center">Start your automated content channel today</p>
                        </div>

                        {/* Title header for desktop */}
                        <div className="hidden lg:block mb-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Create your account</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Enter your details to register and start creating content.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Honeypot */}
                            <input
                                type="text"
                                name="bot_trap"
                                value={formData.bot_trap}
                                onChange={handleChange}
                                style={{ display: 'none' }}
                                tabIndex="-1"
                                autoComplete="off"
                            />

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider">
                                    {errors.submit}
                                </div>
                            )}

                            {/* Grid wrapper for fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div>
                                    <label htmlFor="fullName" className="block text-[10px] font-black text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#16161a] border ${errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-white/10'} rounded-xl text-gray-900 dark:text-white placeholder-gray-600 text-xs focus:ring-1 focus:ring-red-500/30 focus:border-transparent transition-all outline-none`}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                                </div>

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

                                {/* Country Search */}
                                <div>
                                    <label htmlFor="country" className="block text-[10px] font-black text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                                        Country
                                    </label>
                                    <div className="relative z-35">
                                        <Globe className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 z-10" />
                                        <input
                                            type="text"
                                            value={formData.countryName || searchCountry}
                                            onChange={(e) => {
                                                setSearchCountry(e.target.value);
                                                setShowCountryDropdown(true);
                                            }}
                                            onFocus={() => setShowCountryDropdown(true)}
                                            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-600 rounded-xl text-xs focus:ring-1 focus:ring-red-500/30 focus:border-transparent transition-all outline-none"
                                            placeholder="Search country..."
                                            disabled={loadingCountries}
                                        />
                                        {formData.countryCode && (
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base pointer-events-none">
                                                {getCountryFlag(formData.countryCode)}
                                            </span>
                                        )}

                                        {showCountryDropdown && !loadingCountries && (
                                            <div className="absolute z-45 w-full mt-1 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                                                {filteredCountries.length > 0 ? (
                                                    filteredCountries.map((country) => (
                                                        <button
                                                            key={country.code}
                                                            type="button"
                                                            onClick={() => handleCountrySelect(country)}
                                                            className="w-full px-3 py-2 text-left hover:bg-gray-200 dark:bg-white/5 flex items-center gap-2.5 transition-colors text-xs text-gray-700 dark:text-gray-300"
                                                        >
                                                            <span>{getCountryFlag(country.code)}</span>
                                                            <span className="flex-1 truncate">{country.name}</span>
                                                            {country.dial_code && (
                                                                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-mono">{country.dial_code}</span>
                                                            )}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-2 text-gray-550 text-xs">No results</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {detectingLocation && (
                                        <p className="mt-1 text-[9px] text-gray-550 flex items-center gap-1 font-semibold uppercase tracking-wider">
                                            <Loader2 className="animate-spin h-3 w-3 text-red-500" />
                                            Detecting...
                                        </p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-[10px] font-black text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                                        Phone Number <span className="text-gray-600 dark:text-gray-500 font-bold lowercase tracking-normal">(optional)</span>
                                    </label>
                                    <PhoneInput
                                        defaultCountry={phoneCountryCode}
                                        value={formData.phoneNumber}
                                        onChange={handlePhoneChange}
                                        inputClassName="!w-full !bg-white dark:bg-[#16161a] !border-gray-200 dark:border-white/10 !text-gray-900 dark:text-white !rounded-xl !py-2.5 !pl-10 !h-auto focus:!ring-1 focus:!ring-red-500/30 focus:!border-transparent transition-all !text-xs"
                                        className="phone-input-custom !border-none"
                                    />
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
                                            className={`w-full pl-10 pr-9 py-2.5 bg-white dark:bg-[#16161a] border ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-white/10'} rounded-xl text-gray-900 dark:text-white placeholder-gray-600 text-xs focus:ring-1 focus:ring-red-500/30 focus:border-transparent transition-all outline-none`}
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

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-[10px] font-black text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#16161a] border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-white/10'} rounded-xl text-gray-900 dark:text-white placeholder-gray-600 text-xs focus:ring-1 focus:ring-red-500/30 focus:border-transparent transition-all outline-none`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                                </div>

                                {/* Company */}
                                <div>
                                    <label htmlFor="company" className="block text-[10px] font-black text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                                        Company <span className="text-gray-600 dark:text-gray-500 font-bold lowercase tracking-normal">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <input
                                            id="company"
                                            name="company"
                                            type="text"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-650 rounded-xl text-xs focus:ring-1 focus:ring-red-500/30 focus:border-transparent transition-all outline-none"
                                            placeholder="Your Company"
                                        />
                                    </div>
                                </div>

                                {/* Use Case */}
                                <div>
                                    <label htmlFor="useCase" className="block text-[10px] font-black text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                                        Platform Use Case <span className="text-gray-600 dark:text-gray-500 font-bold lowercase tracking-normal">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                                        <select
                                            id="useCase"
                                            name="useCase"
                                            value={formData.useCase}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl text-xs focus:ring-1 focus:ring-red-500/30 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
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

                            {/* Human Verification */}
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
                                    <span className="text-[9px] font-mono text-gray-500 dark:text-gray-400 tracking-wider">SECURE CHECK</span>
                                </div>
                                {verificationError && (
                                    <p className="mt-1 text-xs text-red-550 font-bold uppercase tracking-wider">{verificationError}</p>
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
                                {loading ? 'Creating Account...' : 'Register account'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="mt-5 relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <span className="relative px-3 bg-white dark:bg-[#0e0e12] text-[9px] font-bold text-gray-600 dark:text-gray-500 uppercase tracking-wider">
                                Already have an account?
                            </span>
                        </div>

                        {/* Login Link */}
                        <div className="mt-4 text-center">
                            <Link href="/login"
                                className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Sign in instead
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

            {/* Click outside to close dropdown */}
            {showCountryDropdown && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCountryDropdown(false)}
                />
            )}
        </div>
    );
}
