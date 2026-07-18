"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


import React from 'react';

function Terms() {
    return (
        <div className="bg-white dark:bg-[#0a0a0a] min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Legal</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">Terms of Service</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 font-normal leading-relaxed">
                        Last Updated: April 1, 2026. <br />
                        Welcome to Pilot Programme. By using our services, you agree to the following terms.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Gemini Keys Section */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">1. Use of Gemini API Keys</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            You acknowledge that Pilot Programme requires the use of personal Gemini API keys for certain content generation features. 
                            By providing your key:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 ml-2 font-normal">
                            <li>You represent and warrant that the key is yours or you have the legal right to use it.</li>
                            <li>You agree that the key's usage is subject to the Gemini API providers' terms of service.</li>
                            <li>You understand that Pilot Programme is a tool for managing and utilizing your keys, and NOT an API key vendor.</li>
                            <li>You agree to follow all Gemini API acceptable use policies.</li>
                        </ul>
                    </section>

                    {/* YouTube Integrations & Operations */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">2. YouTube Channel Integrations & Publishing Rights</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            To enable real-time channel diagnostics, Suggested Tags, Outliers Benchmarking, and direct upload capabilities, you must authenticate and link your YouTube channel via Google OAuth.
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 space-y-2 ml-2 font-normal">
                            <li><strong>Authorized Actions:</strong> By connecting your channel, you explicitly authorize Pilot Programme to read your upload stats, suggest optimizations, and edit, delete, or publish videos on your behalf.</li>
                            <li><strong>User Control & Intent:</strong> All modifications, updates, uploads, and deletions are executed strictly under your manual control and only when explicitly triggered by you. Pilot Programme will never perform unsolicited edits, deletes, or uploads.</li>
                            <li><strong>Compliance & Guidelines:</strong> You agree that all video files and metadata (titles, descriptions, tags) processed or published via Pilot Programme must comply with YouTube's Terms of Service and Community Guidelines. We prohibit the distribution of illegal, abusive, copyrighted, or policy-violating materials.</li>
                            <li><strong>Responsibility:</strong> You remain solely responsible and legally liable for any and all contents uploaded, modified, or deleted on your connected channels.</li>
                        </ul>
                    </section>

                    {/* Security & Google 2FA */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">3. Account Security & Two-Factor Authentication (2FA)</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                            You are responsible for maintaining the confidentiality of your account credentials. We provide Google 2FA (Authenticator) and secure Email OTP layers to defend your account from unauthorized access. You agree to notify us immediately of any security breaches or unauthorized use of your Google integrations.
                        </p>
                    </section>

                    {/* Prohibited Activities */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">4. Prohibited Activities</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                            You may not use our services to generate illegal content, distribute spam, or 
                            attempt to circumvent platform security or API limits. Failure to comply will 
                            result in immediate suspension of service without refund.
                        </p>
                    </section>

                    {/* Termination & Modification */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">5. Termination of Use</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                            We reserve the right to suspend or terminate access to our services if you violate these terms. 
                            We also reserve the right to update these terms as our platform evolves.
                        </p>
                    </section>

                    <div className="text-center pt-8 border-t border-gray-200 dark:border-white/8">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Have questions about our terms? Contact us at <span className="text-red-500">support@pilotprogramme.com</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function WrappedTerms(props) {
    return (
        <>
            <Navbar />
            <Terms {...props} />
            <Footer />
        </>
    );
}
