'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { sendEmailVerification, applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    const [checking, setChecking] = useState(false);
    const [resending, setResending] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [countdown, setCountdown] = useState(0);
    const [verifying, setVerifying] = useState(false);

    // Handle verification from email link
    useEffect(() => {
        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');

        if (mode === 'verifyEmail' && oobCode) {
            handleEmailVerification(oobCode);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (!loading && user?.emailVerified) {
            router.push('/complete-profile');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleEmailVerification = async (oobCode: string) => {
        setVerifying(true);
        try {
            await applyActionCode(auth, oobCode);
            toast.success('Email verified successfully!');

            // Reload user to update emailVerified status
            if (user) {
                await user.reload();
            }

            // Redirect to complete profile
            setTimeout(() => {
                router.push('/complete-profile');
            }, 1000);
        } catch (error: any) {
            console.error('Verification error:', error);
            toast.error('Failed to verify email. The link may have expired.');
        } finally {
            setVerifying(false);
        }
    };

    const handleResendEmail = async () => {
        if (!user || !canResend) return;

        setResending(true);
        try {
            await sendEmailVerification(user);
            toast.success('Verification email sent! Check your inbox.');
            setCanResend(false);
            setCountdown(60); // 60 second cooldown
        } catch (error: any) {
            toast.error(error.message || 'Failed to send email');
        } finally {
            setResending(false);
        }
    };

    const handleCheckVerification = async () => {
        if (!user) return;

        setChecking(true);
        try {
            await user.reload();
            if (user.emailVerified) {
                toast.success('Email verified successfully!');
                router.push('/complete-profile');
            } else {
                toast.error('Email not verified yet. Please check your inbox.');
            }
        } catch (error: any) {
            toast.error('Failed to check verification status');
        } finally {
            setChecking(false);
        }
    };

    if (loading || verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{verifying ? 'Verifying your email...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Verify Your Email
                    </h1>
                    <p className="text-gray-600">
                        We've sent a verification link to
                    </p>
                    <p className="text-blue-600 font-semibold mt-1">
                        {user?.email}
                    </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Next steps:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                        <li>Check your email inbox</li>
                        <li>Click the verification link</li>
                        <li>Return here and click "I've Verified"</li>
                    </ol>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleCheckVerification}
                        disabled={checking}
                        className="w-full btn-primary disabled:opacity-50"
                    >
                        {checking ? 'Checking...' : "I've Verified My Email"}
                    </button>

                    <button
                        onClick={handleResendEmail}
                        disabled={!canResend || resending}
                        className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resending ? 'Sending...' : canResend ? 'Resend Email' : `Resend in ${countdown}s`}
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Didn't receive the email?</p>
                    <ul className="mt-2 space-y-1">
                        <li>• Check your spam folder</li>
                        <li>• Make sure {user?.email} is correct</li>
                        <li>• Wait a few minutes and try resending</li>
                    </ul>
                </div>

                {/* Sign Out */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
