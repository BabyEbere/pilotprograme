"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
