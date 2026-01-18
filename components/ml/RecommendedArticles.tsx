'use client';

import { useState, useEffect } from 'react';
import { getRecommendationsByContent, ArticleRecommendation } from '@/lib/ml-api';
import Link from 'next/link';

interface RecommendedArticlesProps {
    currentArticle?: {
        title: string;
        content: string;
    };
    limit?: number;
}

export default function RecommendedArticles({ currentArticle, limit = 5 }: RecommendedArticlesProps) {
    const [recommendations, setRecommendations] = useState<ArticleRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentArticle) {
            loadRecommendations();
        }
    }, [currentArticle]);

    const loadRecommendations = async () => {
        if (!currentArticle) return;

        setLoading(true);
        setError(null);

        try {
            // Combine title and content for better matching
            const content = `${currentArticle.title} ${currentArticle.content.substring(0, 1000)}`;
            const data = await getRecommendationsByContent(content, limit);
            setRecommendations(data.recommendations);
        } catch (err) {
            console.error('ML API not available:', err);
            // Silently fail - don't show error to user
            setError('ML API unavailable');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-12">
                <h3 className="heading-lg mb-8">Recommended for you</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-24 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || recommendations.length === 0) {
        return null;
    }

    return (
        <section className="py-12 border-t border-premium-border">
            <h3 className="heading-lg mb-8">Recommended for you</h3>
            <div className="space-y-6">
                {recommendations.map((rec, index) => (
                    <div
                        key={index}
                        className="magazine-paper rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                    >
                        <div className="flex gap-4 items-start">
                            <span className="text-premium-text-tertiary font-serif text-2xl font-light min-w-[2.5rem]">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1">
                                <h4 className="text-xl font-serif font-semibold mb-2 hover:text-premium-accent transition-colors">
                                    {rec.title}
                                </h4>
                                <div className="flex items-center gap-3 text-muted">
                                    <span>{rec.author}</span>
                                    <span>·</span>
                                    <span>{rec.reading_time} min read</span>
                                    <span>·</span>
                                    <span className="text-premium-accent">
                                        {Math.round(rec.similarity_score * 100)}% match
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
