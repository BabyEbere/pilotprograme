"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


import { useState, useEffect } from 'react';
import Link from 'next/link';

import {
    MdTrendingUp, MdGroup, MdOutlineAccountBalanceWallet,
    MdRocketLaunch, MdCheckCircle, MdArrowForward, MdPlayArrow
} from 'react-icons/md';


function AffiliatePublic() {
    const [minWithdrawal, setMinWithdrawal] = useState(5000);

    useEffect(() => {
        fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/affiliate/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setMinWithdrawal(data.min_withdrawal);
            })
            .catch(err => console.error("Failed to load affiliate settings", err));
    }, []);

    const steps = [
        {
            icon: MdGroup,
            title: "1. Join the Program",
            desc: "Create your free account and get your unique referral link instantly in your dashboard."
        },
        {
            icon: MdRocketLaunch,
            title: "2. Promote Pilot Programme",
            desc: "Share your link with creators, YouTubers, and automation enthusiasts on social media or your blog."
        },
        {
            icon: MdOutlineAccountBalanceWallet,
            title: "3. Earn Commissions",
            desc: `Receive ₦ rewards every time your referrals upgrade to a paid plan. Withdraw once you hit ₦${minWithdrawal.toLocaleString()}.`
        }
    ];

    const faqs = [
        {
            q: "How much can I earn?",
            a: "You earn a fixed commission for every successful referral who upgrades to a paid plan. The more creators you refer, the more you earn!"
        },
        {
            q: "When do I get paid?",
            a: `Once your balance reaches the minimum threshold of ₦${minWithdrawal.toLocaleString()}, you can request a withdrawal directly to your bank account.`
        },
        {
            q: "How do you track my referrals?",
            a: "We use secure, cookie-based tracking. When someone clicks your link and signs up, they are permanently linked to your account."
        },
        {
            q: "Is it free to join?",
            a: "Yes! There are no costs or hidden fees to become a Pilot Programme partner."
        }
    ];

    return (
        <div className="bg-white dark:bg-[#0a0a0a] min-h-screen">

            {/* ── HERO SECTION ─────────────────────────────────────────────── */}
            <section className="relative pt-24 pb-16 overflow-hidden border-b border-gray-200 dark:border-white/8">
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-full text-[10px] font-bold mb-8 tracking-widest uppercase">
                        Partnership Program
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
                        Grow with us. <br />
                        <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent">
                            Earn as a Partner.
                        </span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
                        Join the Pilot Programme Affiliate Program and earn substantial commissions
                        by helping other creators automate their YouTube faceless channels.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/register"
                            className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-base font-semibold transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 hover:scale-105"
                        >
                            <MdPlayArrow className="w-5 h-5" />
                            Join Now for Free
                        </Link>
                        <Link href="/login"
                            className="bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-base font-semibold border border-gray-300 dark:border-white/15 transition-all flex items-center justify-center"
                        >
                            Partner Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── STATS SECTION ────────────────────────────────────────────── */}
            <section className="py-12 border-b border-gray-200 dark:border-white/8 bg-white dark:bg-[#0a0a0a]">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <p className="text-4xl font-black text-red-500 mb-1">High</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Commission Rates</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-black text-red-500 mb-1">Instant</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Referral Tracking</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-black text-red-500 mb-1">₦{minWithdrawal.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Min. Withdrawal</p>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
            <section className="py-20 bg-white dark:bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Workflow</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">How it works</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 font-normal">Three simple steps to start earning today</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {steps.map((step, i) => (
                            <div key={i} className="group p-6 rounded-2xl bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 hover:border-red-500/20 transition-all duration-300">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center mb-4 group-hover:bg-red-500/25 transition-colors text-red-500">
                                    <step.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHY JOIN ─────────────────────────────────────────────────── */}
            <section className="py-20 bg-gray-50 dark:bg-[#111111] border-y border-gray-200 dark:border-white/8 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Benefits</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Partner with <br />
                            <span className="text-red-500">Pilot Programme</span>
                        </h2>
                        <div className="space-y-4">
                            {[
                                "Industry-leading AI voice and image technology",
                                "Growing market of faceless content creators",
                                "Reliable payments in Naira (Paystack)",
                                "Comprehensive affiliate dashboard",
                                "Dedicated support for top performers"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <MdCheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 font-normal leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:border-red-500/20 transition-colors">
                            <MdTrendingUp className="w-20 h-20 text-gray-900 dark:text-white/5 absolute -top-4 -right-4 transition-transform group-hover:scale-110" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Ready to earn?</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 mb-6 leading-relaxed font-normal">
                                Join our network of successful partners and help creators
                                build their automated YouTube empires while securing your
                                own passive income stream.
                            </p>
                            <Link href="/register"
                                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:gap-3"
                            >
                                Get Started <MdArrowForward className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ SECTION ──────────────────────────────────────────────── */}
            <section className="py-20 bg-white dark:bg-[#0a0a0a]">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">FAQ</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Common Questions</h2>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <details key={i} className="group bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-xl overflow-hidden cursor-pointer open:border-red-500/20 transition-all">
                                <summary className="p-5 flex items-center justify-between text-gray-900 dark:text-white text-sm font-semibold list-none group-open:bg-red-500/5 hover:bg-gray-200 dark:bg-white/5 transition-colors">
                                    {faq.q}
                                    <span className="text-gray-600 dark:text-gray-500 group-open:rotate-180 transition-transform">↓</span>
                                </summary>
                                <div className="p-5 pt-0 text-gray-600 dark:text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-normal">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}


export default function WrappedAffiliatePublic(props) {
    return (
        <>
            <Navbar />
            <AffiliatePublic {...props} />
            <Footer />
        </>
    );
}
