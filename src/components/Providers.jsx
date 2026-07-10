"use client";

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';

export default function Providers({ children }) {
    return (
        <ThemeProvider>
            <NotificationProvider>
                {children}
            </NotificationProvider>
        </ThemeProvider>
    );
}
