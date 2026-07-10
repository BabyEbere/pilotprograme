"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


import React from 'react';

function Cookies() {
    return (
        <div className="bg-white dark:bg-[#0a0a0a] min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Legal</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">Cookie Policy</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 font-normal leading-relaxed">
                        Last Updated: April 1, 2026. <br />
                        We use cookies to enhance your experience and track site performance.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Analytics Section */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">1. Performance & Analytics Cookies</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            We use performance analytics cookies to understand how users interact with our platform. 
                            This helps us:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 ml-2 font-normal">
                            <li>Identify site performance bottlenecks and slow-loading sections.</li>
                            <li>Track site traffic to ensure server resources are allocated efficiently.</li>
                            <li>Understand feature usage to improve future updates.</li>
                        </ul>
                    </section>

                    {/* Functional Section */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">2. Essential & Functional Cookies</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                            These cookies are essential for our platform to function. 
                            They allow us to keep you logged in to your account, 
                            secure your Gemini API keys during sessions, and manage your subscription preferences. 
                            If you disable these cookies, our platform will not function.
                        </p>
                    </section>

                    <div className="text-center pt-8 border-t border-gray-200 dark:border-white/8">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Have questions about our cookie usage? Contact us at <span className="text-red-500">support@pilotprogramme.com</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function WrappedCookies(props) {
    return (
        <>
            <Navbar />
            <Cookies {...props} />
            <Footer />
        </>
    );
}
