"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { DollarSign, Link as LinkIcon, Users, CheckCircle, Clock, AlertCircle, TrendingUp, CreditCard } from 'lucide-react';
import Toast from '@/components/Toast';

export default function Affiliate() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [stats, setStats] = useState({
        affiliate_link: '',
        affiliate_code: '',
        wallet_balance: 0,
        total_earned: 0,
        min_withdrawal: 5000,
        referrals: [],
        total_referrals: 0,
    });
    const [loading, setLoading] = useState(true);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankDetails, setBankDetails] = useState('');
    const [withdrawals, setWithdrawals] = useState([]);
    const [toastMsg, setToastMsg] = useState(null);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (user?.id) {
            fetchAffiliateData();
            fetchWithdrawals();
        }
    }, [user?.id]);

    const fetchAffiliateData = async () => {
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/affiliate/stats?user_id=${user.id}`);
            const data = await response.json();
            if (data.success) {
                setStats(data);
            } else {
                setToastMsg({ type: 'error', message: data.message || 'Failed to fetch affiliate data' });
            }
        } catch (error) {
            console.error('Error fetching affiliate stats:', error);
            setToastMsg({ type: 'error', message: 'Failed to connect to server' });
        } finally {
            setLoading(false);
        }
    };

    const fetchWithdrawals = async () => {
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/affiliate/withdrawals?user_id=${user.id}`);
            const data = await response.json();
            if (data.success) {
                setWithdrawals(data.withdrawals);
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
        }
    };

    const copyToClipboard = () => {
        if (stats.affiliate_link) {
            navigator.clipboard.writeText(stats.affiliate_link);
            setToastMsg({ type: 'success', message: 'Affiliate link copied to clipboard!' });
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);

        if (isNaN(amount) || amount < stats.min_withdrawal) {
            setToastMsg({ type: 'error', message: `Minimum withdrawal amount is ₦${stats.min_withdrawal.toLocaleString()}` });
            return;
        }

        if (amount > stats.wallet_balance) {
            setToastMsg({ type: 'error', message: 'Insufficient wallet balance' });
            return;
        }

        if (!bankDetails.trim()) {
            setToastMsg({ type: 'error', message: 'Please provide your bank details' });
            return;
        }

        setWithdrawLoading(true);
        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000')}/affiliate/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    amount: amount,
                    bank_details: bankDetails,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setToastMsg({ type: 'success', message: 'Withdrawal request submitted successfully' });
                setShowWithdraw(false);
                setWithdrawAmount('');
                setBankDetails('');
                fetchAffiliateData();
                fetchWithdrawals();
            } else {
                setToastMsg({ type: 'error', message: data.message });
            }
        } catch (error) {
            setToastMsg({ type: 'error', message: 'Error submitting withdrawal request' });
        } finally {
            setWithdrawLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            
            <div className="flex-1 overflow-y-auto">
                {/* ── Header ── */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-white/5 sticky top-0 z-10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Affiliate Program</h1>
                            <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-0.5">Refer users, earn commissions, and withdraw your earnings.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-w-7xl mx-auto">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl border border-white/5 p-6 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Wallet Balance</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    ₦{stats.wallet_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl border border-white/5 p-6 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Earned</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    ₦{stats.total_earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl border border-white/5 p-6 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Referrals</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_referrals}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Affiliate Link Section */}
                    <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl border border-white/5 p-6 mb-8 lg:w-2/3 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                            Your Referral Link
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                readOnly
                                value={stats.affiliate_link || 'Generating...'}
                                className="flex-1 bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-200 text-sm rounded-xl focus:ring-0 px-4 py-3 outline-none"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white font-medium px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                            >
                                Copy Link
                            </button>
                            <button
                                onClick={() => setShowWithdraw(true)}
                                className="bg-gray-100 dark:bg-[#1a1a1a] hover:bg-[#222222] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 font-medium px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                            >
                                Withdraw Funds
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-start gap-1">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            You earn a commission when a user you refer completes their first plan purchase. The minimum withdrawal threshold is ₦{stats.min_withdrawal.toLocaleString()}.
                        </p>
                    </div>

                    {/* Two-Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Referrals List */}
                        <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-gray-50 dark:bg-[#111111]">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                                    Recent Referrals
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-white/5 text-sm">
                                {stats.referrals.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        You haven't referred anyone yet. Share your link to get started!
                                    </div>
                                ) : (
                                    stats.referrals.map((ref) => (
                                        <div key={ref.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-200 dark:bg-white/5 transition-colors">
                                            <div>
                                                <p className="font-medium text-gray-200">{ref.referred_name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{ref.referred_email}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">{new Date(ref.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    ref.status === 'converted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                    {ref.status === 'converted' ? (
                                                        <><CheckCircle className="w-3.5 h-3.5" /> Converted</>
                                                    ) : (
                                                        <><Clock className="w-3.5 h-3.5" /> Pending</>
                                                    )}
                                                </span>
                                                {ref.status === 'converted' && (
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1.5">
                                                        +₦{parseFloat(ref.earned_amount).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Withdrawals List */}
                        <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-gray-50 dark:bg-[#111111]">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                                    Withdrawal History
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-white/5 text-sm">
                                {withdrawals.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No withdrawal history yet.
                                    </div>
                                ) : (
                                    withdrawals.map((w) => (
                                        <div key={w.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-200 dark:bg-white/5 transition-colors">
                                            <div>
                                                <p className="font-bold text-gray-200">₦{parseFloat(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(w.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    w.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    w.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                    {w.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Withdraw Modal */}
                    {showWithdraw && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-white/10">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Request Withdrawal</h3>
                                
                                <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-xl p-4 mb-6 border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400">Available Balance:</span>
                                        <span className="font-bold text-emerald-400">
                                            ₦{stats.wallet_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400">Minimum Withdrawal:</span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            ₦{stats.min_withdrawal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleWithdraw} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Withdraw (₦)</label>
                                        <input
                                            type="number"
                                            required
                                            min={stats.min_withdrawal}
                                            max={stats.wallet_balance}
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-600"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Details (Bank, Account No, Name)</label>
                                        <textarea
                                            required
                                            rows="3"
                                            value={bankDetails}
                                            onChange={(e) => setBankDetails(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] border border-white/5 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-600 resize-none"
                                            placeholder="e.g. GTBank, 0123456789, John Doe"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowWithdraw(false)}
                                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 rounded-xl font-medium transition-colors border border-gray-200 dark:border-white/10"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={withdrawLoading || stats.wallet_balance < stats.min_withdrawal}
                                            className="px-4 py-2 text-gray-900 dark:text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                                        >
                                            {withdrawLoading ? 'Processing...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {toastMsg && <Toast type={toastMsg.type} message={toastMsg.message} onClose={() => setToastMsg(null)} />}
        </div>
    );
}
