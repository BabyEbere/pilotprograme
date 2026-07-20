"use client";

import { Share2 } from 'lucide-react';

export default function ShareButton({ title, excerpt }) {
    const sharePost = () => {
        if (typeof window !== 'undefined' && navigator.share) {
            navigator.share({
                title: title,
                text: excerpt,
                url: window.location.href
            }).catch(() => {});
        } else {
            // Fallback: copy to clipboard
            if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        }
    };

    return (
        <button
            onClick={sharePost}
            className="ml-auto flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-655 dark:hover:text-red-500 transition-colors"
        >
            <Share2 className="w-4 h-4" />
            Share
        </button>
    );
}
