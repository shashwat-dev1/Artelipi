'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
    const { user, userData, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Skip checks on these pages
        const skipPages = ['/login', '/signup', '/verify-email', '/complete-profile'];
        if (skipPages.includes(pathname)) {
            return;
        }

        if (!loading && user && userData) {
            // Check if profile is incomplete
            const isProfileIncomplete = !userData.firstName || !userData.lastName || !userData.username;

            // If email not verified, redirect to verify-email
            if (!user.emailVerified) {
                router.push('/verify-email');
                return;
            }

            // If profile incomplete, redirect to complete-profile
            if (isProfileIncomplete) {
                router.push('/complete-profile');
                return;
            }
        }
    }, [user, userData, loading, pathname, router]);

    return <>{children}</>;
}
