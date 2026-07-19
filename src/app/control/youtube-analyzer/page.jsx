"use client";

import React, { useState, useEffect } from 'react';
import { 
    Youtube, ShieldAlert, Award, Compass, RefreshCw, ChevronRight, BarChart3, Mail, HeartPulse, Sparkles
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Loader from '@/components/Loader';

export default function AdminYouTubeAnalyzer() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [diagnostics, setDiagnostics] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    const fetchDiagnostics = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/admin/youtube-analyzer/diagnostics`);
            const data = await res.json();
            if (data.success) {
                setDiagnostics(data.diagnostics || []);
            } else {
                setError(data.message || 'Failed to fetch diagnostics.');
            }
        } catch {
            setError('Could not establish connection to the administration API.');
        } finally {
            setLoading(false);
        }
    };

    const handleRebuildDiagnostics = async () => {
        if (!confirm('Rebuilding audits will run batch AI queries for all linked channels. This may take up to a minute. Continue?')) return;
        
        setActionLoading(true);
        setSuccessMessage('');
        setError('');
        try {
            const res = await fetch(`${API_URL}/admin/youtube-analyzer/diagnostics/rebuild`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage(data.message);
                fetchDiagnostics();
            } else {
                setError(data.message || 'Rebuild failed.');
            }
        } catch {
            setError('Connection timed out during batch recompilation.');
        } finally {
            setActionLoading(false);
        }
    };

    const [activeReport, setActiveReport] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        fetchDiagnostics();
    }, []);

    const urgentRevivals = diagnostics.filter(d => d.status === 'Urgent Revival Needed');
    const optimizationNeeded = diagnostics.filter(d => d.status === 'Needs Optimization');
    const healthyChannels = diagnostics.filter(d => d.status === 'Healthy');

    const handleInspectReport = (reportText) => {
        setActiveReport(reportText || 'No detailed audit report generated yet.');
        setShowReportModal(true);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/5 sticky top-0 z-10 transition-colors">
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
                                Creator Diagnostics &amp; Channel Revival Model
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Diagnose channel health scores, target niches, and train revival models</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchDiagnostics}
                                className="p-2 rounded-lg text-gray-505 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-gray-200 dark:border-white/5 bg-white dark:bg-[#18181c]"
                                title="Refresh data"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleRebuildDiagnostics}
                                disabled={actionLoading}
                                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm uppercase tracking-wider cursor-pointer disabled:opacity-50"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Batch Rebuild Audits
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-w-7xl mx-auto">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/25 text-red-500 rounded-2xl text-xs font-bold flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
                            <Sparkles className="w-4 h-4 flex-shrink-0" /> {successMessage}
                        </div>
                    )}

                    {loading ? (
                        <div className="h-[50vh] flex items-center justify-center">
                            <Loader message="Loading diagnostic models..." />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary stat rows */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 p-5 shadow-sm text-center">
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{diagnostics.length}</p>
                                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Total Linked Channels</p>
                                </div>
                                <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 shadow-sm text-center">
                                    <p className="text-3xl font-black text-red-500">{urgentRevivals.length}</p>
                                    <p className="text-[10px] font-black text-red-500/70 uppercase tracking-widest mt-1">Urgent Revival Needed</p>
                                </div>
                                <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 shadow-sm text-center">
                                    <p className="text-3xl font-black text-amber-500">{optimizationNeeded.length}</p>
                                    <p className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mt-1">Needs Optimization</p>
                                </div>
                                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5 shadow-sm text-center">
                                    <p className="text-3xl font-black text-emerald-400">{healthyChannels.length}</p>
                                    <p className="text-[10px] font-black text-emerald-400/70 uppercase tracking-widest mt-1">Healthy &amp; Growing</p>
                                </div>
                            </div>

                            {/* Detailed Diagnostics Lists */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Creator Diagnostics Index</h3>
                                
                                {diagnostics.length > 0 ? (
                                    <div className="space-y-4">
                                        {diagnostics.map((diag) => {
                                            const statusColor = diag.status === 'Urgent Revival Needed' 
                                                ? 'bg-red-500/10 border-red-500/25 text-red-500' 
                                                : diag.status === 'Needs Optimization' 
                                                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-500' 
                                                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
                                            return (
                                                <div 
                                                    key={diag.user_id} 
                                                    className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm p-6 space-y-4"
                                                >
                                                    {/* Row Top */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-white/5 pb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 font-black">
                                                                YT
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{diag.channel_title}</h4>
                                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                                    Owner: <span className="text-gray-700 dark:text-gray-300 font-semibold">{diag.user_name}</span> ({diag.user_email})
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Badges */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleInspectReport(diag.raw_report)}
                                                                className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white dark:bg-white/5 hover:bg-gray-150 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 transition-all cursor-pointer"
                                                            >
                                                                Inspect Raw AI Audit
                                                            </button>
                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColor}`}>
                                                                {diag.status}
                                                            </span>
                                                            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-100 dark:bg-white/5 border border-transparent text-gray-600 dark:text-gray-400">
                                                                Health: {diag.health_score}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Row Body Details */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                                                        <div className="space-y-1">
                                                            <h5 className="font-bold text-gray-650 dark:text-gray-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                                                                <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                                                                Revival Plan Action
                                                            </h5>
                                                            <p className="text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-[#16161a] p-3.5 rounded-xl border border-gray-100 dark:border-white/5">
                                                                {diag.revival_plan || 'No immediate revival plan mapped.'}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h5 className="font-bold text-gray-650 dark:text-gray-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                                                                <Award className="w-3.5 h-3.5 text-purple-400" />
                                                                AI Competitor Knockout Titles
                                                            </h5>
                                                            <div className="text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-[#16161a] p-3.5 rounded-xl border border-gray-100 dark:border-white/5 whitespace-pre-line font-mono font-bold">
                                                                {diag.recommended_titles || 'No optimized titles generated.'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 p-12 text-center max-w-md mx-auto space-y-4">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                                            <Youtube className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">No Diagnostics Run Yet</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Click "Batch Rebuild Audits" above to invoke the AI model and initialize diagnostic datasets for creators.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Inspector Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
                    <div className="relative bg-white dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto z-10 space-y-6 shadow-2xl animate-in fade-in duration-200 text-gray-900 dark:text-white">
                        <button 
                            onClick={() => setShowReportModal(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl transition-all"
                        >
                            <span className="text-xs font-bold font-mono">ESC</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                                <Compass className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider">Detailed Strategic AI Audit</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Admin-only raw Gemini markdown dataset details</p>
                            </div>
                        </div>
                        <div className="border border-gray-150 dark:border-white/5 bg-gray-50 dark:bg-[#16161a] rounded-2xl p-6 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
                            {activeReport}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="bg-red-650 hover:bg-red-750 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {actionLoading && <Loader message="Compiling diagnostics dataset..." fullScreen={true} />}
        </div>
    );
}
