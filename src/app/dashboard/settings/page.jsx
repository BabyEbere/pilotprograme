"use client";

import { useState, useEffect } from 'react';
import { 
    Eye, EyeOff, Key, CheckCircle, AlertTriangle, ExternalLink, Save, RefreshCw,
    Lock, Shield, Mail, Smartphone, QrCode, ToggleLeft, ToggleRight, Check, Link, Unlink
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '@/components/GoogleAuthProvider';
import Loader from '@/components/Loader';

export default function Settings() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [activeTab, setActiveTab] = useState('api-key'); // 'api-key', 'password', '2fa', 'linked-accounts'
    const [settings, setSettings] = useState({ has_api_key: false, api_key: '' });
    const [newApiKey, setNewApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [toast, setToast] = useState(null);

    // Linked Accounts (Google)
    const { enabled: googleFeatureEnabled } = useGoogleAuth();
    const [googleLinked, setGoogleLinked] = useState(false);
    const [googlePicture, setGooglePicture] = useState('');
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkError, setLinkError] = useState('');
    const [linkSuccess, setLinkSuccess] = useState('');

    // YouTube channel linking states
    const [youtubeChannels, setYoutubeChannels] = useState([]);
    const [fetchingYoutube, setFetchingYoutube] = useState(false);
    const [maxYoutubeAnalyzer, setMaxYoutubeAnalyzer] = useState(0);
    const [loadingPlan, setLoadingPlan] = useState(true);

    // Password change states
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
        otp_code: ''
    });
    const [password2faRequired, setPassword2faRequired] = useState(false);
    const [password2faMethod, setPassword2faMethod] = useState('');
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // 2FA management states
    const [current2faMethod, setCurrent2faMethod] = useState('none');
    const [selected2faMethod, setSelected2faMethod] = useState('none'); // 'none', 'email_otp', 'google_auth'
    const [google2faSetup, setGoogle2faSetup] = useState(null); // { secret, qr_code_url }
    const [otpSent, setOtpSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [disableCode, setDisableCode] = useState('');
    const [showDisableForm, setShowDisableForm] = useState(false);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchSettings = async () => {
        setFetching(true);
        try {
            const res = await fetch(`${API_URL}/settings/${user.id}`);
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
                setGoogleLinked(!!data.settings.google_linked);
                setGooglePicture(data.settings.google_picture || '');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    };

    const fetch2faStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/settings/security/${user.id}`);
            const data = await res.json();
            if (data.success) {
                setCurrent2faMethod(data.two_factor_method);
                setSelected2faMethod(data.two_factor_method);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchYoutubeChannels = async () => {
        setFetchingYoutube(true);
        try {
            const res = await fetch(`${API_URL}/settings/youtube-channels/${user.id}`);
            const data = await res.json();
            if (data.success) {
                setYoutubeChannels(data.channels || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetchingYoutube(false);
        }
    };

    const fetchPlan = async () => {
        setLoadingPlan(true);
        try {
            const res = await fetch(`${API_URL}/plans/my-subscription?user_id=${user.id}`);
            const data = await res.json();
            if (data.success && data.subscription) {
                setMaxYoutubeAnalyzer(data.subscription.max_youtube_analyzer || 0);
            }
        } catch (e) {
            console.error('Error fetching plan limits in settings page:', e);
        } finally {
            setLoadingPlan(false);
        }
    };

    useEffect(() => { 
        fetchSettings(); 
        fetch2faStatus();
        fetchYoutubeChannels();
        fetchPlan();
    }, []);

    // ── Google Link/Unlink ──────────────────────────────────────────────
    const googleLinkLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLinkLoading(true);
            setLinkError('');
            setLinkSuccess('');
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();
                const res = await fetch(`${API_URL}/auth/google/link`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token: tokenResponse.access_token,
                        sub: userInfo.sub,
                        email: userInfo.email,
                        picture: userInfo.picture,
                        user_id: user.id,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    setLinkSuccess('Google account linked successfully!');
                    setGoogleLinked(true);
                    setGooglePicture(userInfo.picture || '');
                } else {
                    setLinkError(data.message || 'Failed to link Google account.');
                }
            } catch {
                setLinkError('Connection error. Please try again.');
            } finally {
                setLinkLoading(false);
            }
        },
        onError: () => setLinkError('Google sign-in was cancelled or failed.'),
        flow: 'implicit',
    });

    const handleUnlinkGoogle = async () => {
        setLinkLoading(true);
        setLinkError('');
        setLinkSuccess('');
        try {
            const res = await fetch(`${API_URL}/auth/google/unlink`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id }),
            });
            const data = await res.json();
            if (data.success) {
                setLinkSuccess('Google account unlinked.');
                setGoogleLinked(false);
                setGooglePicture('');
            } else {
                setLinkError(data.message || 'Failed to unlink.');
            }
        } catch {
            setLinkError('Connection error. Please try again.');
        } finally {
            setLinkLoading(false);
        }
    };

    // ── YouTube Linking ─────────────────────────────────────────────────
    const youtubeLinkLogin = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            setLinkLoading(true);
            setLinkError('');
            setLinkSuccess('');
            try {
                const res = await fetch(`${API_URL}/auth/youtube/link`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: codeResponse.code,
                        user_id: user.id
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    setLinkSuccess('YouTube channel linked successfully!');
                    fetchYoutubeChannels();
                } else {
                    setLinkError(data.message || 'Failed to link YouTube channel.');
                }
            } catch (err) {
                setLinkError('Connection error. Please try again.');
            } finally {
                setLinkLoading(false);
            }
        },
        onError: () => setLinkError('YouTube authorization cancelled or failed.'),
        flow: 'auth-code',
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtubepartner',
            'https://www.googleapis.com/auth/youtubepartner-channel-audit',
            'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
            'https://www.googleapis.com/auth/youtube.third-party-link.creator',
        ].join(' '),
    });

    const handleUnlinkYoutube = async (channelId) => {
        setLinkLoading(true);
        setLinkError('');
        setLinkSuccess('');
        try {
            const res = await fetch(`${API_URL}/settings/youtube-channels/unlink`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, channel_id: channelId }),
            });
            const data = await res.json();
            if (data.success) {
                setLinkSuccess('YouTube channel unlinked successfully.');
                fetchYoutubeChannels();
            } else {
                setLinkError(data.message || 'Failed to unlink YouTube channel.');
            }
        } catch {
            setLinkError('Connection error. Please try again.');
        } finally {
            setLinkLoading(false);
        }
    };

    const handleSaveApiKey = async (e) => {
        e.preventDefault();
        if (!newApiKey.trim()) { showToast('Please enter a Gemini API key', 'error'); return; }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/settings/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ai_provider: 'gemini', api_key: newApiKey.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                showToast('API key saved successfully!');
                setNewApiKey('');
                setShowKey(false);
                fetchSettings();
            } else {
                showToast(data.message || 'Failed to save API key', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            showToast('New passwords do not match', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/settings/security/change-password/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                    otp_code: passwordData.otp_code
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Password changed successfully!');
                setPasswordData({ current_password: '', new_password: '', confirm_password: '', otp_code: '' });
                setPassword2faRequired(false);
            } else if (data.requires_otp) {
                setPassword2faRequired(true);
                setPassword2faMethod(data.two_factor_method);
                showToast(data.message, 'info');
                if (data.two_factor_method === 'email_otp') {
                    await handleSendPasswordOtp();
                }
            } else {
                showToast(data.message || 'Failed to change password', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSendPasswordOtp = async () => {
        try {
            const res = await fetch(`${API_URL}/settings/security/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Verification code sent to your email.');
            } else {
                showToast(data.message || 'Failed to send verification code', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        }
    };

    const handleSetupGoogle2fa = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/settings/security/setup-google-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            });
            const data = await res.json();
            if (data.success) {
                setGoogle2faSetup({ secret: data.secret, qr_code_url: data.qr_code_url });
                setVerificationCode('');
            } else {
                showToast(data.message || 'Failed to load Google Authenticator details', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/settings/security/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            });
            const data = await res.json();
            if (data.success) {
                setOtpSent(true);
                setVerificationCode('');
                showToast('Verification code sent to your email.');
            } else {
                showToast(data.message || 'Failed to send verification code', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEnable2fa = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            showToast('Please enter the verification code', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/settings/security/enable-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    method: selected2faMethod,
                    code: verificationCode,
                    secret: google2faSetup?.secret || null
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message);
                setGoogle2faSetup(null);
                setOtpSent(false);
                setVerificationCode('');
                fetch2faStatus();
            } else {
                showToast(data.message || 'Verification failed', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2fa = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/settings/security/disable-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    code: disableCode
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('2FA disabled successfully.');
                setDisableCode('');
                setShowDisableForm(false);
                fetch2faStatus();
            } else {
                showToast(data.message || 'Failed to disable 2FA', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handle2faMethodChange = (method) => {
        setSelected2faMethod(method);
        setGoogle2faSetup(null);
        setOtpSent(false);
        setVerificationCode('');
        
        if (method === 'none' && current2faMethod !== 'none') {
            setShowDisableForm(true);
        } else {
            setShowDisableForm(false);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0a0a0a] overflow-y-auto">

                {/* Header */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/5 sticky top-0 z-10 transition-colors">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">Manage your API keys, security preferences, and themes</p>
                        </div>
                        <button
                            onClick={() => { fetchSettings(); fetch2faStatus(); }}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-200 dark:bg-white/5 transition-colors"
                            title="Refresh settings"
                        >
                            <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Zoned Layout Container */}
                <div className="p-6 max-w-5xl w-full mx-auto grid md:grid-cols-4 gap-8">
                    
                    {/* Zone Selector Sidebar */}
                    <div className="md:col-span-1 space-y-1.5">
                        {[
                            { id: 'api-key', label: 'API Configurations', icon: Key },
                            { id: 'password', label: 'Change Password', icon: Lock },
                            { id: '2fa', label: '2FA Authentication', icon: Shield },
                            { id: 'linked-accounts', label: 'Linked Accounts', icon: Link },
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            const isTabActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold border transition-all ${
                                        isTabActive
                                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400 shadow-sm'
                                            : 'bg-gray-50 dark:bg-[#111111] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-200 dark:border-white/10 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <TabIcon className="w-4 h-4 flex-shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Zone Content Panel */}
                    <div className="md:col-span-3 space-y-6">

                        {/* ZONE 1: API Key Config */}
                        {activeTab === 'api-key' && (
                            <div className="space-y-6">
                                {/* Current Key Status Card */}
                                {!fetching && (
                                    <div className={`rounded-2xl border p-5 flex items-start gap-4 transition-all ${settings.has_api_key
                                        ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                                        : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400'
                                        }`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${settings.has_api_key ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-amber-100 dark:bg-amber-500/20'
                                            }`}>
                                            {settings.has_api_key
                                                ? <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                                : <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">
                                                {settings.has_api_key ? 'Gemini API Key is Active' : 'No Gemini API Key Found'}
                                            </p>
                                            {settings.has_api_key ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <code className="text-xs font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg tracking-widest">
                                                        {settings.api_key || '••••••••••••••••••••'}
                                                    </code>
                                                </div>
                                            ) : (
                                                <p className="text-xs mt-0.5 opacity-90">
                                                    Add your Gemini API key below to start generating scripts.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {fetching && (
                                    <div className="h-20 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                                )}

                                {/* API Key Form */}
                                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6 transition-colors">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <Key className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-900 dark:text-white">Google Gemini API Key</h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">Required for AI script generation</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 p-4 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20 mb-5">
                                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                            Pilot Programme uses <strong>Google Gemini</strong> exclusively to power script generation.
                                            Your key is stored securely and only used to generate scripts on your behalf.
                                        </p>
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                                        >
                                            Get your free Gemini API key <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>

                                    <form onSubmit={handleSaveApiKey} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                {settings.has_api_key ? 'Update API Key' : 'Enter API Key'} *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showKey ? 'text' : 'password'}
                                                    value={newApiKey}
                                                    onChange={(e) => setNewApiKey(e.target.value)}
                                                    placeholder="AIza..."
                                                    className="w-full px-4 py-2.5 pr-20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm bg-white dark:bg-black text-gray-900 dark:text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowKey(!showKey)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-700 dark:text-gray-300 transition-colors"
                                                >
                                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || !newApiKey.trim()}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <Save className="w-4 h-4" />
                                            {loading ? 'Saving...' : settings.has_api_key ? 'Update Key' : 'Save Key'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ZONE 2: Change Password */}
                        {activeTab === 'password' && (
                            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6 transition-colors">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900 dark:text-white">Change Account Password</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">Secure your account with a strong password</p>
                                    </div>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Current Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                required
                                                className="w-full px-4 py-2.5 pr-20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white dark:bg-black text-gray-900 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-700 dark:text-gray-300"
                                            >
                                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            New Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                required
                                                className="w-full px-4 py-2.5 pr-20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white dark:bg-black text-gray-900 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-700 dark:text-gray-300"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Confirm New Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwordData.confirm_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                                required
                                                className="w-full px-4 py-2.5 pr-20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white dark:bg-black text-gray-900 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-700 dark:text-gray-300"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* OTP Field (if 2FA is active) */}
                                    {password2faRequired && (
                                        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-3">
                                            <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1.5">
                                                <Shield className="w-3.5 h-3.5" />
                                                Security Verification Required ({password2faMethod === 'email_otp' ? 'Email OTP' : 'Google 2FA'})
                                            </p>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={passwordData.otp_code}
                                                    onChange={(e) => setPasswordData({ ...passwordData, otp_code: e.target.value })}
                                                    placeholder="Enter 6-digit code"
                                                    required
                                                    className="w-full max-w-[200px] px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-black text-gray-900 dark:text-white tracking-widest text-center"
                                                />
                                            </div>
                                            {password2faMethod === 'email_otp' && (
                                                <button
                                                    type="button"
                                                    onClick={handleSendPasswordOtp}
                                                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                                >
                                                    Resend Code
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Processing...' : password2faRequired ? 'Confirm & Change Password' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ZONE 3: 2FA Settings */}
                        {activeTab === '2fa' && (
                            <div className="space-y-6">
                                {/* Current Status Info Card */}
                                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6 transition-colors">
                                    <div className="flex items-center justify-between gap-3 mb-5 border-b border-gray-100 dark:border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</h2>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">Add an extra layer of protection to your account</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                            current2faMethod !== 'none' 
                                                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5'
                                        }`}>
                                            {current2faMethod !== 'none' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {/* 2FA Method Selector Cards */}
                                    <div className="space-y-3">
                                        {/* Option 1: Disable */}
                                        <div 
                                            onClick={() => handle2faMethodChange('none')}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                                selected2faMethod === 'none'
                                                    ? 'border-purple-500 bg-purple-500/5'
                                                    : 'border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#161616]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <ToggleLeft className={`w-5 h-5 ${selected2faMethod === 'none' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400'}`} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">Disable 2FA</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">Disable all extra verification steps. Normal login only.</p>
                                                </div>
                                            </div>
                                            {selected2faMethod === 'none' && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                                        </div>

                                        {/* Option 2: Email OTP */}
                                        <div 
                                            onClick={() => handle2faMethodChange('email_otp')}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                                selected2faMethod === 'email_otp'
                                                    ? 'border-purple-500 bg-purple-500/5'
                                                    : 'border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#161616]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Mail className={`w-5 h-5 ${selected2faMethod === 'email_otp' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400'}`} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white font-sans">Email verification code (OTP)</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">Receive a 6-digit one-time code in your email when logging in or updating passwords.</p>
                                                </div>
                                            </div>
                                            {selected2faMethod === 'email_otp' && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                                        </div>

                                        {/* Option 3: Google Authenticator */}
                                        <div 
                                            onClick={() => handle2faMethodChange('google_auth')}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                                selected2faMethod === 'google_auth'
                                                    ? 'border-purple-500 bg-purple-500/5'
                                                    : 'border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#161616]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Smartphone className={`w-5 h-5 ${selected2faMethod === 'google_auth' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400'}`} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">Google Authenticator (or similar app)</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-sans">Use any standard TOTP app (Google Authenticator, Authy) to scan a QR code and generate verification tokens.</p>
                                                </div>
                                            </div>
                                            {selected2faMethod === 'google_auth' && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Configure/Enable Subsections */}

                                {/* If Google Authenticator selected and not active yet */}
                                {selected2faMethod === 'google_auth' && current2faMethod !== 'google_auth' && (
                                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 space-y-5 transition-colors">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <QrCode className="w-4 h-4 text-blue-500" />
                                            Set up Google Authenticator
                                        </h3>
                                        
                                        {!google2faSetup ? (
                                            <div className="space-y-3">
                                                <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                                                    Scan a QR code inside your mobile app to link your account. Generating setup credentials...
                                                </p>
                                                <button
                                                    onClick={handleSetupGoogle2fa}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    Initialize Authenticator Setup
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid md:grid-cols-3 gap-6 items-center">
                                                    <div className="bg-white p-2.5 rounded-xl border border-gray-200 flex justify-center max-w-[170px] mx-auto">
                                                        <img src={google2faSetup.qr_code_url} alt="Scan this QR code" className="w-36 h-36" />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-3">
                                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Scan QR Code or Enter Manual Secret</p>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-400 leading-relaxed">
                                                            1. Open Google Authenticator, tap the "+" icon, and choose "Scan QR code".
                                                            <br />
                                                            2. If scanning fails, choose "Enter a setup key" and add this code:
                                                        </p>
                                                        <code className="block p-2 bg-gray-100 dark:bg-black text-xs font-mono font-bold text-center border border-gray-200 dark:border-white/5 rounded-lg text-gray-800 dark:text-gray-200 select-all tracking-wider">
                                                            {google2faSetup.secret}
                                                        </code>
                                                    </div>
                                                </div>

                                                <form onSubmit={handleEnable2fa} className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
                                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                                                        Enter 6-Digit Authenticator Code
                                                    </label>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            value={verificationCode}
                                                            onChange={(e) => setVerificationCode(e.target.value)}
                                                            placeholder="000000"
                                                            required
                                                            className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-black text-gray-900 dark:text-white tracking-widest text-center max-w-[150px]"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                        >
                                                            Verify & Enable
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* If Email OTP selected and not active yet */}
                                {selected2faMethod === 'email_otp' && current2faMethod !== 'email_otp' && (
                                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 space-y-5 transition-colors">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-purple-500" />
                                            Set up Email OTP 2FA
                                        </h3>
                                        
                                        {!otpSent ? (
                                            <div className="space-y-3">
                                                <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                                                    We will send a one-time verification code to <strong>{user.email}</strong>. Please enter the code to confirm activation.
                                                </p>
                                                <button
                                                    onClick={handleSendEmailOtp}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    Send Verification Code
                                                </button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleEnable2fa} className="space-y-4">
                                                <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    A code has been sent to your email. Enter it below to enable Email 2FA:
                                                </p>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={verificationCode}
                                                        onChange={(e) => setVerificationCode(e.target.value)}
                                                        placeholder="000000"
                                                        required
                                                        className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-black text-gray-900 dark:text-white tracking-widest text-center max-w-[150px]"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                    >
                                                        Verify & Enable
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleSendEmailOtp}
                                                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                                >
                                                    Resend OTP Code
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {/* If trying to Disable active 2FA */}
                                {showDisableForm && (
                                    <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
                                        <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Confirm Disabling 2FA
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                                            Disabling two-factor authentication leaves your account more vulnerable. To disable it, verify with a current code:
                                        </p>
                                        
                                        <form onSubmit={handleDisable2fa} className="space-y-4">
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={disableCode}
                                                    onChange={(e) => setDisableCode(e.target.value)}
                                                    placeholder="000000"
                                                    required
                                                    className="px-4 py-2 border border-red-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-black text-gray-900 dark:text-white tracking-widest text-center max-w-[150px]"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    Confirm Disable
                                                </button>
                                            </div>
                                            {current2faMethod === 'email_otp' && (
                                                <button
                                                    type="button"
                                                    onClick={handleSendEmailOtp}
                                                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                                >
                                                    Send OTP Code to Email
                                                </button>
                                            )}
                                        </form>
                                    </div>
                                )}

                                {/* Informational Card when selected active method matches current */}
                                {selected2faMethod === current2faMethod && current2faMethod !== 'none' && (
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Active Security Method</p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">
                                                Your account is securely fortified using {current2faMethod === 'email_otp' ? 'Email OTP' : current2faMethod === 'google_auth' ? 'Google Authenticator' : current2faMethod}. To configure a different method, select one from the options above.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ZONE 4: Linked Accounts */}
                        {activeTab === 'linked-accounts' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6 transition-colors">
                                    <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-white/5 pb-4">
                                        <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <Link className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-900 dark:text-white">Linked Accounts</h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Connect third-party accounts for one-click sign-in</p>
                                        </div>
                                    </div>

                                    {/* Feedback messages */}
                                    {linkError && (
                                        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{linkError}</span>
                                        </div>
                                    )}
                                    {linkSuccess && (
                                        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{linkSuccess}</span>
                                        </div>
                                    )}

                                    {/* Google Row */}
                                    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                        googleLinked
                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                            : 'bg-gray-50 dark:bg-[#161616] border-gray-200 dark:border-white/8'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            {/* Google logo */}
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <svg viewBox="0 0 48 48" className="w-5 h-5">
                                                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                                    <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                                </svg>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {googleLinked && googlePicture && (
                                                    <img
                                                        src={googlePicture}
                                                        alt="Google profile"
                                                        className="w-8 h-8 rounded-full border-2 border-emerald-500/30"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Google</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${googleLinked ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-600'}`} />
                                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${
                                                            googleLinked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                                                        }`}>
                                                            {googleLinked ? 'Connected' : 'Not connected'}
                                                        </p>
                                                    </div>
                                                    {!googleLinked && (
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                            Link Google to enable one-click sign-in
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action button */}
                                        <div className="flex-shrink-0 ml-4">
                                            {!googleFeatureEnabled ? (
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 italic font-medium">Feature disabled</span>
                                            ) : googleLinked ? (
                                                <button
                                                    onClick={handleUnlinkGoogle}
                                                    disabled={linkLoading}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Unlink className="w-3 h-3" />
                                                    {linkLoading ? 'Unlinking...' : 'Unlink'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { setLinkError(''); setLinkSuccess(''); googleLinkLogin(); }}
                                                    disabled={linkLoading}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                                                >
                                                    <Link className="w-3 h-3" />
                                                    {linkLoading ? 'Connecting...' : 'Link Google'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* YouTube Row */}
                                    <div className="mt-4 border-t border-gray-200 dark:border-white/5 pt-4">
                                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">YouTube Integration</h3>
                                        
                                        {!loadingPlan && maxYoutubeAnalyzer === 0 ? (
                                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">
                                                        <Lock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-950 dark:text-white">YouTube Analyzer Locked</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                            Your current plan does not include YouTube Channel Analyzer & daily content suggestions.
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href="/dashboard/plans"
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-95 cursor-pointer"
                                                >
                                                    Upgrade Plan
                                                </a>
                                            </div>
                                        ) : youtubeChannels.length > 0 ? (
                                            <div className="space-y-3">
                                                {youtubeChannels.map((chan) => (
                                                    <div key={chan.channel_id} className="flex items-center justify-between p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            {chan.thumbnail ? (
                                                                <img
                                                                    src={chan.thumbnail}
                                                                    alt={chan.title}
                                                                    className="w-10 h-10 rounded-xl object-cover border border-emerald-500/20"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 font-bold">
                                                                    YT
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{chan.title}</p>
                                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                                    {Number(chan.subscribers).toLocaleString()} subscribers • {chan.videos} videos • {Number(chan.views).toLocaleString()} views
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUnlinkYoutube(chan.channel_id)}
                                                            disabled={linkLoading}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                                        >
                                                            <Unlink className="w-3 h-3" />
                                                            Unlink
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 dark:bg-[#161616] border-gray-200 dark:border-white/8 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-red-600">
                                                            <path d="M23.498 6.163c-.272-1.022-1.074-1.824-2.096-2.097C19.548 3.5 12 3.5 12 3.5s-7.548 0-9.402.566C1.576 4.34 0.774 5.14 0.5 6.163 0 8.02 0 12 0 12s0 3.98.5 5.837c.272 1.022 1.074 1.824 2.096 2.097C4.452 20.5 12 20.5 12 20.5s7.548 0 9.402-.566c1.022-.273 1.824-1.075 2.097-2.097.5-1.856.5-5.837.5-5.837s0-3.98-.5-5.837zm-13.7 9.387V8.45l6.4 3.55-6.4 3.55z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">YouTube Channels</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Link your YouTube channel to enable video uploading and channel tracking.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setLinkError(''); setLinkSuccess(''); youtubeLinkLogin(); }}
                                                    disabled={linkLoading}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                                                >
                                                    <Link className="w-3 h-3" />
                                                    {linkLoading ? 'Connecting...' : 'Link Channel'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info note */}
                                    <div className="mt-4 bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-xs text-blue-700 dark:text-blue-300/70 leading-relaxed">
                                        <p className="font-bold text-blue-600 dark:text-blue-400 mb-1">How YouTube &amp; Google linking works</p>
                                        <ul className="space-y-1 text-[11px]">
                                            <li>• Once linked, you can sign in with Google on the login page — no password needed.</li>
                                            <li>• Your Google email must match your registered account email.</li>
                                            <li>• To unlink Google, you must have a password set on your account.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Dynamic Universal Loader Overlay */}
            {linkLoading && (
                <Loader message="Synchronising Google &amp; YouTube Services..." fullScreen={true} />
            )}

            {/* Toast feedback */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${
                    toast.type === 'error' ? 'bg-red-600 text-gray-900 dark:text-white' : 'bg-purple-600 text-gray-900 dark:text-white'
                }`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
