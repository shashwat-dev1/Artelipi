'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toggleBookmark, hasUserBookmarked } from '@/lib/firebase/bookmarks';
import toast from 'react-hot-toast';

interface BookmarkButtonProps {
    postId: string;
    showLabel?: boolean;
    compact?: boolean;
}

export default function BookmarkButton({ postId, showLabel = false, compact = false }: BookmarkButtonProps) {
    const { user } = useAuth();
    const [bookmarked, setBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if user has bookmarked this post
    useEffect(() => {
        if (user) {
            checkBookmarkStatus();
        }
    }, [user, postId]);

    const checkBookmarkStatus = async () => {
        if (!user) return;
        const hasBookmarked = await hasUserBookmarked(postId, user.uid);
        setBookmarked(hasBookmarked);
    };

    const handleBookmark = async () => {
        if (!user) {
            toast.error('Please sign in to bookmark articles');
            return;
        }

        if (loading) return;

        setLoading(true);

        try {
            const isBookmarked = await toggleBookmark(postId, user.uid);
            setBookmarked(isBookmarked);

            if (isBookmarked) {
                toast.success('Article saved to your reading list');
            } else {
                toast.success('Article removed from reading list');
            }
        } catch (error) {
            toast.error('Failed to update bookmark');
            console.error('Error toggling bookmark:', error);
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        return (
            <button
                onClick={handleBookmark}
                disabled={loading}
                className={`
                    p-2 rounded-lg transition-all duration-200
                    ${bookmarked
                        ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title={bookmarked ? 'Remove from reading list' : 'Save to reading list'}
            >
                {/* Bookmark Icon */}
                <svg
                    className="w-5 h-5"
                    fill={bookmarked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={bookmarked ? 0 : 2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                </svg>
            </button>
        );
    }

    return (
        <button
            onClick={handleBookmark}
            disabled={loading}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                ${bookmarked
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
        >
            {/* Bookmark Icon */}
            <svg
                className="w-6 h-6"
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={bookmarked ? 0 : 2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
            </svg>

            {/* Label */}
            {showLabel && (
                <span className="font-medium">
                    {bookmarked ? 'Saved' : 'Save'}
                </span>
            )}
        </button>
    );
}
