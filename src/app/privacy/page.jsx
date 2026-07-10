"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


import React from 'react';

function Privacy() {
    return (
        <div className="bg-white dark:bg-[#0a0a0a] min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Legal</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">Privacy Policy</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 font-normal leading-relaxed">
                        Last Updated: April 1, 2026. <br />
                        Your privacy, trust, and the security of your data are our highest priorities.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Gemini Keys Section */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">1. Gemini API Keys & Security</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            Pilot Programme allows users to integrate their personal Gemini API keys to power content generation. 
                            We take the security of these keys seriously:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 ml-2">
                            <li>Your keys are encrypted and stored securely within our infrastructure.</li>
                            <li>Your keys are used exclusively for your requests and never shared with third parties.</li>
                            <li>We do not sell, rent, or trade your API keys or data to any external entity.</li>
                        </ul>
                    </section>

                    {/* Analytics Section */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">2. Analytics & Performance Tracking</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            We utilize industry-standard analytics tools to monitor the performance of our platform. 
                            This data helps us:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 ml-2">
                            <li>Identify and fix technical issues or bottlenecks.</li>
                            <li>Understand how users interact with our features to improve the user experience.</li>
                            <li>Ensure platform stability and high-speed delivery of services.</li>
                        </ul>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-4 italic">
                            *Analytics data is used for performance tracking and is not sold to marketers.
                        </p>
                    </section>

                    {/* General Data Protection */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">3. Data Usage</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                            We only collect essential information required to provide you with our services, 
                            such as your account identifier and subscription status. We do not track personal 
                            browsing history or collect non-essential personal information.
                        </p>
                    </section>

                    <div className="text-center pt-8 border-t border-gray-200 dark:border-white/8">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Have questions about your privacy? Contact us at <span className="text-red-500">support@pilotprogramme.com</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function WrappedPrivacy(props) {
    return (
        <>
            <Navbar />
            <Privacy {...props} />
            <Footer />
        </>
    );
}
