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

                    {/* Prohibited Activities */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">2. Prohibited Activities</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                            You may not use our services to generate illegal content, distribute spam, or 
                            attempt to circumvent platform security or API limits. Failure to comply will 
                            result in immediate suspension of service without refund.
                        </p>
                    </section>

                    {/* Termination & Modification */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">3. Termination of Use</h2>
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
