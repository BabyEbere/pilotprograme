"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    MdClose, MdSend, MdSupportAgent,
    MdWarning, MdConfirmationNumber, MdRefresh, MdImage,
} from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000');
const MAX_MB = 5;

function getSessionId() {
    let sid = sessionStorage.getItem('support_session');
    if (!sid) {
        sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem('support_session', sid);
    }
    return sid;
}

function timeStr(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ImageBubble({ url }) {
    const base = typeof (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000') !== 'undefined' ? (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000').replace('/api', '') : '';
    const src = url.startsWith('http') ? url : `${base}${url}`;
    return (
        <a href={src} target="_blank" rel="noreferrer">
            <img
                src={src}
                alt="attachment"
                className="mt-1 rounded-xl max-w-[220px] max-h-[180px] object-cover border border-gray-200 dark:border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
            />
        </a>
    );
}

// Converts Gemini's **bold** and *italic* markdown into safe HTML
function renderMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
}

export default function SupportWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [aiDisabled, setAiDisabled] = useState(() => localStorage.getItem('support_ticket_open') === '1');
    const [ticketOpen, setTicketOpen] = useState(() => localStorage.getItem('support_ticket_open') === '1');
    const [ticketId, setTicketId] = useState(() => localStorage.getItem('support_ticket_id') || null);
    const [unread, setUnread] = useState(() => parseInt(localStorage.getItem('support_unread') || '0'));

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const fileRef = useRef(null);
    const lastIdRef = useRef(parseInt(localStorage.getItem('support_last_id') || '0'));
    const openRef = useRef(false);

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const sessionId = getSessionId();

    useEffect(() => { openRef.current = open; }, [open]);

    // Persist state
    useEffect(() => { localStorage.setItem('support_ticket_open', ticketOpen ? '1' : '0'); }, [ticketOpen]);
    useEffect(() => { if (ticketId) localStorage.setItem('support_ticket_id', String(ticketId)); }, [ticketId]);
    useEffect(() => { localStorage.setItem('support_unread', String(unread)); }, [unread]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Startup check — detect unread admin replies across page loads
    useEffect(() => {
        if (!ticketOpen) return;
        (async () => {
            try {
                const res = await fetch(`${API_URL}/support/poll?session_id=${sessionId}&after_id=${lastIdRef.current}`);
                const data = await res.json();
                if (!data.success) return;
                const adminReplies = (data.messages || []).filter(m => m.role === 'admin');
                if (adminReplies.length > 0) {
                    const ids = data.messages.map(m => m.id).filter(Boolean);
                    if (ids.length) {
                        lastIdRef.current = Math.max(...ids);
                        localStorage.setItem('support_last_id', String(lastIdRef.current));
                    }
                    setUnread(u => u + adminReplies.length);
                }
                if (data.ai_disabled !== undefined) setAiDisabled(data.ai_disabled);
            } catch { /* silent */ }
        })();
    }, []);

    // Background poll when ticket is active
    const poll = useCallback(async () => {
        if (!ticketOpen) return;
        try {
            const res = await fetch(`${API_URL}/support/poll?session_id=${sessionId}&after_id=${lastIdRef.current}`);
            const data = await res.json();
            if (!data.success || !data.messages.length) return;

            const newMsgs = data.messages.filter(m => m.id > lastIdRef.current);
            if (!newMsgs.length) return;

            lastIdRef.current = Math.max(...data.messages.map(m => m.id));
            localStorage.setItem('support_last_id', String(lastIdRef.current));

            setMessages(prev => [...prev, ...newMsgs]);

            const adminReplies = newMsgs.filter(m => m.role === 'admin');
            if (adminReplies.length > 0 && !openRef.current) {
                setUnread(u => u + adminReplies.length);
                if (Notification.permission === 'granted') {
                    try {
                        new Notification('Pilot Programme Support', {
                            body: adminReplies[adminReplies.length - 1].message.slice(0, 80),
                            icon: '/favicon.ico',
                            tag: 'pilotprogramme-support',
                        });
                    } catch { /* blocked */ }
                }
            }
            if (data.ai_disabled !== undefined) setAiDisabled(data.ai_disabled);
        } catch { /* silent */ }
    }, [ticketOpen, sessionId]);

    useEffect(() => {
        if (!ticketOpen) return;
        const interval = setInterval(poll, 8000);
        return () => clearInterval(interval);
    }, [poll, ticketOpen]);

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Open / close
    useEffect(() => {
        if (open) {
            setUnread(0);
            localStorage.setItem('support_unread', '0');
            inputRef.current?.focus();
            if (messages.length === 0) loadHistory();
        }
    }, [open]);

    const loadHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/support/history?session_id=${sessionId}`);
            const data = await res.json();
            if (data.success && data.messages?.length > 0) {
                setMessages(data.messages);
                const ids = data.messages.map(m => m.id).filter(Boolean);
                if (ids.length) {
                    lastIdRef.current = Math.max(...ids);
                    localStorage.setItem('support_last_id', String(lastIdRef.current));
                }
                if (data.ai_disabled) { setAiDisabled(true); setTicketOpen(true); }
                if (data.ticket_id) setTicketId(data.ticket_id);
            } else {
                setMessages([{
                    role: 'assistant',
                    message: "Hey! I'm the Pilot Programme AI support assistant.\n\nI can help with scripts, audio, images, billing, and anything else about the platform. What do you need?",
                    time: new Date().toISOString(),
                }]);
            }
        } catch {
            setMessages([{
                role: 'assistant',
                message: "Hi! I'm the Pilot Programme support assistant. How can I help?",
                time: new Date().toISOString(),
            }]);
        }
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || sending) return;

        const userMsg = { role: 'user', message: text, time: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSending(true);

        try {
            const res = await fetch(`${API_URL}/support/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: text,
                    user_id: user?.id || null,
                    user_email: user?.email || '',
                    user_name: user?.full_name || user?.name || 'Guest',
                }),
            });
            const data = await res.json();

            if (data.success) {
                // Update AI disabled state from server response
                if (data.ai_disabled) {
                    setAiDisabled(true);
                    setTicketOpen(true);
                }
                if (data.reply) {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        message: data.reply,
                        escalated: data.escalated,
                        time: new Date().toISOString(),
                    }]);
                }
                if (data.escalated) {
                    setAiDisabled(true);
                    setTicketOpen(true);
                    if (data.ticket_id) setTicketId(data.ticket_id);
                    // Re-fetch to get the confirmation message
                    await loadHistory();
                }
                // Sync lastId
                const hr = await fetch(`${API_URL}/support/history?session_id=${sessionId}`);
                const hd = await hr.json();
                if (hd.success && hd.messages?.length) {
                    const ids = hd.messages.map(m => m.id).filter(Boolean);
                    if (ids.length) {
                        lastIdRef.current = Math.max(...ids);
                        localStorage.setItem('support_last_id', String(lastIdRef.current));
                    }
                }
            } else {
                setMessages(prev => [...prev, { role: 'assistant', message: data.message || 'Something went wrong.', time: new Date().toISOString() }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', message: 'Connection error.', time: new Date().toISOString() }]);
        } finally {
            setSending(false);
        }
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_MB * 1024 * 1024) { alert(`Max ${MAX_MB}MB`); return; }

        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('session_id', sessionId);
        fd.append('user_id', user?.id || '');
        fd.append('user_email', user?.email || '');
        fd.append('user_name', user?.full_name || user?.name || 'Guest');

        try {
            const res = await fetch(`${API_URL}/support/upload-image`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, {
                    id: data.id,
                    role: 'user',
                    message: '[Image]',
                    image_url: data.image_url,
                    time: new Date().toISOString(),
                }]);
                if (data.id) {
                    lastIdRef.current = Math.max(lastIdRef.current, data.id);
                    localStorage.setItem('support_last_id', String(lastIdRef.current));
                }
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch {
            alert('Upload error. Please try again.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const openTicketManually = async () => {
        try {
            const res = await fetch(`${API_URL}/support/ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    user_id: user?.id || null,
                    user_email: user?.email || '',
                    user_name: user?.full_name || user?.name || 'Guest',
                }),
            });
            const data = await res.json();
            if (data.success) {
                setTicketId(data.ticket_id);
                setTicketOpen(true);
                setAiDisabled(true);
                await loadHistory(); // get the system confirmation message
            }
        } catch { /* silent */ }
    };

    const newChat = () => {
        const newId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem('support_session', newId);
        ['support_ticket_open', 'support_ticket_id', 'support_last_id', 'support_unread'].forEach(k => localStorage.removeItem(k));
        setMessages([]);
        setInput('');
        setAiDisabled(false);
        setTicketOpen(false);
        setTicketId(null);
        setUnread(0);
        lastIdRef.current = 0;
        setTimeout(loadHistory, 100);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const isDisabled = sending || uploading;

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Support chat"
            >
                {open ? <MdClose className="w-6 h-6" /> : (
                    <>
                        <MdSupportAgent className="w-7 h-7" />
                        {unread > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 text-gray-900 dark:text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-bounce">
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div
                    className="fixed bottom-36 right-4 lg:bottom-24 lg:right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
                    style={{ height: '520px' }}
                >
                    {/* Header */}
                    <div className="bg-gray-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200/50 dark:bg-white/10 rounded-full flex items-center justify-center">
                                <MdSupportAgent className="w-5 h-5 text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Pilot Programme Support</p>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${aiDisabled ? 'bg-amber-400' : 'bg-green-400'}`} />
                                    <p className="text-[11px] text-gray-900 dark:text-white/50">
                                        {aiDisabled ? 'Human agent assigned' : 'AI Assistant · Online'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={newChat} className="p-1.5 text-gray-900 dark:text-white/40 hover:text-gray-900 dark:text-white/80 transition-colors" title="New chat">
                                <MdRefresh className="w-4 h-4" />
                            </button>
                            <button onClick={() => setOpen(false)} className="p-1.5 text-gray-900 dark:text-white/40 hover:text-gray-900 dark:text-white/80 transition-colors">
                                <MdClose className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Ticket banner */}
                    {ticketOpen && (
                        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                            <MdConfirmationNumber className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <p className="text-xs text-amber-800 font-medium">
                                {ticketId
                                    ? `Ticket #${ticketId} · Human agent will reply here`
                                    : 'Escalated to human support'}
                            </p>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {messages.map((msg, i) => (
                            <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[82%]">
                                    {msg.role === 'admin' && (
                                        <p className="text-[10px] font-bold text-red-600 mb-1 ml-1">Support Team</p>
                                    )}
                                    <div
                                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-gray-900 text-gray-900 dark:text-white rounded-br-sm whitespace-pre-wrap'
                                                : msg.role === 'admin'
                                                    ? 'bg-red-50 border border-red-200 text-red-900 rounded-bl-sm'
                                                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                        }`}
                                    >
                                        {msg.role === 'user' ? (
                                            msg.message !== '[Image]' && msg.message
                                        ) : (
                                            msg.message !== '[Image]' && (
                                                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.message) }} />
                                            )
                                        )}
                                        {msg.image_url && <ImageBubble url={msg.image_url} />}
                                    </div>
                                    <div className={`flex items-center gap-1 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <p className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400">{timeStr(msg.time)}</p>
                                        {msg.escalated && (
                                            <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                                                <MdWarning className="w-3 h-3" /> escalated
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(sending || uploading) && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                                    <div className="flex gap-1 items-center">
                                        {[0, 150, 300].map(d => (
                                            <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Human agent CTA — only when AI is still active */}
                    {!ticketOpen && messages.length >= 3 && (
                        <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
                            <button
                                onClick={openTicketManually}
                                className="w-full text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500 py-1 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <MdConfirmationNumber className="w-3.5 h-3.5" />
                                Talk to a human agent instead
                            </button>
                        </div>
                    )}

                    {/* AI disabled notice */}
                    {aiDisabled && (
                        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex-shrink-0">
                            <p className="text-[11px] text-amber-700 text-center">
                                AI paused · Your messages go directly to the support team
                            </p>
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
                        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-gray-400 transition-colors">
                            {/* Image upload */}
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={handleImageSelect}
                            />
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={isDisabled}
                                className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0 mb-0.5"
                                title="Attach image"
                            >
                                <MdImage className="w-5 h-5" />
                            </button>

                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder={aiDisabled ? 'Message support team…' : 'Type a message…'}
                                disabled={isDisabled}
                                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-24 disabled:opacity-50"
                                style={{ lineHeight: '1.4' }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isDisabled}
                                className="w-8 h-8 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-600 dark:text-gray-500 dark:text-gray-400 text-gray-900 dark:text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0 mb-0.5"
                            >
                                <MdSend className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 text-center mt-1.5">
                            {aiDisabled ? 'Human support active' : 'Pilot Programme · Support AI'}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}