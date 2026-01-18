'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function TestLayoutPage() {
    return (
        <SidebarProvider>
            {/* Existing Header with Hamburger */}
            <Header />

            {/* Medium-Style Layout */}
            <div className="flex min-h-screen bg-premium-bg">
                {/* Left Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 min-w-0 px-8 py-8 lg:py-12">
                    <div className="max-w-3xl">
                        <h1 className="heading-hero mb-4">Perfect Layout!</h1>
                        <p className="text-subtle mb-8">
                            Hamburger in header (☰), sidebar shows icons when collapsed
                        </p>

                        {/* Sample Content */}
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <article key={i} className="magazine-paper rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                                    <h2 className="heading-lg mb-3">Sample Article Title {i}</h2>
                                    <p className="text-muted mb-4 leading-relaxed">
                                        Click the hamburger menu (☰) in the header to collapse the sidebar.
                                        When collapsed, you'll see just the icons. Perfect like Medium!
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-subtle">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            5 min read
                                        </span>
                                        <span>·</span>
                                        <span>Jan 5, 2026</span>
                                        <span>·</span>
                                        <span className="text-premium-accent">Technology</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar */}
                <RightSidebar />
            </div>

            {/* Existing Footer */}
            <Footer />
        </SidebarProvider>
    );
}
