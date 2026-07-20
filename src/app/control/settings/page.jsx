"use client";


import React, { useState, useEffect } from 'react';
import { 
    MdSettings, MdSave, MdEmail, MdVpnKey, MdDns, MdPerson,
    MdCheckCircle, MdError, MdRefresh, MdInfo, MdLink
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

// Moved outside to prevent re-mounting and losing focus on each keystroke
const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Icon className="text-red-500 w-5 h-5" />
            {title}
        </h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const InputField = ({ label, id, type = "text", value, onChange, onSave, placeholder, description, saving }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-white/5 pb-6 last:border-0 last:pb-0">
        <div className="md:col-span-1">
            <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">{label}</label>
            <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">{description}</p>
        </div>
        <div className="md:col-span-2 flex gap-3">
            <input 
                type={type}
                value={value || ''}
                onChange={(e) => onChange(id, e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/30 transition-all font-medium"
            />
            <button 
                onClick={() => onSave(id, value)}
                disabled={saving}
                className="p-3 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 rounded-xl transition-all disabled:opacity-50"
                title="Save current field"
            >
                <MdSave className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors w-5 h-5" />
            </button>
        </div>
    </div>
);

const SelectField = ({ label, id, value, options, onChange, onSave, description, saving }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-white/5 pb-6 last:border-0 last:pb-0">
        <div className="md:col-span-1">
            <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">{label}</label>
            <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">{description}</p>
        </div>
        <div className="md:col-span-2 flex gap-3">
            <select 
                value={value || ''}
                onChange={(e) => onChange(id, e.target.value)}
                className="flex-1 bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/30 transition-all font-medium appearance-none"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
            <button 
                onClick={() => onSave(id, value)}
                disabled={saving}
                className="p-3 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 rounded-xl transition-all disabled:opacity-50"
                title="Save current field"
            >
                <MdSave className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors w-5 h-5" />
            </button>
        </div>
    </div>
);

const AdminSettings = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        document.title = "Platform Settings | AI Studio Admin";
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/settings`);
            const data = await res.json();
            if (data.success) {
                const settingsMap = {};
                data.settings.forEach(s => {
                    settingsMap[s.setting_key] = s.setting_value;
                });
                setSettings(settingsMap);
            }
        } catch (error) {
            showToast('Failed to fetch settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (key, value, description = '') => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value, description })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Setting updated`);
            } else {
                showToast(data.message || 'Update failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MdSettings className="text-red-500" />
                                Platform Settings
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-black tracking-widest">Global configurations & infrastructure</p>
                        </div>
                        <button 
                            onClick={fetchSettings}
                            className="p-2 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-all bg-gray-200 dark:bg-white/5 rounded-lg"
                        >
                            <MdRefresh className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111111] px-6">
                    <div className="flex gap-6 max-w-5xl mx-auto overflow-x-auto no-scrollbar">
                        {[
                            { id: 'general', name: 'General & Registration', icon: MdPerson },
                            { id: 'system_smtp', name: 'System SMTP', icon: MdEmail },
                            { id: 'marketing_smtp', name: 'Marketing SMTP', icon: MdVpnKey },
                            { id: 'video_models', name: 'Video & Models', icon: MdSettings }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 text-xs font-black uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                                        isActive 
                                            ? 'border-red-500 text-red-500' 
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-w-5xl mx-auto">
                    {loading ? (
                         <div className="flex flex-col items-center justify-center p-20">
                            <div className="animate-spin w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full mb-4"></div>
                            <p className="text-xs text-gray-600 dark:text-gray-500 font-bold uppercase tracking-widest">Loading secure configurations...</p>
                         </div>
                    ) : (
                        <>
                            {/* ── TAB: GENERAL ─────────────────────────────────── */}
                            {activeTab === 'general' && (
                                <>
                                    {/* Google OAuth Section */}
                                    <Section title="🔐 Google OAuth / Sign-In" icon={MdLink}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-white/5 pb-6">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Enable Google Sign-In</label>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">Show/hide the "Continue with Google" button on Register &amp; Login pages.</p>
                                            </div>
                                            <div className="md:col-span-2 flex items-center gap-4">
                                                <button
                                                    onClick={() => {
                                                        const newVal = settings.google_oauth_enabled === 'true' ? 'false' : 'true';
                                                        handleSettingChange('google_oauth_enabled', newVal);
                                                        handleSave('google_oauth_enabled', newVal, 'Enable/disable Google OAuth sign-in on register and login pages');
                                                    }}
                                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${
                                                        settings.google_oauth_enabled === 'true' ? 'bg-blue-600' : 'bg-gray-700'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                                        settings.google_oauth_enabled === 'true' ? 'translate-x-8' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${
                                                    settings.google_oauth_enabled === 'true' ? 'text-blue-400' : 'text-gray-600 dark:text-gray-500'
                                                }`}>
                                                    {settings.google_oauth_enabled === 'true' ? 'Active — Google button visible to users' : 'Disabled — Google button hidden'}
                                                </span>
                                            </div>
                                        </div>

                                        <InputField
                                            label="Google OAuth Client ID"
                                            id="google_oauth_client_id"
                                            type="password"
                                            value={settings.google_oauth_client_id}
                                            onChange={handleSettingChange}
                                            onSave={handleSave}
                                            placeholder="XXXXXXXXXX.apps.googleusercontent.com"
                                            description="From Google Cloud Console → Credentials → OAuth 2.0 Client ID (Web application type)."
                                            saving={saving}
                                        />

                                        <InputField
                                            label="Google OAuth Client Secret"
                                            id="google_oauth_client_secret"
                                            type="password"
                                            value={settings.google_oauth_client_secret}
                                            onChange={handleSettingChange}
                                            onSave={handleSave}
                                            placeholder="GOCSPX-......"
                                            description="From Google Cloud Console → Credentials → Client Secret."
                                            saving={saving}
                                        />

                                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 text-xs text-blue-200/60 leading-relaxed font-bold italic">
                                            <MdInfo className="text-blue-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-blue-300 not-italic">How to get a Client ID and Secret:</span>{' '}
                                                Go to <span className="text-blue-300">console.cloud.google.com</span> → APIs &amp; Services → Credentials → Create OAuth 2.0 Client ID.
                                                Set type to <span className="text-blue-300">Web application</span>, add your domain to Authorized JavaScript Origins, and save.
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Registration Control Section */}
                                    <Section title="🚫 Registration & Maintenance" icon={MdPerson}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Disable New Registrations</label>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">Turn this on to pause registrations for maintenance. Users trying to sign up will be prompted to join the waitlist instead.</p>
                                            </div>
                                            <div className="md:col-span-2 flex items-center gap-4">
                                                <button
                                                    onClick={() => {
                                                        const newVal = settings.registration_disabled === 'true' ? 'false' : 'true';
                                                        handleSettingChange('registration_disabled', newVal);
                                                        handleSave('registration_disabled', newVal, 'Pause registrations and show waitlist/maintenance page');
                                                    }}
                                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${
                                                        settings.registration_disabled === 'true' ? 'bg-red-600' : 'bg-gray-700'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                                        settings.registration_disabled === 'true' ? 'translate-x-8' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${
                                                    settings.registration_disabled === 'true' ? 'text-red-400' : 'text-gray-600 dark:text-gray-500'
                                                }`}>
                                                    {settings.registration_disabled === 'true' ? 'Paused — Waitlist / Maintenance message shown' : 'Active — Standard registration open'}
                                                </span>
                                            </div>
                                        </div>
                                    </Section>
                                </>
                            )}

                            {/* ── TAB: SYSTEM SMTP ──────────────────────────────── */}
                            {activeTab === 'system_smtp' && (
                                <Section title="✉ System SMTP Server (Registrations, OTPs, Transactions)" icon={MdEmail}>
                                    <SelectField
                                        label="Primary Mailer Provider"
                                        id="system_email_provider"
                                        value={settings.system_email_provider}
                                        options={[
                                            { value: 'smtp', label: 'SMTP Server (Outgoing Mail Server)' },
                                            { value: 'brevo', label: 'Brevo API (HTTP API Mode)' }
                                        ]}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        description="Select the primary provider to route transactional system emails (OTPs, Welcome, notifications)."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="SMTP Host"
                                        id="system_smtp_host"
                                        value={settings.system_smtp_host}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="mail.example.com"
                                        description="Outgoing mail server hostname."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="SMTP Port"
                                        id="system_smtp_port"
                                        value={settings.system_smtp_port}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="465"
                                        description="Standard ports are 465 (SSL) or 587 (TLS)."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="SMTP Username"
                                        id="system_smtp_username"
                                        value={settings.system_smtp_username}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="info@example.com"
                                        description="Username/Email for authentication."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="SMTP Password"
                                        id="system_smtp_password"
                                        type="password"
                                        value={settings.system_smtp_password}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="••••••••"
                                        description="Password/API Key for authentication."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="From Email"
                                        id="system_smtp_from_email"
                                        value={settings.system_smtp_from_email}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="no-reply@example.com"
                                        description="Email address shown in the 'From' field."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="From Name"
                                        id="system_smtp_from_name"
                                        value={settings.system_smtp_from_name}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="PilotPrograme"
                                        description="Display sender name in email client."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="Brevo API Key (Fallback)"
                                        id="brevo_api_key"
                                        type="password"
                                        value={settings.brevo_api_key}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="xkeysib-..."
                                        description="If SMTP connection fails, system emails will automatically fallback to Brevo API."
                                        saving={saving}
                                    />
                                </Section>
                            )}

                            {/* ── TAB: MARKETING SMTP ───────────────────────────── */}
                            {activeTab === 'marketing_smtp' && (
                                <Section title="📣 Marketing SMTP Server (Audience Outreach Campaigns)" icon={MdVpnKey}>
                                    <SelectField
                                        label="Primary Mailer Provider"
                                        id="marketing_email_provider"
                                        value={settings.marketing_email_provider}
                                        options={[
                                            { value: 'smtp', label: 'SMTP Server (Outgoing Mail Server)' },
                                            { value: 'brevo', label: 'Brevo API (HTTP API Mode)' }
                                        ]}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        description="Select the primary provider to route outreach and newsletter campaign emails."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="SMTP Host"
                                        id="marketing_smtp_host"
                                        value={settings.marketing_smtp_host}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="smtp.marketing.com"
                                        description="Outgoing marketing mail server hostname."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="SMTP Port"
                                        id="marketing_smtp_port"
                                        value={settings.marketing_smtp_port}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="587"
                                        description="Standard ports are 587 (TLS) or 465 (SSL)."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="SMTP Username"
                                        id="marketing_smtp_username"
                                        value={settings.marketing_smtp_username}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="marketing@example.com"
                                        description="Username/Email for authentication."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="SMTP Password"
                                        id="marketing_smtp_password"
                                        type="password"
                                        value={settings.marketing_smtp_password}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="••••••••"
                                        description="Password/API Key for authentication."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="From Email"
                                        id="marketing_smtp_from_email"
                                        value={settings.marketing_smtp_from_email}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="promo@example.com"
                                        description="Email address shown in the 'From' field."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="From Name"
                                        id="marketing_smtp_from_name"
                                        value={settings.marketing_smtp_from_name}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="PilotPrograme Promotions"
                                        description="Display sender name in marketing emails."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="Test Recipient Email"
                                        id="marketing_test_email"
                                        value={settings.marketing_test_email}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="talkwella@gmai.com"
                                        description="Email address used for testing campaigns."
                                        saving={saving}
                                    />
                                    <InputField
                                        label="Brevo API Key (Fallback)"
                                        id="brevo_api_key"
                                        type="password"
                                        value={settings.brevo_api_key}
                                        onChange={handleSettingChange}
                                        onSave={handleSave}
                                        placeholder="xkeysib-..."
                                        description="If SMTP connection fails, marketing campaigns will automatically fallback to Brevo API."
                                        saving={saving}
                                    />
                                </Section>
                            )}

                            {/* ── TAB: VIDEO & MODELS ──────────────────────────── */}
                            {activeTab === 'video_models' && (
                                <>
                                    {/* Video Generation Section */}
                                    <Section title="🎬 Video Generation" icon={MdSettings}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-white/5 pb-6">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Enable Video Tool</label>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">Show/hide video generation for all users.</p>
                                            </div>
                                            <div className="md:col-span-2 flex items-center gap-4">
                                                <button
                                                    onClick={() => {
                                                        const newVal = settings.video_tool_enabled === 'true' ? 'false' : 'true';
                                                        handleSettingChange('video_tool_enabled', newVal);
                                                        handleSave('video_tool_enabled', newVal, 'Enable/disable video generation for users');
                                                    }}
                                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${
                                                        settings.video_tool_enabled === 'true' ? 'bg-green-600' : 'bg-gray-700'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                                        settings.video_tool_enabled === 'true' ? 'translate-x-8' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${
                                                    settings.video_tool_enabled === 'true' ? 'text-green-400' : 'text-gray-600 dark:text-gray-500'
                                                }`}>
                                                    {settings.video_tool_enabled === 'true' ? 'Active — Users can generate videos' : 'Disabled — Video page hidden'}
                                                </span>
                                            </div>
                                        </div>

                                        <InputField 
                                            label="Pollinations Video API Key (FREE)" 
                                            id="pollinations_video_key" 
                                            type="password"
                                            value={settings.pollinations_video_key}
                                            onChange={handleSettingChange}
                                            onSave={handleSave}
                                            placeholder="sk_... or pk_..."
                                            description="Free API key from enter.pollinations.ai — enables 4 free video models."
                                            saving={saving}
                                        />

                                        <InputField 
                                            label="Pollinations Image API Key (FREE)" 
                                            id="pollinations_image_key" 
                                            type="password"
                                            value={settings.pollinations_image_key}
                                            onChange={handleSettingChange}
                                            onSave={handleSave}
                                            placeholder="sk_... or pk_..."
                                            description="API key from enter.pollinations.ai used for image generation."
                                            saving={saving}
                                        />

                                        <InputField 
                                            label="LTX API Key (Premium, Optional)" 
                                            id="ltx_api_key" 
                                            type="password"
                                            value={settings.ltx_api_key}
                                            onChange={handleSettingChange}
                                            onSave={handleSave}
                                            placeholder="Your LTX Video API key"
                                            description="Optional. Get from console.ltx.video for premium LTX 2.3 models."
                                            saving={saving}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-white/5 pb-6">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Default Model</label>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">Model pre-selected for users.</p>
                                            </div>
                                            <div className="md:col-span-2 flex gap-3">
                                                <select
                                                    value={settings.video_default_model || 'seedance'}
                                                    onChange={(e) => {
                                                        handleSettingChange('video_default_model', e.target.value);
                                                        handleSave('video_default_model', e.target.value);
                                                    }}
                                                    className="flex-1 bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/30 transition-all font-medium"
                                                >
                                                    <option value="seedance">Seedance (Free)</option>
                                                    <option value="wan-fast">Wan Fast (Free)</option>
                                                    <option value="wan">Wan Standard (Free)</option>
                                                    <option value="ltx-2">LTX-2 (Free)</option>
                                                    <option value="Wan-AI/Wan2.2-T2V-A14B">Wan 2.2 T2V (SiliconFlow)</option>
                                                    <option value="ltx-2-3-fast">LTX 2.3 Fast (Premium)</option>
                                                    <option value="ltx-2-3-pro">LTX 2.3 Pro (Premium)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Max Duration</label>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">Maximum video length per generation.</p>
                                            </div>
                                            <div className="md:col-span-2 flex gap-3">
                                                <select
                                                    value={settings.video_max_duration || '5'}
                                                    onChange={(e) => {
                                                        handleSettingChange('video_max_duration', e.target.value);
                                                        handleSave('video_max_duration', e.target.value);
                                                    }}
                                                    className="flex-1 bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/30 transition-all font-medium"
                                                >
                                                    <option value="3">3 seconds</option>
                                                    <option value="5">5 seconds</option>
                                                    <option value="8">8 seconds</option>
                                                    <option value="10">10 seconds</option>
                                                    <option value="15">15 seconds</option>
                                                    <option value="20">20 seconds</option>
                                                </select>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Experimental Local Models Section */}
                                    <Section title="🧪 Experimental Local Models" icon={MdSettings}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-white/5 pb-6">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Enable XTTS v2</label>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">Show/hide Coqui XTTS v2 for audio generation.</p>
                                            </div>
                                            <div className="md:col-span-2 flex items-center gap-4">
                                                <button
                                                    onClick={() => {
                                                        const newVal = settings.xtts_enabled === 'true' ? 'false' : 'true';
                                                        handleSettingChange('xtts_enabled', newVal);
                                                        handleSave('xtts_enabled', newVal, 'Enable/disable experimental XTTS v2 engine');
                                                    }}
                                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${
                                                        settings.xtts_enabled === 'true' ? 'bg-purple-600' : 'bg-gray-700'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                                        settings.xtts_enabled === 'true' ? 'translate-x-8' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${
                                                    settings.xtts_enabled === 'true' ? 'text-purple-400' : 'text-gray-600 dark:text-gray-500'
                                                }`}>
                                                    {settings.xtts_enabled === 'true' ? 'Active — XTTS is visible to users' : 'Disabled — Hidden from UI'}
                                                </span>
                                            </div>
                                        </div>

                                        <InputField 
                                            label="XTTS Server API URL" 
                                            id="xtts_api_url" 
                                            value={settings.xtts_api_url}
                                            onChange={handleSettingChange}
                                            onSave={handleSave}
                                            placeholder="http://localhost:8020"
                                            description="URL of the separate local XTTS server."
                                            saving={saving}
                                        />
                                    </Section>

                                    {/* Story Lab Settings Section */}
                                    <Section title="📖 Story Lab Settings" icon={MdSettings}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Enable Story Lab</label>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">Show/hide Story Lab page for all regular users.</p>
                                            </div>
                                            <div className="md:col-span-2 flex items-center gap-4">
                                                <button
                                                    onClick={() => {
                                                        const newVal = settings.story_lab_enabled === 'true' ? 'false' : 'true';
                                                        handleSettingChange('story_lab_enabled', newVal);
                                                        handleSave('story_lab_enabled', newVal, 'Enable/disable Story Lab interface for users');
                                                    }}
                                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${
                                                        settings.story_lab_enabled === 'true' ? 'bg-green-600' : 'bg-gray-700'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                                        settings.story_lab_enabled === 'true' ? 'translate-x-8' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${
                                                    settings.story_lab_enabled === 'true' ? 'text-green-400' : 'text-gray-600 dark:text-gray-500'
                                                }`}>
                                                    {settings.story_lab_enabled === 'true' ? 'Active — Story Lab active' : 'Disabled — Story Lab hidden'}
                                                </span>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Infrastructure & Processing Section */}
                                    <Section title="⚙ Infrastructure & Processing" icon={MdSettings}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Background Rendering</label>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-500 leading-relaxed italic">Turn on for VPS servers to process TTS requests in detached daemon threads. Turn off for Shared Hosting/DirectAdmin servers to avoid orphaned threads.</p>
                                            </div>
                                            <div className="md:col-span-2 flex items-center gap-4">
                                                <button
                                                    onClick={() => {
                                                        const newVal = settings.enable_background_audio_rendering === 'true' ? 'false' : 'true';
                                                        handleSettingChange('enable_background_audio_rendering', newVal);
                                                        handleSave('enable_background_audio_rendering', newVal, 'Enable/disable offline persistent background rendering for audio');
                                                    }}
                                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${
                                                        settings.enable_background_audio_rendering === 'true' ? 'bg-purple-600' : 'bg-gray-700'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                                        settings.enable_background_audio_rendering === 'true' ? 'translate-x-8' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${
                                                    settings.enable_background_audio_rendering === 'true' ? 'text-purple-400' : 'text-gray-600 dark:text-gray-500'
                                                }`}>
                                                    {settings.enable_background_audio_rendering === 'true' ? 'Active — Async background processing enabled (VPS mode)' : 'Inactive — Synchronous inline processing active (Shared/DirectAdmin mode)'}
                                                </span>
                                            </div>
                                        </div>
                                    </Section>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl animate-in slide-in-from-right-2 border flex items-center gap-2 ${
                    toast.type === 'error' ? 'bg-red-600/10 text-red-500 border-red-500/20' : 'bg-green-600/10 text-green-500 border-green-500/20'
                }`}>
                    {toast.type === 'error' ? <MdError /> : <MdCheckCircle />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
