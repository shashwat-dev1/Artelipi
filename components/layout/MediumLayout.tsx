'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

interface MediumLayoutProps {
    children: React.ReactNode;
    showRightSidebar?: boolean;
}

export default function MediumLayout({ children, showRightSidebar = true }: MediumLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <>
            {/* Hamburger Menu Button - Visible in Header area */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="fixed top-20 left-4 z-50 lg:block hidden p-2 magazine-paper border border-premium-border rounded-lg hover:bg-premium-bg transition-colors shadow-sm"
                title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
                <svg
                    className="w-5 h-5 text-premium-text"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Main Layout */}
            <div className="flex min-h-screen bg-premium-bg">
                {/* Left Sidebar */}
                <Sidebar collapsed={sidebarCollapsed} />

                {/* Main Content */}
                <main className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-8' : ''}`}>
                    {children}
                </main>

                {/* Right Sidebar */}
                {showRightSidebar && <RightSidebar />}
            </div>
        </>
    );
}
