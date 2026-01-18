'use client';

import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import { ReactNode } from 'react';

interface WithSidebarsProps {
    children: ReactNode;
}

/**
 * Wraps content with left and right sidebars
 * IMPORTANT: Children should NOT include Header - only content below header
 */
export default function WithSidebars({ children }: WithSidebarsProps) {
    return (
        <div className="flex bg-premium-bg">
            <Sidebar />
            <div className="flex-1 min-w-0">
                {children}
            </div>
            <RightSidebar />
        </div>
    );
}
