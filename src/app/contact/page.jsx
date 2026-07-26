"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicSEO from '@/components/DynamicSEO';

import { 
    Mail, 
    MessageSquare, 
    Send, 
    CheckCircle2, 
    AlertCircle, 
    PhoneCall, 
    Sparkles, 
    Clock, 
    ShieldCheck,
    Loader2,
    ExternalLink
} from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const API_URL = (typeof window !== 'undefined' 
        ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
            ? 'http://localhost:5000/api' 
            : 'https://s1.pilotprograme.com/api') 
        : 'http://localhost:5000/api');

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const res = await fetch(`${API_URL}/support/contact-us`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMsg(data.message || "Thank you! We've received your message and sent a confirmation email.");
                setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
            } else {
                setErrorMsg(data.message || "Failed to submit message. Please try again.");
            }
        } catch (err) {
            console.error("Contact Form Error:", err);
            setErrorMsg("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DynamicSEO 
                pageSlug="contact" 
                fallbackTitle="Contact Us — Pilot Programme Support & Inquiries"
                fallbackDescription="Get in touch with the Pilot Programme team. Submit inquiries, partner requests, or technical support messages."
            />
            
            <Navbar />

            <div className="bg-white dark:bg-[#0a0a0c] text-gray-900 dark:text-white transition-colors duration-300 min-h-screen">
                
                {/* Hero Header Section */}
                <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 overflow-hidden border-b border-gray-100 dark:border-white/5">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/5 dark:bg-red-600/10 rounded-full blur-3xl" />
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Creator Helpdesk & Support</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                            Get in Touch with Our Team
                        </h1>

                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Have a question about Pilot Programme? Want to make an inquiry or suggest a feature? Drop us a message below or reach out directly on WhatsApp or Email.
                        </p>
                    </div>
                </section>

                {/* Main Contact Section */}
                <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        
                        {/* Direct Contact Cards (Left 5 Cols) */}
                        <div className="lg:col-span-5 space-y-4">
                            
                            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                                Direct Contact Channels
                            </div>

                            {/* Email Card */}
                            <a 
                                href="mailto:auto@pilotprograme.com"
                                className="group p-5 rounded-2xl bg-gray-50 dark:bg-[#111116] border border-gray-200/80 dark:border-white/10 flex items-start gap-4 hover:border-red-500/40 transition-all shadow-sm hover:shadow-md block"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Us</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 group-hover:text-red-500 transition-colors truncate">
                                        auto@pilotprograme.com
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Official inquiries, general questions & support.
                                    </p>
                                </div>
                            </a>

                            {/* WhatsApp Card */}
                            <a 
                                href="https://wa.me/2349054530338" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group p-5 rounded-2xl bg-gray-50 dark:bg-[#111116] border border-gray-200/80 dark:border-white/10 flex items-start gap-4 hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-md block"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <PhoneCall className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">WhatsApp Line</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 group-hover:text-emerald-500 transition-colors">
                                        +234 905 453 0338
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Instant messaging & fast creator chat.
                                    </p>
                                </div>
                            </a>

                            {/* Facebook Page Card */}
                            <a 
                                href="https://facebook.com/PilotPrograme" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group p-5 rounded-2xl bg-gray-50 dark:bg-[#111116] border border-gray-200/80 dark:border-white/10 flex items-start gap-4 hover:border-blue-500/40 transition-all shadow-sm hover:shadow-md block"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Facebook Page</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 group-hover:text-blue-500 transition-colors">
                                        @PilotPrograme
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Connect with our official Facebook community page.
                                    </p>
                                </div>
                            </a>

                            {/* Support SLA Guarantee Box */}
                            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/5 via-purple-500/5 to-red-500/5 border border-red-500/20 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                                    <Clock className="w-4 h-4 text-red-500" />
                                    <span>Fast Response Time Guaranteed</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Inquiries sent via our in-page form automatically trigger a confirmation email with a reference ID. Our team typically responds within 1-6 hours.
                                </p>
                            </div>
                        </div>

                        {/* In-Page Form Submission (Right 7 Cols) */}
                        <div className="lg:col-span-7">
                            <div className="bg-white dark:bg-[#111116] border border-gray-200/80 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/5 space-y-6">
                                
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Send Us an In-Page Message
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Fill in the form below. Once submitted, you'll receive an automated confirmation email right away.
                                    </p>
                                </div>

                                {/* Banners */}
                                {successMsg && (
                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-start gap-3 animate-in fade-in duration-300">
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm">Message Sent Successfully!</p>
                                            <p>{successMsg}</p>
                                        </div>
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-3 animate-in fade-in duration-300">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Your Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="e.g. Alex Johnson"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Your Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="alex@example.com"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Reason for Contact */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Reason for Contacting Us <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                                        >
                                            <option value="General Inquiry">General Inquiry & Platform Info</option>
                                            <option value="Sales & Billing Inquiries">Sales, Subscription & Billing</option>
                                            <option value="Business & Partnership">Business & Partnership Opportunity</option>
                                            <option value="Technical Support">Technical Support / Help</option>
                                            <option value="Feature Request">Feature Request / Suggestion</option>
                                            <option value="Bug Report">Bug Report</option>
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Your Message / Inquiries <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            placeholder="Write your message here..."
                                            className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors resize-y"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                <span>Sending Message...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                <span>Send In-Page Message</span>
                                            </>
                                        )}
                                    </button>

                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Your details are safe. Automated email receipt sent upon submission.</span>
                                    </p>
                                </form>
                            </div>
                        </div>

                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
