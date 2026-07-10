"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

export default function VerifyOTP() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = (searchParams && searchParams.get('email')) || '';
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!email) {
            router.push('/register');
        }
    }, [email, router]);

    const handleChange = (index, value) => {
        if (value.length > 1) {
            value = value[0];
        }

        const newOtp = [...otpCode];
        newOtp[index] = value;
        setOtpCode(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const code = otpCode.join('');
        if (code.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otpCode: code,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage(data.message);
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to verify OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccessMessage('');
        setResending(true);

        try {
            const response = await fetch(`${(typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000')}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('OTP resent successfully! Check your email.');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-6">
                        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-2.5 shadow-lg">
                            <svg className="w-8 h-8 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">PilotPrograme</span>
                    </Link>

                    <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-red-600" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                    <p className="text-gray-600 dark:text-gray-500">
                        We've sent a 6-digit code to<br />
                        <span className="font-semibold text-gray-900">{email}</span>
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                Enter Verification Code
                            </label>
                            <div className="flex gap-2 justify-center">
                                {otpCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                                {successMessage}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-gray-900 dark:text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    {/* Resend OTP */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-500 mb-2">Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="text-red-600 hover:text-red-700 font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                            {resending ? 'Resending...' : 'Resend Code'}
                        </button>
                    </div>

                    {/* Back Link */}
                    <div className="mt-6 text-center">
                        <Link href="/register"
                            className="text-sm text-gray-600 dark:text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to registration
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-500">
                    The code will expire in 10 minutes
                </p>
            </div>
        </div>
    );
}
