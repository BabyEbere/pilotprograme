"use client";

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { NavigationProvider } from '@/context/NavigationContext';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';

export default function Providers({ children }) {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <NavigationProvider>
                    <GoogleAuthProvider>
                        {children}
                    </GoogleAuthProvider>
                </NavigationProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}
