"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


import React from 'react';

function Refund() {
    return (
        <div className="bg-white dark:bg-[#0a0a0a] min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Legal</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">Refund Policy</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 font-normal leading-relaxed">
                        Last Updated: April 1, 2026. <br />
                        Our policy on refunds and payment adjustments.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* General Section */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">1. General Refund Policy</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                            Due to the digital nature of our products and services, 
                            <span className="text-gray-900 dark:text-white font-semibold"> we do not offer refunds after a purchase is made.</span> 
                            Pilot Programme provides immediate access to digital resources and AI-powered tools 
                            upon confirmation of payment.
                        </p>
                    </section>

                    {/* Double Payment Exception */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">2. Exceptions: Double Payments</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal mb-4">
                            We recognize that technical errors may occasionally occur. 
                            The ONLY exception to our no-refund policy is in the case of a 
                            <span className="text-gray-900 dark:text-white font-semibold"> double payment made on a single account.</span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                            If you have accidentally paid twice for the same subscription plan on one account, 
                            please contact our support team with proof of both transactions. 
                            We will investigate the claim and process a refund for the duplicate transaction.
                        </p>
                    </section>

                    {/* Support Details */}
                    <section className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">3. Requesting a Refund</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                            For all refund requests related to double payments, please email 
                            <span className="text-red-500 font-medium ml-1">support@pilotprogramme.com</span> 
                            with the subject line "Double Payment Refund Request" and include your account details 
                            and transaction IDs.
                        </p>
                    </section>

                    <div className="text-center pt-8 border-t border-gray-200 dark:border-white/8">
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            *This policy applies to all current Pilot Programme subscription plans.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function WrappedRefund(props) {
    return (
        <>
            <Navbar />
            <Refund {...props} />
            <Footer />
        </>
    );
}
