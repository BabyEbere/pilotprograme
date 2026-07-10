"use client";

import { useEffect } from 'react';
import { MdCheckCircle, MdError, MdClose } from 'react-icons/md';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${type === 'success'
                    ? 'bg-white border-green-200 text-gray-800'
                    : 'bg-white border-red-200 text-gray-800'
                }`}>
                {type === 'success' ? (
                    <MdCheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                    <MdError className="w-5 h-5 text-red-500" />
                )}

                <p className="text-sm font-medium">{message}</p>

                <button
                    onClick={onClose}
                    className="ml-2 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500"
                >
                    <MdClose className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
