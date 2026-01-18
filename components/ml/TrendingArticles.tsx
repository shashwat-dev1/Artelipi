'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

interface Article {
    id: string;
    title: string;
    author: string;
    slug: string;
    likeCount?: number;
    viewCount?: number;
    engagement_score?: number;
}

interface TrendingArticlesProps {
    limit?: number;
}

export default function TrendingArticles({ limit = 10 }: TrendingArticlesProps) {
    const [trending, setTrending] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [mlEnabled, setMlEnabled] = useState(false);

    useEffect(() => {
        loadTrending();
    }, []);

    const loadTrending = async () => {
        try {
            const response = await fetch(`${ML_API_URL}/trending?limit=${limit}`);

            if (!response.ok) {
                throw new Error('Failed to fetch trending');
            }

            const data = await response.json();
            setTrending(data.articles || []);
            setMlEnabled(data.ml_enabled || false);
        } catch (err) {
            console.error('Trending API unavailable:', err);
            // Silently fail - component will hide
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="shimmer h-20 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (trending.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted">No articles yet. Be the first to publish!</p>
                <Link href="/write" className="btn-primary inline-block mt-4">
                    Write First Article
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {trending.map((article, index) => (
                <Link
                    key={article.id}
                    href={`/post/${article.slug}`}
                    className="group flex gap-6 items-start magazine-paper p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                >
                    <span className="text-premium-text-tertiary font-serif text-3xl font-light min-w-[3rem]">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                        <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-premium-accent transition-colors">
                            {article.title}
                        </h3>
                        <div className="flex items-center gap-3 text-muted">
                            <span>{article.author}</span>
                            {article.likeCount !== undefined && article.likeCount > 0 && (
                                <>
                                    <span>·</span>
                                    <span>❤️ {article.likeCount}</span>
                                </>
                            )}
                            {article.viewCount !== undefined && article.viewCount > 0 && (
                                <>
                                    <span>·</span>
                                    <span>👁️ {article.viewCount}</span>
                                </>
                            )}
                        </div>
                    </div>
                </Link>
            ))}

            {/* ML Status Indicator */}
            <div className="text-center pt-4">
                <p className="text-xs text-muted">
                    {mlEnabled ? '🤖 AI-powered recommendations' : '📊 Sorted by engagement'}
                </p>
            </div>
        </div>
    );
}
