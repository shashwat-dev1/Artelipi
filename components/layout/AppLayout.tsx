'use client';

import { ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

/**
 * Simple pass-through layout
 * Pages use PageWithSidebars component directly for sidebar layout
 */
export default function AppLayout({ children }: AppLayoutProps) {
    return <>{children}</>;
}
