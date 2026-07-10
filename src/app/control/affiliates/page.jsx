"use client";

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { CreditCard, CheckCircle, XCircle, Search, AlertCircle, RefreshCw, RefreshCcw, HandCoins, ChevronDown, ChevronUp, ShieldAlert, Award, TrendingUp, Save } from 'lucide-react';
import Toast from '@/components/Toast';

export default function AdminAffiliates() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [toastMsg, setToastMsg] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [minWithdrawal, setMinWithdrawal] = useState(0);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/admin/withdrawals`);
            const json = await response.json();
            if (json.success) {
                setWithdrawals(json.withdrawals);
                if (json.min_withdrawal !== undefined) setMinWithdrawal(json.min_withdrawal);
            } else {
                setToastMsg({ type: 'error', message: json.message || 'Failed to fetch withdrawals.' });
            }
        } catch (error) {
            console.error('Error fetching admin withdrawals:', error);
            setToastMsg({ type: 'error', message: 'Failed to connect to server' });
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (id, action) => {
        if (!window.confirm(`Are you sure you want to mark this withdrawal as ${action.toUpperCase()}?`)) {
            return;
        }

        setProcessingId(id);
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/admin/withdrawals/${id}/${action}`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                setToastMsg({ type: 'success', message: data.message });
                // Update local state without refreshing full list
                setWithdrawals(withdrawals.map(w => 
                    w.id === id ? { ...w, status: action } : w
                ));
            } else {
                setToastMsg({ type: 'error', message: data.message });
            }
        } catch (error) {
            setToastMsg({ type: 'error', message: `Error marking as ${action}` });
        } finally {
            setProcessingId(null);
        }
    };

    const saveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/admin/affiliate/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ min_withdrawal: minWithdrawal })
            });
            const json = await res.json();
            if (json.success) setToastMsg({ type: 'success', message: 'Payout minimum updated perfectly.' });
            else setToastMsg({ type: 'error', message: json.message });
        } catch {
            setToastMsg({ type: 'error', message: 'Network error saving settings.' });
        } finally {
            setSavingSettings(false);
        }
    };

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const filteredWithdrawals = withdrawals.filter(w => 
        w.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
    const paidAmount = withdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + parseFloat(w.amount), 0);

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* ── Header ── */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-white/5 sticky top-0 z-10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <HandCoins className="w-5 h-5 text-indigo-500" />
                                Affiliate Earnings <span className="px-2 py-0.5 rounded pl-1 bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-500 dark:text-gray-400 text-[10px] font-bold tracking-widest">{withdrawals.length}</span>
                            </h1>
                            <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-0.5">Manage user affiliate withdrawal requests and history.</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                            <button
                                onClick={fetchWithdrawals}
                                className="p-2 text-gray-600 dark:text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-200/50 dark:bg-white/10 transition-colors shadow-sm"
                                title="Refresh list"
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search user, email, status..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder-gray-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Quick Stats & Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl shadow-sm border border-white/5 p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pending Requests</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{pendingCount}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl shadow-sm border border-white/5 p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Payouts</p>
                            <p className="text-3xl font-bold text-emerald-400 mt-1">
                                ₦{paidAmount.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <CreditCard className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Affiliate Configuration UI */}
                <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-indigo-500/20 p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <HandCoins className="w-16 h-16 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                            <Award className="w-4 h-4" /> Affiliate Configuration
                        </p>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-500 dark:text-gray-400 mb-1">GLOBAL MINIMUM PAYOUT (₦)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={minWithdrawal}
                                onChange={(e) => setMinWithdrawal(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-gray-600 text-sm font-bold"
                            />
                            <button
                                onClick={saveSettings}
                                disabled={savingSettings}
                                className="bg-indigo-600 hover:bg-indigo-700 text-gray-900 dark:text-white p-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                                title="Save Configuration"
                            >
                                {savingSettings ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">Set how much a user must earn before they can place a withdrawal.</p>
                    </div>
                </div>
            </div>

                    {/* Withdrawals Table Component */}
                    <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl border border-white/5 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-gray-50 dark:bg-[#111111] flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                Withdrawal Requests
                            </h3>
                        </div>
                        
                        {loading ? (
                            <div className="p-8 flex justify-center text-indigo-500">
                                <RefreshCw className="w-8 h-8 animate-spin" />
                            </div>
                        ) : filteredWithdrawals.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No withdrawal requests match your search.' : 'No withdrawal requests found.'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
                                    <thead className="bg-gray-50 dark:bg-[#111111]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">User</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Bank Details</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-50 dark:bg-[#111111] divide-y divide-gray-200 dark:divide-white/5">
                                        {filteredWithdrawals.map((w) => (
                                            <React.Fragment key={w.id}>
                                                <tr className="hover:bg-gray-200 dark:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleRow(w.id)}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-200">{w.user_name}</div>
                                                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{w.user_email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                            w.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                            w.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                        }`}>
                                                            {w.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-emerald-400">₦{parseFloat(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                                                        <div className="text-[11px] text-gray-600 dark:text-gray-500 dark:text-gray-400 truncate" title={w.bank_details}>{w.bank_details}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[11px] text-gray-500 dark:text-gray-400">
                                                        {new Date(w.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-3">
                                                            {w.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleProcess(w.id, 'paid'); }}
                                                                        disabled={processingId === w.id}
                                                                        className="text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg disabled:opacity-50 transition-colors"
                                                                        title="Mark as Paid"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleProcess(w.id, 'rejected'); }}
                                                                        disabled={processingId === w.id}
                                                                        className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded-lg disabled:opacity-50 transition-colors"
                                                                        title="Reject Request"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors ml-2">
                                                                {expandedRow === w.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedRow === w.id && (
                                                    <tr className="bg-[#161616]">
                                                        <td colSpan="6" className="px-6 py-5 border-t border-white/5">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                                                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Anti-Fraud & User Verification Data</h4>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                <div className="bg-gray-50 dark:bg-[#111111] p-3 rounded-xl border border-white/5">
                                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Award className="w-3 h-3"/> Active Plan</div>
                                                                    <div className="text-sm font-semibold text-gray-200">
                                                                        {w.plan_name ? <span className="text-purple-400">{w.plan_name}</span> : <span className="text-gray-500 dark:text-gray-400">Free / None</span>}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-gray-50 dark:bg-[#111111] p-3 rounded-xl border border-white/5">
                                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Referrals</div>
                                                                    <div className="text-sm font-semibold text-gray-200">{w.total_referrals || 0} users</div>
                                                                </div>
                                                                <div className="bg-gray-50 dark:bg-[#111111] p-3 rounded-xl border border-white/5">
                                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Converted Referrals</div>
                                                                    <div className="text-sm font-semibold text-emerald-400">{w.converted_referrals || 0} valid purchases</div>
                                                                </div>
                                                                <div className="bg-gray-50 dark:bg-[#111111] p-3 rounded-xl border border-white/5">
                                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><TrendingUp className="w-3 h-3"/> Total Past Payouts</div>
                                                                    <div className="text-sm font-semibold text-gray-200">
                                                                        ₦{parseFloat(w.total_amount_paid || 0).toLocaleString()} <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">({w.total_withdrawal_requests || 0} reqs)</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-500 mt-4 text-center">Note: Mark as "Paid" only AFTER you have manually transferred the funds to the user's provided bank details.</p>
                </div>
            </div>
            {toastMsg && <Toast type={toastMsg.type} message={toastMsg.message} onClose={() => setToastMsg(null)} />}
        </div>
    );
}
