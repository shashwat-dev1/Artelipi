'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getReadingList } from '@/lib/firebase/readingList';
import { getPostById } from '@/lib/firebase/firestore';
import { Post } from '@/types';
import PageWithSidebars from '@/components/layout/PageWithSidebars';
import Link from 'next/link';
import Image from 'next/image';
import ReadingListButton from '@/components/user/ReadingListButton';

export default function ReadingListPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            loadReadingList();
        }
    }, [user, authLoading]);

    const loadReadingList = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const postIds = await getReadingList(user.uid);

            // Fetch all posts
            const postPromises = postIds.map(id => getPostById(id));
            const fetchedPosts = await Promise.all(postPromises);

            // Filter out null values
            const validPosts = fetchedPosts.filter((post): post is Post => post !== null);
            setPosts(validPosts);
        } catch (error) {
            console.error('Error loading reading list:', error);
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
                        <p className="text-muted">Loading reading list...</p>
                    </div>
                </div>
            </PageWithSidebars>
        );
    }

    return (
        <PageWithSidebars>
            <div className="min-h-screen bg-premium-bg py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="heading-hero mb-2">Reading List</h1>
                        <p className="text-subtle">
                            {posts.length} article{posts.length !== 1 ? 's' : ''} saved for later
                        </p>
                    </div>

                    {/* Articles */}
                    {posts.length > 0 ? (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="magazine-paper rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex gap-6">
                                        {post.imageURL && (
                                            <Link href={`/post/${post.slug}`} className="relative w-48 h-32 flex-shrink-0">
                                                <Image
                                                    src={post.imageURL}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                />
                                            </Link>
                                        )}
                                        <div className="flex-1">
                                            <Link href={`/post/${post.slug}`}>
                                                <h2 className="text-2xl font-serif font-semibold mb-2 hover:text-premium-accent transition-colors">
                                                    {post.title}
                                                </h2>
                                            </Link>
                                            <p className="text-muted mb-3 line-clamp-2">
                                                {post.content.substring(0, 200)}...
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-sm text-muted">
                                                    <span>{post.authorName}</span>
                                                    {post.category && (
                                                        <>
                                                            <span>·</span>
                                                            <span className="text-premium-accent">{post.category}</span>
                                                        </>
                                                    )}
                                                    <span>·</span>
                                                    <span>{Math.ceil(post.content.length / 1000)} min read</span>
                                                </div>
                                                <ReadingListButton
                                                    postId={post.id}
                                                    postTitle={post.title}
                                                    showText={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 magazine-paper rounded-xl">
                            <svg className="w-20 h-20 text-premium-text-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <h3 className="heading-lg mb-2">Your reading list is empty</h3>
                            <p className="text-subtle mb-6">
                                Save articles to read later by clicking the bookmark icon
                            </p>
                            <Link href="/" className="btn-primary inline-block">
                                Explore Articles
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </PageWithSidebars>
    );
}
