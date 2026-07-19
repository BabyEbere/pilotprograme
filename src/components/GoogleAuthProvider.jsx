"use client";

/**
 * GoogleAuthProvider
 * ------------------
 * Fetches the Google OAuth Client ID from the backend DB at runtime.
 * Only initialises the Google SDK when the feature is enabled AND a client_id exists.
 * This avoids hard-coding the client_id in .env.
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

// ── Context ───────────────────────────────────────────────────────────────────
const GoogleAuthContext = createContext({ enabled: false, clientId: null, loaded: false });

export function useGoogleAuth() {
    return useContext(GoogleAuthContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────
export default function GoogleAuthProvider({ children }) {
    const [config, setConfig] = useState({ enabled: false, clientId: null, loaded: false });

    const API_URL = typeof window !== 'undefined'
        ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000'
            : 'https://s1.pilotprograme.com/api')
        : 'http://localhost:5000';

    useEffect(() => {
        fetch(`${API_URL}/auth/google/config`)
            .then(r => r.json())
            .then(data => {
                setConfig({
                    enabled: data.enabled && !!data.client_id,
                    clientId: data.client_id || null,
                    loaded: true,
                });
            })
            .catch(() => {
                setConfig({ enabled: false, clientId: null, loaded: true });
            });
    }, []);

    // Render children immediately with the fetched or placeholder clientId.
    // This guarantees that useGoogleLogin() on Login/Register/Settings pages doesn't throw.
    const effectiveClientId = config.clientId || "dummy-client-id.apps.googleusercontent.com";

    return (
        <GoogleAuthContext.Provider value={config}>
            <GoogleOAuthProvider clientId={effectiveClientId}>
                {children}
            </GoogleOAuthProvider>
        </GoogleAuthContext.Provider>
    );
}
