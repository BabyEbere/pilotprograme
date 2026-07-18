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

                    {/* Google OAuth & Account Registration */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">2. Google OAuth & Account Registration</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            We support quick, secure registration and sign-in via Google OAuth. When you authenticate using Google:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 ml-2">
                            <li>We only request public profile details (name, email address, profile picture URL) to establish your account identity.</li>
                            <li>We store your email securely to enable system notifications and subscriptions.</li>
                            <li>Your authentication credentials are verified directly by Google; we never view or store your Google passwords.</li>
                        </ul>
                    </section>

                    {/* YouTube API Services Integration */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">3. YouTube API Services & Channel Management</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            Pilot Programme utilizes YouTube API Services to pull feed diagnostics and empower users to grow their channels. By connecting your YouTube account:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 ml-2 mb-4">
                            <li><strong>Read & Analysis Scope:</strong> We retrieve video views, metadata (titles, descriptions, tags), and publishing dates from your recent uploads to diagnose optimization scores and compute niche averages.</li>
                            <li><strong>Competitor Analysis:</strong> We parse titles to query matching trending videos and help identify outliers with view spikes.</li>
                            <li><strong>Edit, Delete & Publish Operations:</strong> With your explicit consent, Pilot Programme can edit tags, description layouts, titles, or delete and publish videos directly to your channel. <strong>Important:</strong> These operations are executed in a strictly law-abiding manner, strictly under your console control. We never perform independent modifications or post content without your direct request.</li>
                        </ul>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                            *Our use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements.
                        </p>
                    </section>

                    {/* Security & Two-Factor Authentication (2FA) */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">4. Two-Factor Authentication (2FA)</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                            To ensure high-grade security, Pilot Programme supports Two-Factor Authentication (2FA) via Google Authenticator (TOTP) and secure Email OTPs. We encrypt TOTP seed parameters in our database and require verification validations for secure login operations, shielding your integrations against unauthorized access.
                        </p>
                    </section>

                    {/* Analytics Section */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">5. Analytics & Performance Tracking</h2>
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
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">6. Data Retention & Control</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                            We retain account metadata only as long as necessary to provide service functionality. You can unlink your YouTube channel or delete your personal API keys at any time from your settings panel, which triggers the immediate deletion of cached access tokens from our server memory.
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
