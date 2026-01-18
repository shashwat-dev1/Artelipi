'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { calculateReadingTime, deletePost } from '@/lib/firebase/firestore';
import { useAuth } from '@/components/auth/AuthProvider';
import LikeButton from '@/components/article/LikeButton';
import BookmarkButton from '@/components/article/BookmarkButton';
import FollowButton from '@/components/user/FollowButton';
import ReadingListButton from '@/components/user/ReadingListButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

interface ArticleContentProps {
    post: Post;
}

export default function ArticleContent({ post }: ArticleContentProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        // Set URL on client side only
        setCurrentUrl(window.location.href);
    }, []);

    const readingTime = calculateReadingTime(post.content);

    // Handle both Date and Timestamp types
    const createdAt = post.createdAt instanceof Date
        ? post.createdAt
        : post.createdAt?.toDate?.() || new Date();

    const formattedDate = createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const isAuthor = user?.uid === post.authorId;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);

        try {
            await deletePost(post.id, post.imageURL);
            toast.success('Article deleted successfully');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete article');
            setDeleting(false);
        }
    };

    return (
        <article className="min-h-screen bg-white">
            {/* Hero Image */}
            {post.imageURL && (
                <div className="relative w-full h-[400px] md:h-[500px] mb-12">
                    <Image
                        src={post.imageURL}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* Article Container */}
            <div className="max-w-article mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {/* Header */}
                <header className={post.imageURL ? '' : 'pt-12'}>
                    <h1 className="article-content text-5xl md:text-6xl font-black mb-4 leading-tight">
                        {post.title}
                    </h1>

                    {/* Byline & Meta */}
                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            {post.authorPhotoURL ? (
                                <Image
                                    src={post.authorPhotoURL}
                                    alt={post.authorName}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                                    {post.authorName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-900">{post.byline}</p>
                                <p className="text-sm text-gray-500">
                                    {formattedDate} · {readingTime} min read
                                </p>
                            </div>
                        </div>
                        <FollowButton
                            targetUserId={post.authorId}
                            targetUserName={post.authorName}
                        />
                    </div>
                </header>

                {/* Article Content */}
                <div className="article-content prose prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Engagement Actions */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                        <LikeButton
                            postId={post.id}
                            initialLikeCount={post.likeCount || 0}
                        />
                        <BookmarkButton
                            postId={post.id}
                            showLabel={true}
                        />
                        <ReadingListButton
                            postId={post.id}
                            postTitle={post.title}
                            showText={true}
                        />
                    </div>
                </div>

                {/* Author Actions */}
                {isAuthor && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex gap-4">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? 'Deleting...' : 'Delete Article'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Share this article</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(currentUrl);
                                toast.success('Link copied to clipboard!');
                            }}
                            className="btn-outline text-sm px-4 py-2"
                        >
                            Copy Link
                        </button>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(currentUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline text-sm px-4 py-2"
                        >
                            Share on Twitter
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
}
