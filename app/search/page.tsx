'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchAll } from '@/lib/firebase/search';
import { Post, User } from '@/types';
import PageWithSidebars from '@/components/layout/PageWithSidebars';
import Link from 'next/link';
import Image from 'next/image';
import FollowButton from '@/components/user/FollowButton';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(query);
    const [authors, setAuthors] = useState<User[]>([]);
    const [articles, setArticles] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            performSearch(query);
        }
    }, [query]);

    const performSearch = async (q: string) => {
        if (!q.trim()) {
            setAuthors([]);
            setArticles([]);
            return;
        }

        setLoading(true);
        try {
            const results = await searchAll(q);
            setAuthors(results.authors);
            setArticles(results.articles);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    const totalResults = authors.length + articles.length;

    return (
        <div className="min-h-screen bg-premium-bg py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Bar */}
                <div className="mb-12">
                    <h1 className="heading-xl mb-6">Search</h1>
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, content, author, or keywords..."
                            className="input-field pr-12 text-lg"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-premium-accent hover:text-premium-accent-hover"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="shimmer h-32 rounded-lg"></div>
                        ))}
                    </div>
                ) : totalResults > 0 ? (
                    <div>
                        <p className="text-muted mb-8">
                            Found {totalResults} result{totalResults !== 1 ? 's' : ''} for &quot;{query}&quot;
                        </p>

                        {/* Authors Section */}
                        {authors.length > 0 && (
                            <div className="mb-12">
                                <h2 className="heading-lg mb-6">Authors</h2>
                                <div className="space-y-4">
                                    {authors.map((author) => (
                                        <div
                                            key={author.uid}
                                            className="magazine-paper rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <Link href={`/${author.username}`} className="flex items-center gap-4 flex-1">
                                                    {author.photoURL ? (
                                                        <Image
                                                            src={author.photoURL}
                                                            alt={author.name}
                                                            width={64}
                                                            height={64}
                                                            className="rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                                                            {author.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-serif font-semibold mb-1 hover:text-premium-accent transition-colors">
                                                            {author.name}
                                                        </h3>
                                                        <p className="text-muted text-sm mb-2">@{author.username}</p>
                                                        {author.bio && (
                                                            <p className="text-muted line-clamp-2">{author.bio}</p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-sm text-muted mt-2">
                                                            <span>{author.followerCount || 0} followers</span>
                                                            <span>·</span>
                                                            <span>{author.totalArticles || 0} articles</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <FollowButton
                                                    targetUserId={author.uid}
                                                    targetUserName={author.name}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Articles Section */}
                        {articles.length > 0 && (
                            <div>
                                <h2 className="heading-lg mb-6">Articles</h2>
                                <div className="space-y-6">
                                    {articles.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/post/${post.slug}`}
                                            className="block magazine-paper rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                                        >
                                            <div className="flex gap-6">
                                                {post.imageURL && (
                                                    <div className="relative w-48 h-32 flex-shrink-0">
                                                        <Image
                                                            src={post.imageURL}
                                                            alt={post.title}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h2 className="text-2xl font-serif font-semibold mb-2 hover:text-premium-accent transition-colors">
                                                        {post.title}
                                                    </h2>
                                                    <p className="text-muted mb-3 line-clamp-2">
                                                        {post.content.substring(0, 200)}...
                                                    </p>
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
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : query ? (
                    <div className="text-center py-16">
                        <svg className="w-20 h-20 text-premium-text-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="heading-lg mb-2">No results found</h3>
                        <p className="text-subtle">
                            Try different keywords or browse by category
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <svg className="w-20 h-20 text-premium-text-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="heading-lg mb-2">Start searching</h3>
                        <p className="text-subtle">
                            Enter keywords to find articles and authors
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SearchLoading() {
    return (
        <div className="min-h-screen bg-premium-bg py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <div className="shimmer h-12 w-48 rounded-lg mb-6"></div>
                    <div className="shimmer h-14 rounded-lg"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-32 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <PageWithSidebars>
            <Suspense fallback={<SearchLoading />}>
                <SearchContent />
            </Suspense>
        </PageWithSidebars>
    );
}
