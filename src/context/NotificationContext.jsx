"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MdCheckCircle, MdError, MdClose, MdInfo, MdWarning } from 'react-icons/md';
import { Key, AlertTriangle, HelpCircle } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const router = useRouter();
    const [toasts, setToasts] = useState([]);
    const [modal, setModal] = useState(null); // { show, title, message, type, resolve, confirmText, cancelText }

    // Toast helper
    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Custom Alert Modal (replaces alert(msg))
    const showAlert = useCallback((title, message, type = 'info') => {
        return new Promise((resolve) => {
            setModal({
                show: true,
                title,
                message,
                type, // 'info' | 'error' | 'success' | 'warning'
                confirmText: 'Dismiss',
                resolve: () => {
                    setModal(null);
                    resolve(true);
                }
            });
        });
    }, []);

    // Custom Confirm Modal (replaces confirm(msg))
    const showConfirm = useCallback((title, message, options = {}) => {
        return new Promise((resolve) => {
            setModal({
                show: true,
                title,
                message,
                type: 'confirm',
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                resolve: (confirmed) => {
                    setModal(null);
                    resolve(confirmed);
                }
            });
        });
    }, []);

    // Custom Gemini Quota Modal
    const showQuotaModal = useCallback((message) => {
        return new Promise((resolve) => {
            setModal({
                show: true,
                title: 'Gemini API Quota Exhausted',
                message: message || "You've exceeded your Gemini API Key free tier quota. Please change or update your API Key in Settings to continue.",
                type: 'quota',
                resolve: () => {
                    setModal(null);
                    resolve(true);
                }
            });
        });
    }, []);

    // Standard Window Alert override setup
    useEffect(() => {
        const originalAlert = window.alert;
        window.alert = (message) => {
            if (!message) return;
            const msgLower = String(message).toLowerCase();
            let type = 'info';
            
            // Auto detect type
            if (
                msgLower.includes('error') || 
                msgLower.includes('failed') || 
                msgLower.includes('exception') || 
                msgLower.includes('invalid') ||
                msgLower.includes('unable') ||
                msgLower.includes('cannot')
            ) {
                type = 'error';
            } else if (
                msgLower.includes('success') || 
                msgLower.includes('done') || 
                msgLower.includes('completed') || 
                msgLower.includes('saved') || 
                msgLower.includes('copied')
            ) {
                type = 'success';
            } else if (msgLower.includes('warning') || msgLower.includes('attention')) {
                type = 'warning';
            }

            // If it's a known quota/rate limit error, show quota modal instead of toast
            const isQuotaError = msgLower.includes('quota') || 
                msgLower.includes('resource_exhausted') || 
                msgLower.includes('429') ||
                msgLower.includes('rate_limit') ||
                msgLower.includes('rate limit') ||
                msgLower.includes('billing') ||
                msgLower.includes('exceeded');

            const isHighDemandError = msgLower.includes('503') || 
                msgLower.includes('unavailable') || 
                msgLower.includes('high demand') ||
                msgLower.includes('busy');

            if (isQuotaError) {
                showQuotaModal(message);
            } else if (isHighDemandError) {
                showToast("Gemini AI is currently under high demand. Please try again in a few seconds.", 'warning', 6000);
            } else {
                showToast(message, type);
            }
        };

        return () => {
            window.alert = originalAlert;
        };
    }, [showToast, showQuotaModal]);

    return (
        <NotificationContext.Provider value={{ showToast, showAlert, showConfirm, showQuotaModal }}>
            {children}

            {/* Toasts overlay */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-md text-gray-200 animate-slideUp pointer-events-auto transition-all"
                    >
                        {t.type === 'success' && <MdCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                        {t.type === 'error' && <MdError className="w-5 h-5 text-rose-500 shrink-0" />}
                        {t.type === 'warning' && <MdWarning className="w-5 h-5 text-amber-500 shrink-0" />}
                        {t.type === 'info' && <MdInfo className="w-5 h-5 text-sky-400 shrink-0" />}
                        
                        <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
                        
                        <button
                            onClick={() => removeToast(t.id)}
                            className="text-gray-400 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/5 shrink-0"
                        >
                            <MdClose className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal Dialog overlay */}
            {modal && modal.show && (
                <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#111111] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-white/10 animate-scaleIn">
                        {modal.type === 'quota' ? (
                            <>
                                {/* Top Banner for Quota */}
                                <div className="bg-gradient-to-r from-red-500/20 to-amber-500/20 p-6 text-center border-b border-white/10">
                                    <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/30">
                                        <Key className="w-7 h-7 text-red-400" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Gemini API Quota Exhausted</h2>
                                    <p className="text-xs text-gray-400 mt-1">Exceeded free tier requests or rate limits</p>
                                </div>

                                {/* Body for Quota */}
                                <div className="p-6 space-y-4">
                                    <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10 text-xs text-gray-300 leading-relaxed text-center font-mono break-all max-h-40 overflow-y-auto">
                                        {modal.message}
                                    </div>
                                    <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 text-xs text-blue-300 leading-relaxed">
                                        Google's free-tier Gemini API keys are limited to 15 requests per minute and 1,500 requests per day. To resume script generation and visual creation, you can generate a new free key at Google AI Studio and configure it in your Settings.
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => modal.resolve(false)}
                                            className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 transition-all hover:text-white"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            onClick={() => {
                                                modal.resolve(true);
                                                router.push('/dashboard/settings');
                                            }}
                                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <Key className="w-4 h-4" />
                                            Go to Settings
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : modal.type === 'confirm' ? (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-400 shrink-0">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{modal.title}</h3>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed mb-6 whitespace-pre-line">{modal.message}</p>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => modal.resolve(false)}
                                        className="px-4 py-2 border border-white/10 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 transition-all hover:text-white"
                                    >
                                        {modal.cancelText}
                                    </button>
                                    <button
                                        onClick={() => modal.resolve(true)}
                                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
                                    >
                                        {modal.confirmText}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        modal.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                                        modal.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                        'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                                    }`}>
                                        {modal.type === 'error' ? <MdError className="w-5 h-5" /> :
                                         modal.type === 'success' ? <MdCheckCircle className="w-5 h-5" /> :
                                         <HelpCircle className="w-5 h-5" />}
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{modal.title}</h3>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed mb-6">{modal.message}</p>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => modal.resolve(true)}
                                        className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all"
                                    >
                                        {modal.confirmText}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};
