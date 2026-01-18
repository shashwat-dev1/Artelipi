'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const { user, userData } = useAuth();
    const { collapsed } = useSidebar();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        {
            id: 'home',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            label: 'Home',
            path: '/',
        },
        {
            id: 'reading-list',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            ),
            label: 'Reading List',
            path: '/reading-list',
        },
        {
            id: 'profile',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            label: 'Profile',
            path: userData?.username ? `/${userData.username}` : '/login',
        },
        {
            id: 'stats',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            label: 'Stats',
            path: '/dashboard',
        },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:block bg-gradient-to-b from-[#FDFCFB] to-[#FAF9F7] border-r border-premium-border/40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
                style={{ boxShadow: '2px 0 15px rgba(0, 0, 0, 0.03)' }}
            >
                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-premium-accent/10 to-premium-accent/5 text-premium-accent font-medium shadow-sm'
                                    : 'text-premium-text-secondary hover:bg-white/60 hover:text-premium-text'
                                }`}
                            title={collapsed ? item.label : ''}
                        >
                            <span className={`transition-colors ${isActive(item.path) ? 'text-premium-accent' : ''}`}>
                                {item.icon}
                            </span>
                            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                        </Link>
                    ))}

                    {/* Separator */}
                    {!collapsed && <div className="border-t border-premium-border/30 my-4"></div>}

                    {/* Following Section */}
                    {!collapsed && user && (
                        <div className="pt-2">
                            <h3 className="px-3 text-xs font-semibold text-premium-text-tertiary uppercase tracking-wider mb-3">
                                Following
                            </h3>
                            <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                                {userData?.following && userData.following.length > 0 ? (
                                    <Link
                                        href={`/${userData.username}/following`}
                                        className="block px-3 py-2 text-sm text-premium-text-secondary hover:text-premium-accent hover:bg-white/60 rounded-lg transition-all"
                                    >
                                        <span className="font-medium">{userData.followingCount || 0}</span> authors
                                    </Link>
                                ) : (
                                    <p className="px-3 py-2 text-sm text-premium-text-tertiary italic">
                                        No following yet
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-premium-border/50 z-50 safe-bottom" style={{ boxShadow: '0 -1px 10px rgba(0, 0, 0, 0.02)' }}>
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive(item.path) ? 'text-premium-accent' : 'text-premium-text-secondary'
                                }`}
                        >
                            <span className="mb-1">{item.icon}</span>
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    );
}
