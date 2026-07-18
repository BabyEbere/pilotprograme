/**
 * Centralized API URL configuration
 * Uses environment variable NEXT_PUBLIC_API_URL with fallback to hostname detection
 */

export function getApiUrl() {
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback to hostname detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return 'https://pilotprograme.com/api';
  }
  
  // Server-side fallback
  return 'http://localhost:5000';
}

export function getFrontendUrl() {
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return process.env.NEXT_PUBLIC_FRONTEND_URL;
  }
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return 'http://localhost:3000';
}
