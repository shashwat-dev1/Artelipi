'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getUserAnalytics } from '@/lib/firebase/analytics';
import { UserAnalytics } from '@/types/analytics';
import PageWithSidebars from '@/components/layout/PageWithSidebars';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            loadAnalytics();
        }
    }, [user, authLoading]);

    const loadAnalytics = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const data = await getUserAnalytics(user.uid);
            setAnalytics(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <PageWithSidebars>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-premium-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted">Loading analytics...</p>
                    </div>
                </div>
            </PageWithSidebars>
        );
    }

    if (!analytics) {
        return (
            <PageWithSidebars>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-muted">No analytics data available</p>
                    </div>
                </div>
            </PageWithSidebars>
        );
    }

    return (
        <PageWithSidebars>
            <div className="min-h-screen bg-premium-bg py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="heading-hero mb-2">Analytics Dashboard</h1>
                        <p className="text-subtle">Track your performance and growth</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {/* Total Views */}
                        <div className="magazine-paper rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-muted">Total Views</h3>
                                <svg className="w-5 h-5 text-premium-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-premium-text">{analytics.totalViews.toLocaleString()}</p>
                            <p className="text-xs text-muted mt-1">+{analytics.viewsThisWeek} this week</p>
                        </div>

                        {/* Total Likes */}
                        <div className="magazine-paper rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-muted">Total Likes</h3>
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-premium-text">{analytics.totalLikes.toLocaleString()}</p>
                            <p className="text-xs text-muted mt-1">+{analytics.likesThisWeek} this week</p>
                        </div>

                        {/* Total Followers */}
                        <div className="magazine-paper rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-muted">Followers</h3>
                                <svg className="w-5 h-5 text-premium-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-premium-text">{analytics.totalFollowers.toLocaleString()}</p>
                            <p className="text-xs text-muted mt-1">{analytics.totalFollowing} following</p>
                        </div>

                        {/* Total Articles */}
                        <div className="magazine-paper rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-muted">Articles</h3>
                                <svg className="w-5 h-5 text-premium-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-premium-text">{analytics.totalArticles}</p>
                            <p className="text-xs text-muted mt-1">{analytics.totalBookmarks} bookmarks</p>
                        </div>
                    </div>

                    {/* Top Articles */}
                    <div className="magazine-paper rounded-xl p-8 mb-12">
                        <h2 className="heading-lg mb-6">Top Performing Articles</h2>

                        {analytics.topArticles.length > 0 ? (
                            <div className="space-y-4">
                                {analytics.topArticles.map((article, index) => (
                                    <Link
                                        key={article.postId}
                                        href={`/post/${article.slug}`}
                                        className="block p-4 rounded-lg hover:bg-premium-bg transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="text-2xl font-serif text-premium-text-tertiary min-w-[2rem]">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <h3 className="font-serif font-semibold text-lg mb-2 hover:text-premium-accent transition-colors">
                                                    {article.title}
                                                </h3>
                                                <div className="flex items-center gap-6 text-sm text-muted">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        {article.views.toLocaleString()} views
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        ❤️ {article.likes.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        🔖 {article.bookmarks.toLocaleString()}
                                                    </span>
                                                    <span>{article.readTime} min read</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted mb-4">No articles published yet</p>
                                <Link href="/write" className="btn-primary inline-block">
                                    Write Your First Article
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/write" className="magazine-paper rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-premium-accent/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-premium-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Write Article</h3>
                                    <p className="text-sm text-muted">Create new content</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/reading-list" className="magazine-paper rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-premium-accent/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-premium-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Reading List</h3>
                                    <p className="text-sm text-muted">Saved articles</p>
                                </div>
                            </div>
                        </Link>

                        <Link href={`/profile/${user?.displayName || user?.uid}`} className="magazine-paper rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-premium-accent/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-premium-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">My Profile</h3>
                                    <p className="text-sm text-muted">View public profile</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </PageWithSidebars>
    );
}
