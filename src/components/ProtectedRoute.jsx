"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const SESSION_TIMEOUT = 3 * 60 * 60 * 1000;
const ACTIVITY_CHECK_INTERVAL = 60 * 1000;
const SUB_CHECK_INTERVAL = 5 * 60 * 1000;
const PLANS_PATH = '/dashboard/plans';
const PLAN_EXEMPT_PATHS = [PLANS_PATH, '/login', '/register'];

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(null);
    const [planStatus, setPlanStatus] = useState(null);
    const lastSubCheck = useRef(0);

    useEffect(() => {
        setMounted(true);
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(storedUser);
    }, []);

    // Session timeout
    useEffect(() => {
        if (!mounted || !user) return;

        const updateActivity = () =>
            localStorage.setItem('last_activity', Date.now().toString());

        const logout = () => {
            localStorage.removeItem('user');
            localStorage.removeItem('login_time');
            localStorage.removeItem('last_activity');
            localStorage.removeItem('sub_status');
            window.location.href = '/login?timeout=true';
        };

        const checkActivity = () => {
            const now = Date.now();
            const lastActivity = parseInt(localStorage.getItem('last_activity') || '0');
            const loginTimestamp = parseInt(localStorage.getItem('login_time') || '0');
            if (lastActivity && now - lastActivity > SESSION_TIMEOUT) { logout(); return; }
            if (loginTimestamp && now - loginTimestamp > SESSION_TIMEOUT) { logout(); }
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(e => document.addEventListener(e, updateActivity, { passive: true }));
        updateActivity();
        const interval = setInterval(checkActivity, ACTIVITY_CHECK_INTERVAL);
        return () => {
            events.forEach(e => document.removeEventListener(e, updateActivity));
            clearInterval(interval);
        };
    }, [mounted, user]);

    // Plan check
    const isExempt = PLAN_EXEMPT_PATHS.some(p => pathname.startsWith(p));

    useEffect(() => {
        if (!mounted || !user || isExempt) {
            if (mounted && (!user || isExempt)) {
                setPlanStatus('ok');
            }
            return;
        }

        const API_URL = typeof window !== 'undefined' ? window.__API_URL__ || '' : '';

        const checkSubscription = async (force = false) => {
            const now = Date.now();

            if (!force && now - lastSubCheck.current < SUB_CHECK_INTERVAL) {
                const cached = localStorage.getItem('sub_status');
                if (cached !== null) {
                    setPlanStatus(cached === 'expired' ? 'expired' : 'ok');
                    return;
                }
            }

            try {
                const res = await fetch(`${API_URL}/plans/my-subscription?user_id=${user.id}`);
                const data = await res.json();

                if (!data.success) {
                    setPlanStatus('ok');
                    return;
                }

                const status = data.subscription_status;
                lastSubCheck.current = now;
                localStorage.setItem('sub_status', status);
                setPlanStatus(status === 'expired' ? 'expired' : 'ok');
            } catch {
                setPlanStatus('ok');
            }
        };

        checkSubscription();
        const interval = setInterval(() => checkSubscription(true), SUB_CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, [mounted, user, pathname, isExempt]);

    // Authentication gate redirect
    useEffect(() => {
        if (mounted && !user) {
            sessionStorage.setItem('redirect_from', pathname);
            router.replace('/login');
        }
    }, [mounted, user, pathname, router]);

    // Plan gate redirect
    useEffect(() => {
        if (mounted && user && !isExempt && planStatus === 'expired') {
            router.replace(`${PLANS_PATH}?expired=true`);
        }
    }, [mounted, user, isExempt, planStatus, router]);

    if (!mounted || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 dark:border-gray-200 dark:border-white/10 dark:border-t-white rounded-full animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isExempt && planStatus === null) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 dark:border-gray-200 dark:border-white/10 dark:border-t-white rounded-full animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400">Checking your plan...</p>
                </div>
            </div>
        );
    }

    if (!isExempt && planStatus === 'expired') {
        return null; // Will redirect via useEffect
    }

    return children;
}
