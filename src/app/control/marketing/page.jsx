"use client";


import React, { useState, useEffect, useRef } from 'react';
import {
    MdEmail, MdAdd, MdSend, MdSchedule, MdHistory, MdGroup,
    MdMoreVert, MdContentCopy, MdDelete, MdChevronRight,
    MdAutoAwesome, MdSave, MdCheckCircle, MdError, MdRefresh,
    MdHelpCenter, MdOutlineAdsClick
} from 'react-icons/md';
import { Editor } from '@tinymce/tinymce-react';
import AdminSidebar from '@/components/AdminSidebar';

// ── Sub-Components (Moved outside to prevent focus loss) ──────────────────────

const StatBox = ({ label, value, icon: Icon, color }) => (
    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[1.5rem] p-6 flex items-center gap-4 shadow-lg group hover:border-white/20 transition-all">
        <div className={`p-3 rounded-2xl bg-black/40 ${color} shadow-inner group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500">{label}</p>
        </div>
    </div>
);

const getStatusColor = (status) => {
    switch (status) {
        case 'sent': return 'bg-green-500';
        case 'scheduled': return 'bg-amber-500';
        case 'failed': return 'bg-red-500';
        default: return 'bg-gray-600';
    }
};

const Header = ({ view, setView, loading, onRefresh, onTest, onSchedule, testing, saving, isScheduled }) => (
    <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10 px-6 py-4 flex justify-between items-center overflow-hidden">
        <div className="flex items-center gap-4">
            {view === 'create' && (
                <button
                    onClick={() => setView('list')}
                    className="p-2 border border-white/5 rounded-xl hover:bg-gray-200 dark:bg-white/5 transition-all"
                >
                    <MdChevronRight className="rotate-180 w-5 h-5" />
                </button>
            )}
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MdEmail className="text-red-500" />
                    Marketing & Campaigns
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-black">
                    {view === 'list' ? 'Manage audience outreach' : 'Create new mail broadcast'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {view === 'list' ? (
                <>
                    <button
                        onClick={onRefresh}
                        className={`p-2.5 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 rounded-xl transition-all ${loading ? 'animate-spin' : ''}`}
                    >
                        <MdRefresh className="w-5 h-5 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                        onClick={() => setView('create')}
                        className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-xl shadow-red-900/20"
                    >
                        <MdAdd /> New Campaign
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={onTest}
                        disabled={testing}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-sm disabled:opacity-50"
                    >
                        <MdOutlineAdsClick className={testing ? 'animate-pulse' : ''} />
                        {testing ? 'Sending Test...' : 'Send Test Body'}
                    </button>
                    <button
                        onClick={() => onSchedule(isScheduled ? 'scheduled' : 'sent')}
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-lg shadow-red-900/20 disabled:opacity-50"
                    >
                        {isScheduled ? <MdSchedule /> : <MdSend />}
                        {saving ? (isScheduled ? 'Scheduling...' : 'Sending...') : (isScheduled ? 'Schedule Campaign' : 'Send Immediately')}
                    </button>
                </>
            )}
        </div>
    </div>
);

const CampaignList = ({ campaigns, users }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatBox label="Active Recipients" value={users.length} icon={MdGroup} color="text-blue-500" />
            <StatBox label="Campaigns Sent" value={campaigns.filter(c => c.status === 'sent').length} icon={MdSend} color="text-green-500" />
            <StatBox label="Scheduled" value={campaigns.filter(c => c.status === 'scheduled').length} icon={MdSchedule} color="text-amber-500" />
            <StatBox label="Drafts" value={campaigns.filter(c => c.status === 'draft').length} icon={MdHistory} color="text-gray-500 dark:text-gray-400" />
        </div>

        <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-black/20 border-b border-white/5 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">
                        <th className="px-8 py-5">Campaign & Status</th>
                        <th className="px-8 py-5">Audience</th>
                        <th className="px-8 py-5">Scheduled For</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5 font-medium">
                    {campaigns.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-gray-200 dark:bg-white/5 rounded-full text-gray-700"><MdEmail size={40} /></div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest">No campaigns created yet</p>
                                </div>
                            </td>
                        </tr>
                    ) : campaigns.map(c => (
                        <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(c.status)} shadow-lg shadow-current/20`} />
                                    <div>
                                        <p className="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-tight">{c.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{c.subject}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                                    <MdGroup className="w-3.5 h-3.5" />
                                    Platform Broadcast
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <p className="text-xs text-gray-900 dark:text-white uppercase tracking-tight font-black">
                                    {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString('en-GB') : 'Not Scheduled'}
                                </p>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <button className="p-2 hover:bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:text-white rounded-lg transition-all">
                                    <MdMoreVert className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const EMAIL_TEMPLATES = [
    {
        id: 'product_launch',
        name: '🚀 Product Launch & Announcement',
        description: 'Engaging dark layout showcasing new features, smart voice cloner, list update block, and a primary call-to-action button.',
        html: `<div style="background-color: #0a0a0a; padding: 40px 0; font-family: 'Outfit', Helvetica, Arial, sans-serif; color: #ffffff;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #111111; border-radius: 24px; overflow: hidden; border: 1px solid #333333;">
        <tr>
            <td align="center" style="padding: 40px 0 20px 0;">
                <img src="https://pilotprograme.com/pilotprograme-logo.jpg" alt="PilotPrograme Logo" width="120" style="display: block; border-radius: 12px;" />
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 40px 40px 40px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 8px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">NEW RELEASE</span>
                </div>
                <h1 style="font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-align: center; color: #ffffff; margin-bottom: 16px; line-height: 1.3;">
                    Introducing Our Groundbreaking AI Features
                </h1>
                <p style="font-size: 15px; color: #a1a1aa; text-align: center; margin-bottom: 30px; line-height: 1.6;">
                    Hello {{ name }}, we've just rolled out powerful updates designed to accelerate your workflow. Explore the next generation of AI content creation toolsets.
                </p>
                <div style="background-color: #1a1a1a; border-radius: 16px; padding: 24px; border: 1px solid #222222; margin-bottom: 30px;">
                    <h3 style="color: #ffffff; font-size: 16px; font-weight: 800; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">What's New:</h3>
                    <ul style="color: #a1a1aa; font-size: 14px; padding-left: 20px; margin: 0; line-height: 1.8;">
                        <li><strong>Smart Voice Cloner:</strong> Mimic voices in seconds with high fidelity.</li>
                        <li><strong>Advanced Niche Finder:</strong> Tap into high-CPM YouTube automation blueprints.</li>
                        <li><strong>Improved Script Flow:</strong> Instant storyboards with real-time editing.</li>
                    </ul>
                </div>
                <div style="text-align: center;">
                    <a href="https://pilotprograme.com" style="background-color: #ef4444; color: #ffffff; padding: 16px 36px; border-radius: 12px; font-weight: 800; text-decoration: none; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);">
                        Get Started Now
                    </a>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px; background-color: #000000; border-top: 1px solid #333333; text-align: center;">
                <p style="font-size: 11px; color: #52525b; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin: 0 0 10px 0;">
                    &copy; 2026 PilotPrograme. All rights reserved.
                </p>
                <div style="font-size: 10px; color: #3f3f46;">
                    You are receiving this because you subscribed to updates. <a href="{{ unsubscribe }}" style="color: #ef4444; text-decoration: underline;">Unsubscribe</a>.
                </div>
            </td>
        </tr>
    </table>
</div>`
    },
    {
        id: 'promotional_discount',
        name: '🏷️ Special Discount & Coupon Promo',
        description: 'Urgent conversion-focused email featuring a 30% coupon badge, pricing benefit descriptions, and CTA button.',
        html: `<div style="background-color: #0a0a0a; padding: 40px 0; font-family: 'Outfit', Helvetica, Arial, sans-serif; color: #ffffff;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #111111; border-radius: 24px; overflow: hidden; border: 1px solid #333333;">
        <tr>
            <td align="center" style="padding: 40px 0 20px 0;">
                <img src="https://pilotprograme.com/pilotprograme-logo.jpg" alt="PilotPrograme Logo" width="120" style="display: block; border-radius: 12px;" />
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <span style="background-color: #eab308; color: #000000; padding: 6px 14px; border-radius: 9999px; font-size: 10px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase;">LIMITED TIME OFFER</span>
                </div>
                <h1 style="font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; margin-bottom: 12px; line-height: 1.2;">
                    GET 30% OFF PRO MEMBERSHIP
                </h1>
                <p style="font-size: 15px; color: #a1a1aa; margin-bottom: 30px; line-height: 1.6;">
                    Hello {{ name }}, unlock unlimited render quotas, premium AI scripts, and priority generation speeds today at a massive discount.
                </p>
                <div style="display: inline-block; background-color: #1a1a1a; border: 2px dashed #eab308; border-radius: 16px; padding: 20px 40px; margin-bottom: 30px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #a1a1aa; font-weight: 800; letter-spacing: 2px; margin-bottom: 6px;">Use Promo Code:</div>
                    <div style="font-size: 28px; font-weight: 900; color: #eab308; letter-spacing: 4px;">PROMO30</div>
                </div>
                <div>
                    <a href="https://pilotprograme.com/pricing" style="background-color: #eab308; color: #000000; padding: 16px 36px; border-radius: 12px; font-weight: 900; text-decoration: none; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(234, 179, 8, 0.3);">
                        Claim Discount Now
                    </a>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px; background-color: #000000; border-top: 1px solid #333333; text-align: center;">
                <p style="font-size: 11px; color: #52525b; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin: 0 0 10px 0;">
                    &copy; 2026 PilotPrograme. All rights reserved.
                </p>
                <div style="font-size: 10px; color: #3f3f46;">
                    To stop receiving discount emails, <a href="{{ unsubscribe }}" style="color: #eab308; text-decoration: underline;">unsubscribe</a>.
                </div>
            </td>
        </tr>
    </table>
</div>`
    },
    {
        id: 'weekly_newsletter',
        name: '📣 Weekly Digest & Industry Insights',
        description: 'High-authority structured layout with articles about automation trends, hooks, and growth blueprints.',
        html: `<div style="background-color: #0a0a0a; padding: 40px 0; font-family: 'Outfit', Helvetica, Arial, sans-serif; color: #ffffff;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #111111; border-radius: 24px; overflow: hidden; border: 1px solid #333333;">
        <tr>
            <td align="center" style="padding: 40px 0 20px 0;">
                <img src="https://pilotprograme.com/pilotprograme-logo.jpg" alt="PilotPrograme Logo" width="120" style="display: block; border-radius: 12px;" />
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 40px 40px 40px;">
                <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; text-align: center; color: #ffffff; margin-bottom: 24px;">
                    Weekly Automation Digest
                </h1>
                <div style="font-size: 15px; line-height: 1.8; color: #a1a1aa;">
                    <p>Hey {{ name }},</p>
                    <p>Here is your weekly summary of industry trends, strategies, and growth hacks for building scalable automation channels. Here are the top insights for this week:</p>
                    
                    <h3 style="color: #ffffff; font-size: 16px; margin-top: 24px; margin-bottom: 8px;">1. High CPM Niches to Target in Q3</h3>
                    <p style="margin-top: 0;">Finance and tech reviews are seeing record high CPM rates. Optimize your descriptions and keywords to tap into high value advertisers.</p>
                    
                    <h3 style="color: #ffffff; font-size: 16px; margin-top: 24px; margin-bottom: 8px;">2. Hook Strategies That Drive Retention</h3>
                    <p style="margin-top: 0;">The first 5 seconds of your script define the drop-off. Introduce a visual mystery immediately to keep viewers locked.</p>
                </div>
                <div style="text-align: center; margin-top: 40px;">
                    <a href="https://pilotprograme.com" style="background-color: #ef4444; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 800; text-decoration: none; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; display: inline-block;">
                        Read Full Blog Article
                    </a>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px; background-color: #000000; border-top: 1px solid #333333; text-align: center;">
                <p style="font-size: 11px; color: #52525b; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin: 0 0 10px 0;">
                    &copy; 2026 PilotPrograme. All rights reserved.
                </p>
                <div style="font-size: 10px; color: #3f3f46;">
                    If you wish to stop receiving these emails, <a href="{{ unsubscribe }}" style="color: #ef4444; text-decoration: underline;">unsubscribe</a>.
                </div>
            </td>
        </tr>
    </table>
</div>`
    },
    {
        id: 'clean_slate',
        name: '✉️ Clean Slate / Minimal Text',
        description: 'Simple, lightweight white background slate for direct announcements or plain conversational updates.',
        html: `<div style="background-color: #ffffff; padding: 40px; font-family: sans-serif; color: #333333; max-width: 600px; margin: 0 auto; border: 1px solid #dddddd; border-radius: 8px;">
    <p>Dear {{ name }},</p>
    <p>Write your plain message text here. Keep it clean, direct, and distraction-free.</p>
    <p>Best regards,<br/>The Support Team</p>
</div>`
    }
];

const CreateCampaign = ({ campaign, setCampaign, subjects, users, handleSaveSubject, handleSaveCampaign, saving, TINY_MCE_KEY }) => {
    const [sendToAll, setSendToAll] = useState(campaign.recipients.length === 0);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    const toggleSelectUser = (userId) => {
        const isSelected = campaign.recipients.includes(userId);
        let newRecipients = [];
        if (isSelected) {
            newRecipients = campaign.recipients.filter(id => id !== userId);
        } else {
            newRecipients = [...campaign.recipients, userId];
        }
        setCampaign(prev => ({ ...prev, recipients: newRecipients }));
    };

    const handleToggleSendToAll = (all) => {
        setSendToAll(all);
        if (all) {
            setCampaign(prev => ({ ...prev, recipients: [] }));
        }
    };

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const applyTemplate = (tplHtml) => {
        setCampaign(prev => ({ ...prev, html_content: tplHtml }));
        setShowTemplateModal(false);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in zoom-in-95 fade-in duration-500">
            <div className="xl:col-span-2 space-y-8 pb-20">
                <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3 block">Campaign Name</label>
                            <input
                                type="text"
                                value={campaign.name || ''}
                                onChange={e => setCampaign({ ...campaign, name: e.target.value })}
                                placeholder="e.g. Easter Promo 2026"
                                className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/30 transition-all font-bold placeholder:text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3 block">Schedule Sending</label>
                            <input
                                type="datetime-local"
                                value={campaign.scheduled_at || ''}
                                onChange={e => setCampaign({ ...campaign, scheduled_at: e.target.value })}
                                className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/30 transition-all font-black uppercase tracking-widest tabular-nums inverted-calendar"
                            />
                        </div>
                    </div>

                    {/* Audience Selection */}
                    <div className="border-t border-white/5 pt-6 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Target Audience</h4>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-xs text-gray-900 dark:text-white font-bold cursor-pointer">
                                <input
                                    type="radio"
                                    name="audience"
                                    checked={sendToAll}
                                    onChange={() => handleToggleSendToAll(true)}
                                    className="accent-red-500"
                                />
                                Send to All Verified Users ({users.length})
                            </label>
                            <label className="flex items-center gap-2 text-xs text-gray-900 dark:text-white font-bold cursor-pointer">
                                <input
                                    type="radio"
                                    name="audience"
                                    checked={!sendToAll}
                                    onChange={() => handleToggleSendToAll(false)}
                                    className="accent-red-500"
                                />
                                Send to Selected Users ({campaign.recipients.length} selected)
                            </label>
                        </div>

                        {!sendToAll && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500/30 transition-all font-medium placeholder:text-gray-700"
                                />
                                <div className="max-h-[200px] overflow-y-auto border border-gray-200 dark:border-white/10 rounded-xl divide-y divide-white/5 bg-black/20 custom-scrollbar">
                                    {filteredUsers.length === 0 ? (
                                        <p className="p-4 text-center text-xs text-gray-500 italic">No matching verified users found.</p>
                                    ) : filteredUsers.map(u => {
                                        const isChecked = campaign.recipients.includes(u.id);
                                        return (
                                            <label key={u.id} className="flex items-center gap-3 p-3 hover:bg-white/[0.02] cursor-pointer transition-colors text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectUser(u.id)}
                                                    className="accent-red-500 rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 dark:text-white">{u.full_name}</p>
                                                    <p className="text-[10px] text-gray-500">{u.email}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative group border-t border-white/5 pt-6">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3 block flex justify-between">
                            Subject Line
                            <button
                                onClick={() => handleSaveSubject(campaign.subject)}
                                className="text-red-500 hover:text-red-400 font-black tracking-widest text-[9px] transition-all flex items-center gap-1"
                            >
                                <MdSave /> Store for Later
                            </button>
                        </label>
                        <input
                            type="text"
                            value={campaign.subject || ''}
                            onChange={e => setCampaign({ ...campaign, subject: e.target.value })}
                            placeholder="Hook your audience here..."
                            className="w-full bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/30 transition-all font-bold placeholder:text-gray-700 pr-12"
                        />
                        <div className="absolute right-4 bottom-4 pointer-events-none text-gray-600 dark:text-gray-500 group-hover:text-red-500/50 transition-colors">
                            <MdAutoAwesome />
                        </div>
                    </div>
                </section>

                <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="bg-black/20 px-8 py-5 flex justify-between items-center border-b border-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Email Content (TinyMCE)</h3>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-zinc-800" />
                            <div className="w-2 h-2 rounded-full bg-zinc-800" />
                            <div className="w-2 h-2 rounded-full bg-zinc-800" />
                        </div>
                    </div>
                    <Editor
                        apiKey={TINY_MCE_KEY}
                        value={campaign.html_content || ''}
                        onEditorChange={(content) => setCampaign(prev => ({ ...prev, html_content: content }))}
                        init={{
                            height: 600,
                            menubar: true,
                            skin: "oxide-dark",
                            content_css: "dark",
                            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                            content_style: 'body { font-family:Outfit,Helvetica,Arial,sans-serif; font-size:14px; background-color: #111111; color: #d1d5db; padding: 40px; }'
                        }}
                    />
                </div>
            </div>

            <div className="space-y-6">
                <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <MdHelpCenter className="text-red-500" /> Suggested Subjects
                    </h4>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {subjects.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setCampaign({ ...campaign, subject: s.subject_text })}
                                className="w-full text-left p-3 rounded-xl bg-black/20 hover:bg-gray-200 dark:bg-white/5 border border-white/5 text-[11px] text-gray-600 dark:text-gray-500 dark:text-gray-400 font-bold transition-all line-clamp-2"
                            >
                                {s.subject_text}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="bg-red-500/5 border border-red-500/10 rounded-[2rem] p-6 shadow-xl space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                        <MdEmail /> Quick Actions
                    </h4>
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="w-full bg-red-600 hover:bg-red-700 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/40"
                        >
                            <MdAutoAwesome /> Apply Premium Template
                        </button>
                        <button
                            onClick={() => handleSaveCampaign('draft')}
                            disabled={saving}
                            className="w-full bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 border border-white/5 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <MdSave /> {saving ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button
                            className="w-full bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 border border-white/5 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                            <MdContentCopy /> Duplicate Draft
                        </button>
                    </div>
                </section>
            </div>

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0a0a0a]/80 backdrop-blur-md">
                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MdAutoAwesome className="text-red-500" />
                                    Choose Email Template
                                </h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Select a layout preset to insert into the editor</p>
                            </div>
                            <button 
                                onClick={() => setShowTemplateModal(false)}
                                className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-4">
                            {EMAIL_TEMPLATES.map(tpl => (
                                <button
                                    key={tpl.id}
                                    onClick={() => applyTemplate(tpl.html)}
                                    className="w-full text-left p-5 rounded-2xl bg-black/30 border border-white/5 hover:border-red-500/30 transition-all group flex flex-col gap-1"
                                >
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">{tpl.name}</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">{tpl.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Component ───────────────────────────────────────────────────────────

const AdminMarketing = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [campaigns, setCampaigns] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [toast, setToast] = useState(null);

    const [campaign, setCampaign] = useState({
        name: '',
        subject: '',
        html_content: '',
        scheduled_at: '',
        status: 'draft',
        recipients: []
    });

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const TINY_MCE_KEY = '68p6fs0nyu59icihoyv7sk06p6olzz92r68eg3heah8qx3tb';

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        document.title = "Email Marketing | AI Studio Admin";
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [cRes, sRes, uRes] = await Promise.all([
                fetch(`${API_URL}/admin/marketing/campaigns`),
                fetch(`${API_URL}/admin/marketing/subjects`),
                fetch(`${API_URL}/admin/marketing/recipients`)
            ]);

            const [cData, sData, uData] = await Promise.all([
                cRes.json(), sRes.json(), uRes.json()
            ]);

            if (cData.success) setCampaigns(cData.campaigns);
            if (sData.success) setSubjects(sData.subjects);
            if (uData.success) setUsers(uData.users);
        } catch (error) {
            showToast('Connection failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSubject = async (text) => {
        if (!text) return;
        try {
            const res = await fetch(`${API_URL}/admin/marketing/subjects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject_text: text })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Subject stored');
                fetchInitialData();
            }
        } catch (error) {
            showToast('Failed to save subject', 'error');
        }
    };

    const handleSendTest = async () => {
        if (!campaign.subject || !campaign.html_content) {
            showToast('Subject and content required for test', 'error');
            return;
        }
        setTesting(true);
        try {
            const res = await fetch(`${API_URL}/admin/marketing/test-send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaign)
            });
            const data = await res.json();
            if (data.success) {
                showToast('Test email sent successfully');
            } else {
                showToast(data.message || 'Test failed', 'error');
            }
        } catch (error) {
            showToast('Network error during test', 'error');
        } finally {
            setTesting(false);
        }
    };

    const handleLoadTemplate = () => {
        const logoUrl = "https://pilotprograme.com/pilotprograme-logo.jpg";
        const siteUrl = "https://pilotprograme.com";
        const fbUrl = "https://facebook.com/PilotProgram";

        const template = `
<div style="background-color: #0a0a0a; padding: 40px 0; font-family: 'Outfit', Helvetica, Arial, sans-serif; color: #ffffff;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #111111; border-radius: 24px; overflow: hidden; border: 1px solid #333333;">
        <tr>
            <td align="center" style="padding: 40px 0 20px 0;">
                <img src="${logoUrl}" alt="PilotPrograme Logo" width="120" style="display: block; border-radius: 12px;" />
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 40px 40px 40px;">
                <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; text-align: center; color: #ffffff; margin-bottom: 24px;">
                    Weekly Update & Insights
                </h1>
                <div style="font-size: 16px; line-height: 1.8; color: #a1a1aa; text-align: left;">
                    <p>Enter your personalized message here. Use the editor to add images, links, and styling to make this campaign your own.</p>
                </div>
                <div style="text-align: center; margin-top: 40px;">
                    <a href="${siteUrl}" style="background-color: #ef4444; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 800; text-decoration: none; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);">
                        Login to check your account
                    </a>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px; background-color: #000000; border-top: 1px solid #333333; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <a href="${fbUrl}" style="margin: 0 10px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700;">FACEBOOK</a>
                    <a href="#" style="margin: 0 10px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700;">INSTAGRAM</a>
                    <a href="#" style="margin: 0 10px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700;">X (TWITTER)</a>
                    <a href="#" style="margin: 0 10px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700;">YOUTUBE</a>
                </div>
                <p style="font-size: 11px; color: #52525b; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">
                    &copy; 2026 PilotPrograme. All rights reserved.
                </p>
                <div style="margin-top: 15px; font-size: 10px; color: #3f3f46;">
                    If you wish to stop receiving these emails, <a href="{{ unsubscribe }}" style="color: #ef4444; text-decoration: underline;">unsubscribe here</a>.
                </div>
            </td>
        </tr>
    </table>
</div>
        `;
        setCampaign(prev => ({ ...prev, html_content: template }));
        showToast('Premium Template Loaded');
    };

    const handleSaveCampaign = async (statusOverride = 'draft') => {
        if (!campaign.name || !campaign.subject) {
            showToast('Name and Subject are required', 'error');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/admin/marketing/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...campaign, status: statusOverride })
            });
            const data = await res.json();
            if (data.success) {
                showToast(statusOverride === 'scheduled' ? 'Campaign scheduled!' : 'Draft saved');
                // IMPORTANT: Fetch data to refresh the list and move to list view
                await fetchInitialData();
                setView('list');
                // Reset form
                setCampaign({
                    name: '',
                    subject: '',
                    html_content: '',
                    scheduled_at: '',
                    status: 'draft',
                    recipients: []
                });
            } else {
                showToast(data.message || 'Save failed', 'error');
            }
        } catch (error) {
            showToast('Network error during save', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                <Header
                    view={view}
                    setView={setView}
                    loading={loading}
                    onRefresh={fetchInitialData}
                    onTest={handleSendTest}
                    onSchedule={handleSaveCampaign}
                    testing={testing}
                    saving={saving}
                    isScheduled={!!campaign.scheduled_at}
                />

                <div className="p-6 sm:p-10 max-w-[1400px] mx-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-40 gap-4">
                            <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">Connecting to mail servers...</p>
                        </div>
                    ) : (
                        view === 'list' ? (
                            <CampaignList campaigns={campaigns} users={users} />
                        ) : (
                            <CreateCampaign
                                campaign={campaign}
                                setCampaign={setCampaign}
                                subjects={subjects}
                                users={users}
                                handleSaveSubject={handleSaveSubject}
                                handleSaveCampaign={handleSaveCampaign}
                                saving={saving}
                                TINY_MCE_KEY={TINY_MCE_KEY}
                            />
                        )
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-10 flex items-center gap-3 border ${toast.type === 'error' ? 'bg-red-600 text-gray-900 dark:text-white border-red-400' : 'bg-white text-black border-white'
                    }`}>
                    {toast.type === 'error' ? <MdError size={20} /> : <MdCheckCircle size={20} />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default AdminMarketing;
