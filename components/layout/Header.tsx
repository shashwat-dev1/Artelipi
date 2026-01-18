'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSidebar } from '@/contexts/SidebarContext';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useState } from 'react';
import CompletionRing from '@/components/profile/CompletionRing';

export default function Header() {
    const { user, userData, loading } = useAuth();
    const { toggleSidebar } = useSidebar();
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const showCompletionRing = userData && userData.profileCompletionPercentage < 100;

    return (
        <header className="border-b border-premium-border bg-white sticky top-0 z-50">
            <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8">
                {/* Left: Hamburger + Logo */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Hamburger Menu */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:block p-2 hover:bg-premium-bg rounded-lg transition-colors"
                        title="Toggle sidebar"
                    >
                        <svg className="w-5 h-5 text-premium-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <h1 className="text-2xl font-serif font-bold text-premium-text">Artelipi</h1>
                    </Link>
                </div>

                {/* Right: Navigation */}
                <nav className="flex items-center gap-6">
                    <Link
                        href="/search"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Search articles"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </Link>

                    <Link
                        href="/about"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        About
                    </Link>

                    {loading ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    ) : user ? (
                        <>
                            <Link
                                href="/write"
                                className="btn-primary text-sm px-4 py-2"
                            >
                                Write
                            </Link>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    {/* Avatar with Completion Ring */}
                                    {showCompletionRing ? (
                                        <div className="relative inline-flex items-center justify-center">
                                            <CompletionRing
                                                percentage={userData.profileCompletionPercentage}
                                                size={44}
                                                strokeWidth={3}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                {userData?.photoURL ? (
                                                    <Image
                                                        src={userData.photoURL}
                                                        alt={userData.name}
                                                        width={36}
                                                        height={36}
                                                        className="rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                                        {userData?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        userData?.photoURL ? (
                                            <Image
                                                src={userData.photoURL}
                                                alt={userData.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                                {userData?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowDropdown(false)}
                                        />

                                        {/* Menu */}
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="font-semibold text-gray-900">{userData?.name}</p>
                                                <p className="text-sm text-gray-500">@{userData?.username}</p>
                                            </div>

                                            <Link
                                                href={`/${userData?.username}`}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                View Profile
                                            </Link>

                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                Dashboard
                                            </Link>

                                            <Link
                                                href="/reading-list"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                Reading List
                                            </Link>

                                            <Link
                                                href="/settings"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                Settings
                                            </Link>


                                            <Link
                                                href="/saved"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                Saved Articles
                                            </Link>
                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                <button
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        handleSignOut();
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="btn-primary text-sm"
                        >
                            Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
