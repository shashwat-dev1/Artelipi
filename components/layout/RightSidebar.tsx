'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CATEGORIES } from '@/lib/constants';

export default function RightSidebar() {
    const [trendingArticles, setTrendingArticles] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrending();
    }, []);

    const loadTrending = async () => {
        try {
            const q = query(
                collection(db, 'posts'),
                orderBy('viewCount', 'desc'),
                limit(6)
            );
            const snapshot = await getDocs(q);
            const articles: Post[] = [];
            snapshot.forEach((doc) => {
                articles.push({ id: doc.id, ...doc.data() } as Post);
            });
            setTrendingArticles(articles);
        } catch (error) {
            console.error('Error loading trending:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-8 pr-4">
                {/* Trending Articles */}
                <div className="magazine-paper rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-premium-text mb-6 flex items-center gap-2">
                        <svg className="w-4 h-4 text-premium-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Trending on Artelipi
                    </h3>
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-premium-bg rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-premium-bg rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {trendingArticles.map((article, index) => (
                                <Link
                                    key={article.id}
                                    href={`/post/${article.slug}`}
                                    className="block group"
                                >
                                    <div className="flex gap-4">
                                        <span className="text-2xl font-serif text-premium-text-tertiary font-bold flex-shrink-0">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-premium-text-secondary truncate">
                                                    {article.authorName}
                                                </span>
                                            </div>
                                            <h4 className="font-serif font-semibold text-sm leading-tight group-hover:text-premium-accent transition-colors line-clamp-2 mb-2">
                                                {article.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-premium-text-tertiary">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span>{article.viewCount || 0}</span>
                                                {article.category && (
                                                    <>
                                                        <span>·</span>
                                                        <span className="text-premium-accent">{article.category}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommended Topics */}
                <div className="magazine-paper rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-premium-text mb-4">
                        Recommended Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.slice(0, 6).map((category) => (
                            <Link
                                key={category}
                                href={`/category/${category}`}
                                className="px-4 py-2 bg-premium-bg hover:bg-premium-accent/10 rounded-full text-sm text-premium-text hover:text-premium-accent transition-all duration-200 border border-transparent hover:border-premium-accent/20"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                    <Link
                        href="/search"
                        className="block mt-4 text-sm text-premium-accent hover:underline animated-underline"
                    >
                        See more topics →
                    </Link>
                </div>

                {/* Footer Links */}
                <div className="pt-4 border-t border-premium-border">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-premium-text-tertiary">
                        <Link href="/about" className="hover:text-premium-accent transition-colors">About</Link>
                        <Link href="/terms" className="hover:text-premium-accent transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-premium-accent transition-colors">Privacy</Link>
                        <Link href="/contact" className="hover:text-premium-accent transition-colors">Contact</Link>
                    </div>
                    <p className="text-xs text-premium-text-tertiary mt-4">
                        © 2026 Artelipi
                    </p>
                </div>
            </div>
        </aside>
    );
}
