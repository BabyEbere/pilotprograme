"use client";

export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import Link from 'next/link';

function NotFoundContent() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 text-center">
            <h1 className="text-6xl font-black text-red-500 mb-2">404</h1>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-4">Page Not Found</h2>
            <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                href="/dashboard"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-lg"
            >
                Return to Dashboard
            </Link>
        </div>
    );
}

export default function NotFound() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] text-white p-6 text-xs font-bold">Loading...</div>}>
            <NotFoundContent />
        </Suspense>
    );
}
