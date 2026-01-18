'use client';

import { useState, useEffect } from 'react';
import { getArticlesByCategory } from '@/lib/firebase/search';
import { Post } from '@/types';
import { CATEGORY_INFO } from '@/lib/constants';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryPageProps {
    params: Promise<{ category: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
    const [category, setCategory] = useState<string>('');
    const [articles, setArticles] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then(p => {
            const cat = decodeURIComponent(p.category);
            setCategory(cat);
            loadArticles(cat);
        });
    }, [params]);

    const loadArticles = async (cat: string) => {
        setLoading(true);
        try {
            const posts = await getArticlesByCategory(cat);
            setArticles(posts);
        } catch (error) {
            console.error('Error loading category articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const categoryInfo = CATEGORY_INFO[category];

    return (
        <>
            <Header />
            <div className="min-h-screen bg-premium-bg py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Category Header */}
                    <div className="text-center mb-12">
                        {categoryInfo && (
                            <div className="text-6xl mb-4">{categoryInfo.icon}</div>
                        )}
                        <h1 className="heading-hero mb-4">{category}</h1>
                        {categoryInfo && (
                            <p className="text-subtle text-xl">{categoryInfo.description}</p>
                        )}
                    </div>

                    {/* Articles */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="shimmer h-80 rounded-lg"></div>
                            ))}
                        </div>
                    ) : articles.length > 0 ? (
                        <div>
                            <p className="text-muted mb-8">
                                {articles.length} article{articles.length !== 1 ? 's' : ''} in {category}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {articles.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/post/${post.slug}`}
                                        className="group magazine-paper rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        {post.imageURL && (
                                            <div className="relative w-full h-48 overflow-hidden">
                                                <Image
                                                    src={post.imageURL}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-premium-accent transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-muted mb-4 line-clamp-2">
                                                {post.content.substring(0, 150)}...
                                            </p>
                                            <div className="flex items-center gap-3 text-sm text-muted">
                                                <span>{post.authorName}</span>
                                                <span>·</span>
                                                <span>{Math.ceil(post.content.length / 1000)} min read</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="heading-lg mb-2">No articles yet</h3>
                            <p className="text-subtle mb-6">
                                Be the first to write about {category}
                            </p>
                            <Link href="/write" className="btn-primary inline-block">
                                Write Article
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
