'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getUserBookmarkedPosts } from '@/lib/firebase/bookmarks';
import { Post } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ArticleCard from '@/components/article/ArticleCard';

export default function SavedArticlesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            loadBookmarkedPosts();
        }
    }, [user, authLoading, router]);

    const loadBookmarkedPosts = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const bookmarkedPosts = await getUserBookmarkedPosts(user.uid);
            setPosts(bookmarkedPosts);
        } catch (error) {
            console.error('Error loading bookmarked posts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your saved articles...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            📚 Saved Articles
                        </h1>
                        <p className="text-gray-600">
                            Your reading list • {posts.length} {posts.length === 1 ? 'article' : 'articles'}
                        </p>
                    </div>

                    {/* Articles Grid */}
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <ArticleCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-20">
                            <div className="mb-6">
                                <svg
                                    className="mx-auto h-24 w-24 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                No saved articles yet
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Start building your reading list by bookmarking articles you want to read later.
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="btn-primary"
                            >
                                Explore Articles
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
