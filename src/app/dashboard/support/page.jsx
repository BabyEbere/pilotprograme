"use client";

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { LifeBuoy, Send, Plus, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import Toast from '@/components/Toast';

export default function SupportDashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [toastMsg, setToastMsg] = useState(null);

    // New Ticket Form State
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketMessage, setTicketMessage] = useState('');
    const [submittingTicket, setSubmittingTicket] = useState(false);

    const chatEndRef = useRef(null);

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    useEffect(() => {
        if (user?.id) {
            fetchTickets();
        }
    }, [user?.id]);

    useEffect(() => {
        if (selectedTicket) {
            fetchChatHistory(selectedTicket.session_id);
        }
    }, [selectedTicket]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_URL}/support/user-tickets?user_id=${user.id}`);
            const data = await res.json();
            if (data.success) {
                const fetchedTickets = data.tickets || [];
                setTickets(fetchedTickets);
                if (fetchedTickets.length > 0 && !selectedTicket) {
                    setSelectedTicket(fetchedTickets[0]);
                }
            }
        } catch {
            setToastMsg({ type: 'error', message: 'Failed to load tickets.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchChatHistory = async (sessionId) => {
        setLoadingChat(true);
        try {
            const res = await fetch(`${API_URL}/support/history?session_id=${sessionId}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.history || []);
            }
        } catch {
            setToastMsg({ type: 'error', message: 'Failed to load chat history.' });
        } finally {
            setLoadingChat(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const text = newMessage;
        setNewMessage('');

        // Optimistically add to UI
        const tempMsg = {
            id: Date.now(),
            role: 'user',
            message: text,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await fetch(`${API_URL}/support/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: selectedTicket.session_id,
                    message: text,
                    user_id: user.id,
                    user_email: user.email,
                    user_name: user.full_name
                })
            });
            const data = await res.json();
            if (!data.success) {
                setToastMsg({ type: 'error', message: data.message || 'Failed to send message.' });
            } else {
                fetchChatHistory(selectedTicket.session_id);
            }
        } catch {
            setToastMsg({ type: 'error', message: 'Error sending message.' });
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!ticketSubject.trim() || !ticketMessage.trim()) return;

        setSubmittingTicket(true);
        try {
            const res = await fetch(`${API_URL}/support/user-tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    user_email: user.email,
                    user_name: user.full_name,
                    subject: ticketSubject,
                    message: ticketMessage
                })
            });
            const data = await res.json();
            if (data.success) {
                setToastMsg({ type: 'success', message: 'Support ticket opened successfully!' });
                setShowNewTicketModal(false);
                setTicketSubject('');
                setTicketMessage('');
                // Refresh tickets and select the new one
                const newT = {
                    id: data.ticket_id,
                    session_id: data.session_id,
                    subject: ticketSubject,
                    status: 'open',
                    created_at: new Date().toISOString()
                };
                setTickets(prev => [newT, ...prev]);
                setSelectedTicket(newT);
            } else {
                setToastMsg({ type: 'error', message: data.message || 'Failed to create ticket.' });
            }
        } catch {
            setToastMsg({ type: 'error', message: 'Error creating support ticket.' });
        } finally {
            setSubmittingTicket(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'closed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <LifeBuoy className="w-5 h-5 text-purple-500" />
                            Support Tickets
                        </h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Submit technical tickets or chat directly with our helpdesk team.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={fetchTickets}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                            title="Refresh Tickets"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setShowNewTicketModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Ticket
                        </button>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Tickets Sidebar */}
                    <div className="w-80 border-r border-gray-200 dark:border-white/5 flex flex-col bg-gray-50/50 dark:bg-[#0e0e0e]/20 overflow-y-auto">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="flex-1 p-6 text-center text-gray-500 dark:text-gray-400 flex flex-col justify-center items-center space-y-2">
                                <MessageSquare className="w-8 h-8 opacity-40" />
                                <p className="text-xs">No support tickets found.</p>
                                <button 
                                    onClick={() => setShowNewTicketModal(true)}
                                    className="text-xs text-purple-500 font-semibold hover:underline"
                                >
                                    Create a ticket now
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-white/5">
                                {tickets.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTicket(t)}
                                        className={`w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex flex-col space-y-2 ${selectedTicket?.id === t.id ? 'bg-purple-500/5 dark:bg-purple-500/5' : ''}`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500">TICKET #{t.id}</span>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(t.status)}`}>
                                                {t.status}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate w-full">{t.subject}</h4>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {new Date(t.created_at).toLocaleDateString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] overflow-hidden">
                        {selectedTicket ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-[#111111]/30">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                                            {selectedTicket.subject}
                                        </h3>
                                        <span className="text-[9px] text-gray-400 dark:text-gray-500">Ticket ID: #{selectedTicket.id}</span>
                                    </div>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(selectedTicket.status)}`}>
                                        {selectedTicket.status}
                                    </span>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {loadingChat ? (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-xs text-gray-400">
                                            No messages in this ticket yet.
                                        </div>
                                    ) : (
                                        messages.map((m, idx) => {
                                            const isUser = m.role === 'user';
                                            const isSystem = m.role === 'assistant' && !isUser;
                                            return (
                                                <div 
                                                    key={m.id || idx} 
                                                    className={`flex ${isUser ? 'justify-end' : isSystem ? 'justify-center' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                                                        isUser ? 'bg-purple-600 text-gray-900 dark:text-white rounded-tr-none' :
                                                        isSystem ? 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 text-center rounded-lg max-w-[90%]' :
                                                        'bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 rounded-tl-none'
                                                    }`}>
                                                        <p className="whitespace-pre-line">{m.message}</p>
                                                        {m.image_url && (
                                                            <div className="mt-2 rounded-lg overflow-hidden max-w-sm">
                                                                <img src={m.image_url} alt="attachment" className="w-full max-h-48 object-cover" />
                                                            </div>
                                                        )}
                                                        <span className="block text-[9px] opacity-40 text-right mt-1">
                                                            {new Date(m.created_at || m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Chat Input */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-white/5 flex gap-2 bg-gray-50/30 dark:bg-[#0e0e0e]/10">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder={selectedTicket.status === 'closed' ? "This ticket is closed." : "Type your reply..."}
                                        disabled={selectedTicket.status === 'closed'}
                                        className="flex-1 bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-white/5 text-xs text-gray-900 dark:text-white rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none px-4 py-3 placeholder-gray-500 disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || selectedTicket.status === 'closed'}
                                        className="bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white p-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                                <MessageSquare className="w-12 h-12 opacity-35 mb-2" />
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">No ticket selected</h3>
                                <p className="text-xs text-gray-500 mt-1">Select a ticket from the list or open a new one.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Ticket Modal */}
            {showNewTicketModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Open Support Ticket</h2>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Subject</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="Briefly state the issue..."
                                    value={ticketSubject}
                                    onChange={e => setTicketSubject(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Message / Details</label>
                                <textarea 
                                    required
                                    rows="5"
                                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                    placeholder="Explain your problem or question in detail..."
                                    value={ticketMessage}
                                    onChange={e => setTicketMessage(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowNewTicketModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-xl font-bold transition-all text-xs border border-gray-200 dark:border-white/10"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submittingTicket}
                                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 text-xs"
                                >
                                    {submittingTicket ? 'Submitting...' : 'Open Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toastMsg && <Toast type={toastMsg.type} message={toastMsg.message} onClose={() => setToastMsg(null)} />}
        </div>
    );
}
