"use client";

import React from 'react';

/**
 * Universal PILOTPROGRAME Loader
 * ------------------------------
 * A premium, highly aesthetic animated loader featuring custom pulsing glows, 
 * rotating gradient rings, glassmorphic backdrops, and descriptive messages.
 *
 * Props:
 * - message: (string) Loading descriptor.
 * - fullScreen: (boolean) Renders as a full-page modal overlay.
 */
export default function Loader({ message = "Processing...", fullScreen = false }) {
    const loaderContent = (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm w-full z-50">
            {/* Spinning/Pulsing Visual Area */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                {/* 1. Outermost rotating gradient ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 border-r-purple-600 animate-spin" style={{ animationDuration: '1.2s' }}></div>
                
                {/* 2. Middle counter-rotating gradient ring */}
                <div className="absolute inset-2 rounded-full border border-transparent border-b-blue-500 border-l-emerald-500 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>

                {/* 3. Pulsing gradient blur backdrop */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-red-600 to-purple-600 opacity-20 blur-md animate-pulse"></div>

                {/* 4. Core glowing central emblem */}
                <div className="absolute inset-4 rounded-full bg-white dark:bg-[#121216] border border-white/10 flex items-center justify-center shadow-lg shadow-purple-500/10">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-500 animate-pulse" style={{ animationDuration: '1.5s' }}>
                        {/* Custom Abstract P Path */}
                        <path 
                            fill="currentColor" 
                            d="M12,2A10,10,0,0,0,2,12a9.9,9.9,0,0,0,3.3,7.4L5.5,20a1,1,0,0,0,.7.3,1.1,1.1,0,0,0,.7-.3,1,1,0,0,0,0-1.4l-.2-.2A7.9,7.9,0,0,1,4,12,8,8,0,0,1,12,4a8.1,8.1,0,0,1,6.9,4H15a1,1,0,0,0,0,2h5a1,1,0,0,0,1-1V4a1,1,0,0,0-2,0V6.7A9.9,9.9,0,0,0,12,2Z"
                        />
                    </svg>
                </div>
            </div>

            {/* Glowing typography loader message */}
            <p className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-widest leading-relaxed drop-shadow-sm">
                {message}
            </p>

            {/* Animated subtle progress indicator */}
            <div className="flex gap-1.5 items-center justify-center mt-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xl">
                {/* Embedded decorative ambient backdrop lights */}
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative bg-white/5 dark:bg-[#111115]/80 border border-white/5 p-6 rounded-3xl shadow-2xl flex flex-col items-center">
                    {loaderContent}
                </div>
            </div>
        );
    }

    return loaderContent;
}
