"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const REMEMBER_ME_TIMEOUT = 3 * 24 * 60 * 60 * 1000; // 3 Days (72 Hours) in milliseconds
const DEFAULT_SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(null);
    const [loginTime, setLoginTime] = useState(null);

    useEffect(() => {
        setMounted(true);
        setUser(JSON.parse(localStorage.getItem('user') || 'null'));
        setLoginTime(localStorage.getItem('login_time'));
    }, []);

    // Session activity checks
    useEffect(() => {
        if (!mounted || !user) return;

        let lastActivity = Date.now();
        let activityCheckInterval;

        const isRemembered = localStorage.getItem('remember_me') === 'true';
        const sessionTimeout = isRemembered ? REMEMBER_ME_TIMEOUT : DEFAULT_SESSION_TIMEOUT;

        const updateActivity = () => {
            lastActivity = Date.now();
            localStorage.setItem('last_activity', lastActivity.toString());
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, updateActivity);
        });

        const checkActivity = () => {
            const now = Date.now();
            const storedActivity = parseInt(localStorage.getItem('last_activity') || lastActivity.toString());
            const timeSinceActivity = now - storedActivity;

            if (timeSinceActivity > sessionTimeout) {
                localStorage.removeItem('user');
                localStorage.removeItem('login_time');
                localStorage.removeItem('last_activity');
                localStorage.removeItem('remember_me');
                window.location.href = '/login?timeout=true';
            }

            if (loginTime) {
                const loginTimestamp = parseInt(loginTime);
                const sessionDuration = now - loginTimestamp;

                if (sessionDuration > sessionTimeout) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('login_time');
                    localStorage.removeItem('last_activity');
                    localStorage.removeItem('remember_me');
                    window.location.href = '/login?timeout=true';
                }
            }
        };

        updateActivity();
        activityCheckInterval = setInterval(checkActivity, ACTIVITY_CHECK_INTERVAL);

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, updateActivity);
            });
            clearInterval(activityCheckInterval);
        };
    }, [mounted, user, loginTime]);

    // Redirections inside useEffect to prevent hydration issues
    useEffect(() => {
        if (mounted && !user) {
            router.replace('/login');
        }
    }, [mounted, user, router]);

    if (!mounted || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 dark:border-white/10 dark:border-t-red-500 rounded-full animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return children;
}
