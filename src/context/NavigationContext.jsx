"use client";

import React, { createContext, useContext, useState, useEffect, Suspense, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Loader from '@/components/Loader';

const NavigationContext = createContext({
    isNavigating: false,
    navigatingPath: null,
    targetLabel: '',
    startNavigation: (path, label) => {},
});

function SearchParamsTracker({ onSearchParamsChange }) {
    const searchParams = useSearchParams();
    useEffect(() => {
        if (onSearchParamsChange) {
            onSearchParamsChange(searchParams);
        }
    }, [searchParams, onSearchParamsChange]);
    return null;
}

export function NavigationProvider({ children }) {
    const pathname = usePathname();
    const [searchParams, setSearchParams] = useState(null);

    const [isNavigating, setIsNavigating] = useState(false);
    const [navigatingPath, setNavigatingPath] = useState(null);
    const [targetLabel, setTargetLabel] = useState('');
    const [showUniversalLoader, setShowUniversalLoader] = useState(false);

    const handleSearchParamsChange = useCallback((params) => {
        setSearchParams(params);
    }, []);

    // Reset loader on route change
    useEffect(() => {
        setIsNavigating(false);
        setNavigatingPath(null);
        setTargetLabel('');
        setShowUniversalLoader(false);
    }, [pathname, searchParams]);

    const startNavigation = (path, label = '') => {
        if (!path || path === pathname) return;
        setIsNavigating(true);
        setNavigatingPath(path);
        setTargetLabel(label);
    };

    // Trigger full-screen universal loader if navigation takes > 250ms
    useEffect(() => {
        let timer;
        if (isNavigating) {
            timer = setTimeout(() => {
                setShowUniversalLoader(true);
            }, 250);
        } else {
            setShowUniversalLoader(false);
        }
        return () => clearTimeout(timer);
    }, [isNavigating]);

    return (
        <NavigationContext.Provider
            value={{
                isNavigating,
                navigatingPath,
                targetLabel,
                startNavigation,
            }}
        >
            <Suspense fallback={null}>
                <SearchParamsTracker onSearchParamsChange={handleSearchParamsChange} />
            </Suspense>

            {/* Top Red Ambient Progress Bar */}
            {isNavigating && (
                <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none">
                    <div className="h-1 w-full bg-red-600/30 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-red-500 animate-pulse w-full shadow-[0_0_12px_#ef4444]" />
                    </div>
                </div>
            )}

            {/* Universal Loader Overlay for slow network transitions */}
            {showUniversalLoader && (
                <Loader 
                    message={targetLabel ? `Loading ${targetLabel}...` : "Navigating..."} 
                    fullScreen={true} 
                />
            )}

            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    return useContext(NavigationContext);
}
