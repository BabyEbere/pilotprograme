"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import {
    MdConfirmationNumber, MdChatBubble, MdRefresh,
    MdWarning, MdArrowBack, MdEdit, MdSave,
    MdPerson, MdSupportAgent, MdImage,
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

function AdminImageBubble({ url }) {
    const base = API_URL.replace('/api', '');
    const src = url.startsWith('http') ? url : `${base}${url}`;
    return (
        <a href={src} target="_blank" rel="noreferrer">
            <img src={src} alt="attachment" className="mt-1 rounded-xl max-w-[220px] max-h-[180px] object-cover border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer" />
        </a>
    );
}
const STATUS_META = {
    open: { label: 'Open', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    in_progress: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    resolved: { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    closed: { label: 'Closed', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100', border: 'border-gray-200' },
};

const PRIORITY_META = {
    low: { label: 'Low', dot: 'bg-gray-400' },
    normal: { label: 'Normal', dot: 'bg-blue-500' },
    high: { label: 'High', dot: 'bg-amber-500' },
    urgent: { label: 'Urgent', dot: 'bg-red-500' },
};

function timeAgo(d) {
    if (!d) return '';
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

function timeStr(d) {
    if (!d) return '';
    return new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function AdminSupportContent() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({});
    const [filter, setFilter] = useState('open');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [loadingChat, setLoadingChat] = useState(false);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [reply, setReply] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const bottomRef = useRef(null);

    const adminData = JSON.parse(localStorage.getItem('user') || '{}');
    const headers = { Authorization: `Bearer ${adminData.token}`, 'Content-Type': 'application/json' };

    useEffect(() => { fetchStats(); fetchTickets(); }, []);
    useEffect(() => { fetchTickets(); }, [filter]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected?.messages]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/support/stats`, { headers });
            const data = await res.json();
            if (data.success) setStats(data);
        } catch { /* ignore */ }
    };

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const url = filter === 'all'
                ? `${API_URL}/admin/support/tickets`
                : `${API_URL}/admin/support/tickets?status=${filter}`;
            const res = await fetch(url, { headers });
            const data = await res.json();
            if (data.success) setTickets(data.tickets);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    const openTicket = async (ticket) => {
        setLoadingChat(true);
        setNotes(ticket.admin_notes || '');
        try {
            const res = await fetch(`${API_URL}/admin/support/tickets/${ticket.id}/chat`, { headers });
            const data = await res.json();
            if (data.success) setSelected({ ticket: data.ticket, messages: data.messages });
        } catch { /* ignore */ }
        finally { setLoadingChat(false); }
    };

    const updateTicket = async (id, patch) => {
        try {
            await fetch(`${API_URL}/admin/support/tickets/${id}`, {
                method: 'PATCH', headers, body: JSON.stringify(patch),
            });
            fetchTickets();
            if (selected?.ticket?.id === id)
                setSelected(prev => prev ? { ...prev, ticket: { ...prev.ticket, ...patch } } : prev);
        } catch { /* ignore */ }
    };

    const saveNotes = async () => {
        if (!selected) return;
        setSavingNotes(true);
        await updateTicket(selected.ticket.id, { admin_notes: notes });
        setSavingNotes(false);
    };

    const sendReply = async () => {
        const text = reply.trim();
        if (!text || !selected || sendingReply) return;
        setSendingReply(true);
        try {
            const res = await fetch(`${API_URL}/admin/support/tickets/${selected.ticket.id}/reply`, {
                method: 'POST', headers, body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            if (data.success) {
                setReply('');
                // Append reply to local messages immediately
                setSelected(prev => prev ? {
                    ...prev,
                    ticket: { ...prev.ticket, status: prev.ticket.status === 'open' ? 'in_progress' : prev.ticket.status },
                    messages: [...prev.messages, {
                        role: 'admin',
                        message: text,
                        escalated: false,
                        created_at: new Date().toISOString(),
                    }],
                } : prev);
                fetchTickets(); // refresh list to show updated status
            } else {
                alert(data.message || 'Failed to send reply');
            }
        } catch {
            alert('Network error sending reply');
        } finally {
            setSendingReply(false);
        }
    };

    const FILTERS = [
        { key: 'open', label: 'Open', badge: stats.open_tickets },
        { key: 'in_progress', label: 'In Progress' },
        { key: 'resolved', label: 'Resolved' },
        { key: 'closed', label: 'Closed' },
        { key: 'all', label: 'All', badge: stats.total_tickets },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MdConfirmationNumber className="w-5 h-5 text-red-600" />
                            Support
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {stats.open_tickets || 0} open · {stats.total_tickets || 0} total · {stats.chat_sessions || 0} AI sessions
                        </p>
                    </div>
                    <button
                        onClick={() => { fetchStats(); fetchTickets(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        <MdRefresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">

                    {/* Ticket list */}
                    <div className={`flex flex-col border-r border-gray-200 bg-white flex-shrink-0 ${selected ? 'hidden lg:flex lg:w-80' : 'w-full lg:w-80'}`}>

                        {/* Filter tabs */}
                        <div className="flex gap-1 p-3 border-b border-gray-100 overflow-x-auto">
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${filter === f.key ? 'bg-gray-900 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {f.label}
                                    {f.badge !== undefined && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === f.key ? 'bg-white/20' : 'bg-gray-200 text-gray-600 dark:text-gray-500'}`}>
                                            {f.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <MdConfirmationNumber className="w-10 h-10 text-gray-200 mb-2" />
                                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400">No {filter} tickets</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {tickets.map(ticket => {
                                        const sm = STATUS_META[ticket.status] || STATUS_META.open;
                                        const pm = PRIORITY_META[ticket.priority] || PRIORITY_META.normal;
                                        const isActive = selected?.ticket?.id === ticket.id;
                                        return (
                                            <button
                                                key={ticket.id}
                                                onClick={() => openTicket(ticket)}
                                                className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors ${isActive ? 'bg-gray-50 border-r-2 border-r-gray-900' : ''}`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-500 dark:text-gray-400">#{ticket.id}</span>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${sm.color} ${sm.bg} ${sm.border}`}>
                                                                {sm.label}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />
                                                                <span className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400">{pm.label}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{ticket.user_name || 'Guest'}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{ticket.subject || 'No subject'}</p>
                                                    </div>
                                                    <p className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 flex-shrink-0">{timeAgo(ticket.created_at)}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ticket detail */}
                    {selected ? (
                        <div className="flex-1 flex flex-col overflow-hidden">

                            {/* Ticket meta bar */}
                            <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelected(null)} className="lg:hidden p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700">
                                        <MdArrowBack className="w-4 h-4" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-gray-900">{selected.ticket.user_name || 'Guest'}</p>
                                            <span className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400">#{selected.ticket.id}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{selected.ticket.user_email || 'No email'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selected.ticket.priority}
                                        onChange={e => updateTicket(selected.ticket.id, { priority: e.target.value })}
                                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:border-gray-400"
                                    >
                                        {Object.entries(PRIORITY_META).map(([k, v]) => (
                                            <option key={k} value={k}>{v.label}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selected.ticket.status}
                                        onChange={e => updateTicket(selected.ticket.id, { status: e.target.value })}
                                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:border-gray-400"
                                    >
                                        {Object.entries(STATUS_META).map(([k, v]) => (
                                            <option key={k} value={k}>{v.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Chat transcript */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
                                {loadingChat ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                                    </div>
                                ) : selected.messages.length === 0 ? (
                                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 text-center py-12">No messages.</p>
                                ) : selected.messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {(msg.role === 'assistant' || msg.role === 'admin') && (
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'admin' ? 'bg-red-600' : 'bg-gray-900'}`}>
                                                {msg.role === 'admin'
                                                    ? <MdPerson className="w-4 h-4 text-gray-900 dark:text-white" />
                                                    : <MdSupportAgent className="w-4 h-4 text-gray-900 dark:text-white" />
                                                }
                                            </div>
                                        )}
                                        <div className="max-w-[75%]">
                                            {msg.role === 'admin' && (
                                                <p className="text-[10px] font-bold text-red-600 mb-1 ml-1">Support Team</p>
                                            )}
                                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user'
                                                ? 'bg-gray-900 text-gray-900 dark:text-white rounded-br-sm'
                                                : msg.role === 'admin'
                                                    ? 'bg-red-50 border border-red-200 text-red-900 rounded-bl-sm'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                                                }`}>
                                                {msg.message !== '[Image]' && msg.message}
                                                {msg.image_url && <AdminImageBubble url={msg.image_url} />}
                                            </div>
                                            <div className={`flex items-center gap-1.5 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400">{timeStr(msg.created_at)}</p>
                                                {msg.escalated && (
                                                    <span className="text-[10px] text-amber-500 flex items-center gap-0.5 font-semibold">
                                                        <MdWarning className="w-3 h-3" /> escalated
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <MdPerson className="w-4 h-4 text-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>

                            {/* Reply to user */}
                            <div className="bg-white border-t border-gray-200 px-5 py-3 flex-shrink-0">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <MdSupportAgent className="w-3.5 h-3.5" /> Reply to User
                                </p>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <textarea
                                            rows={2}
                                            value={reply}
                                            onChange={e => setReply(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                                            placeholder="Type a reply — the user will see this in their chat widget…"
                                            className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-400 resize-none pr-9"
                                        />
                                        {/* Image attach inside textarea */}
                                        <input type="file" accept="image/*" className="hidden" id="admin-reply-img"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const fd = new FormData();
                                                fd.append('file', file);
                                                fd.append('session_id', selected.ticket.session_id);
                                                fd.append('user_id', selected.ticket.user_id || '');
                                                fd.append('user_email', selected.ticket.user_email || '');
                                                fd.append('user_name', 'Support Team');
                                                // Upload via support endpoint
                                                try {
                                                    const res = await fetch(`${API_URL}/support/upload-image`, { method: 'POST', body: fd });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        // Post as admin message with image_url
                                                        await fetch(`${API_URL}/admin/support/tickets/${selected.ticket.id}/reply`, {
                                                            method: 'POST', headers,
                                                            body: JSON.stringify({ message: reply || '[Image]', image_url: data.image_url }),
                                                        });
                                                        setReply('');
                                                        openTicket(selected.ticket);
                                                        fetchTickets();
                                                    }
                                                } catch { alert('Upload failed'); }
                                                e.target.value = '';
                                            }}
                                        />
                                        <label htmlFor="admin-reply-img" className="absolute right-2 bottom-2 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500 cursor-pointer transition-colors">
                                            <MdImage className="w-4 h-4" />
                                        </label>
                                    </div>
                                    <button
                                        onClick={sendReply}
                                        disabled={!reply.trim() || sendingReply}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-600 dark:text-gray-500 dark:text-gray-400 text-gray-900 dark:text-white rounded-xl transition-colors flex items-center gap-1.5 text-sm font-semibold self-end"
                                    >
                                        {sendingReply
                                            ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            : <MdSave className="w-4 h-4" />
                                        }
                                        Send
                                    </button>
                                </div>
                            </div>

                            {/* Admin notes (internal only) */}
                            <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex-shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                        <MdEdit className="w-3.5 h-3.5" /> Internal Notes (not visible to user)
                                    </p>
                                    <button
                                        onClick={saveNotes}
                                        disabled={savingNotes}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {savingNotes
                                            ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                                            : <MdSave className="w-3.5 h-3.5" />
                                        }
                                        Save
                                    </button>
                                </div>
                                <textarea
                                    rows={2}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Private notes about this ticket…"
                                    className="w-full text-sm text-gray-600 dark:text-gray-500 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 resize-none bg-white"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <MdChatBubble className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-500 dark:text-gray-400">Select a ticket to view the conversation</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminSupport() {
    return (
        <Suspense fallback={<div className="p-6 text-xs font-bold text-gray-500">Loading Support...</div>}>
            <AdminSupportContent />
        </Suspense>
    );
}