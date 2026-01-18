'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

interface PageWithSidebarsProps {
    children: ReactNode;
}

/**
 * Complete page layout with Header, Sidebars, and Footer
 * Use this wrapper for pages that need the full layout
 */
export default function PageWithSidebars({ children }: PageWithSidebarsProps) {
    return (
        <>
            <Header />
            <div className="flex min-h-screen bg-premium-bg">
                <Sidebar />
                <main className="flex-1 min-w-0">
                    {children}
                </main>
                <RightSidebar />
            </div>
            <Footer />
        </>
    );
}
