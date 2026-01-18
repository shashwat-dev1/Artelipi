'use client';

import { useState, useEffect } from 'react';
import PageWithSidebars from '@/components/layout/PageWithSidebars';
import { useAuth } from '@/components/auth/AuthProvider';
import { getPersonalizedFeed, getFeaturedFeed, getAllArticles } from '@/lib/firebase/feed';
import { Post } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
    const { user, userData } = useAuth();
    const [activeTab, setActiveTab] = useState<'foryou' | 'featured'>('foryou');
    const [forYouArticles, setForYouArticles] = useState<Post[]>([]);
    const [featuredArticles, setFeaturedArticles] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeeds();
    }, [user, userData]);

    const loadFeeds = async () => {
        setLoading(true);
        try {
            if (user && userData?.following) {
                const personalFeed = await getPersonalizedFeed(user.uid, userData.following, 20);
                setForYouArticles(personalFeed);
            } else {
                const allArticles = await getAllArticles(20);
                setForYouArticles(allArticles);
            }

            const featured = await getFeaturedFeed(20);
            setFeaturedArticles(featured);
        } catch (error) {
            console.error('Error loading feeds:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentArticles = activeTab === 'foryou' ? forYouArticles : featuredArticles;

    return (
        <PageWithSidebars>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Tabs */}
                    <div className="flex items-center gap-8 border-b border-premium-border mb-8">
                        <button
                            onClick={() => setActiveTab('foryou')}
                            className={`pb-4 px-2 font-medium transition-all relative ${activeTab === 'foryou'
                                    ? 'text-premium-text'
                                    : 'text-premium-text-secondary hover:text-premium-text'
                                }`}
                        >
                            For You
                            {activeTab === 'foryou' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-accent"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('featured')}
                            className={`pb-4 px-2 font-medium transition-all relative ${activeTab === 'featured'
                                    ? 'text-premium-text'
                                    : 'text-premium-text-secondary hover:text-premium-text'
                                }`}
                        >
                            Featured
                            {activeTab === 'featured' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-accent"></div>
                            )}
                        </button>
                    </div>

                    {/* Articles Feed */}
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="magazine-paper rounded-xl p-6 animate-pulse">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-10 h-10 bg-premium-bg rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-premium-bg rounded w-1/4 mb-2"></div>
                                            <div className="h-3 bg-premium-bg rounded w-1/6"></div>
                                        </div>
                                    </div>
                                    <div className="h-6 bg-premium-bg rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-premium-bg rounded w-full mb-2"></div>
                                    <div className="h-4 bg-premium-bg rounded w-5/6"></div>
                                </div>
                            ))}
                        </div>
                    ) : currentArticles.length > 0 ? (
                        <div className="space-y-8">
                            {currentArticles.map((article) => {
                                const createdAt = article.createdAt instanceof Date
                                    ? article.createdAt
                                    : article.createdAt?.toDate?.() || new Date();
                                const readingTime = Math.ceil(article.content.length / 1000);

                                return (
                                    <article key={article.id} className="group">
                                        <div className="flex items-center gap-3 mb-4">
                                            {article.authorPhotoURL ? (
                                                <Image
                                                    src={article.authorPhotoURL}
                                                    alt={article.authorName}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                                    {article.authorName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-sm text-premium-text">{article.authorName}</p>
                                                <p className="text-xs text-premium-text-tertiary">
                                                    {createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <Link href={`/post/${article.slug}`} className="block">
                                            <div className="flex gap-6">
                                                <div className="flex-1">
                                                    <h2 className="font-serif text-2xl font-bold text-premium-text mb-2 group-hover:text-premium-accent transition-colors line-clamp-2">
                                                        {article.title}
                                                    </h2>
                                                    <p className="text-premium-text-secondary mb-4 line-clamp-2 leading-relaxed">
                                                        {article.content.substring(0, 200)}...
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-premium-text-tertiary">
                                                        {article.category && (
                                                            <span className="text-premium-accent font-medium">{article.category}</span>
                                                        )}
                                                        <span>{readingTime} min read</span>
                                                        {article.likeCount && article.likeCount > 0 && (
                                                            <>
                                                                <span>·</span>
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                                    </svg>
                                                                    {article.likeCount}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {article.imageURL && (
                                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                                                        <Image
                                                            src={article.imageURL}
                                                            alt={article.title}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        <div className="border-t border-premium-border/30 mt-8"></div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 magazine-paper rounded-xl">
                            <svg className="w-16 h-16 text-premium-text-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-premium-text mb-2">No articles yet</h3>
                            <p className="text-premium-text-secondary">
                                {activeTab === 'foryou'
                                    ? 'Follow some authors to see personalized content'
                                    : 'Check back later for featured articles'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PageWithSidebars>
    );
}
