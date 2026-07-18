"use client";

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';

export default function Providers({ children }) {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <GoogleAuthProvider>
                    {children}
                </GoogleAuthProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}
