"use client";

import React from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

export default function ControlLayout({ children }) {
    return <AdminProtectedRoute>{children}</AdminProtectedRoute>;
}
