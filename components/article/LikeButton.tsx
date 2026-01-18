'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toggleLike, hasUserLiked } from '@/lib/firebase/likes';
import toast from 'react-hot-toast';

interface LikeButtonProps {
    postId: string;
    initialLikeCount?: number;
    showCount?: boolean;
}

export default function LikeButton({ postId, initialLikeCount = 0, showCount = true }: LikeButtonProps) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);

    // Check if user has liked this post
    useEffect(() => {
        if (user) {
            checkLikeStatus();
        }
    }, [user, postId]);

    const checkLikeStatus = async () => {
        if (!user) return;
        const hasLiked = await hasUserLiked(postId, user.uid);
        setLiked(hasLiked);
    };

    const handleLike = async () => {
        if (!user) {
            toast.error('Please sign in to like articles');
            return;
        }

        if (loading) return;

        setLoading(true);
        setAnimating(true);

        try {
            const isLiked = await toggleLike(postId, user.uid);
            setLiked(isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);

            // Remove animation class after animation completes
            setTimeout(() => setAnimating(false), 300);
        } catch (error) {
            toast.error('Failed to update like');
            console.error('Error toggling like:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={loading}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                ${liked
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }
                ${animating ? 'scale-110' : 'scale-100'}
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
        >
            {/* Heart Icon */}
            <svg
                className={`w-6 h-6 transition-all duration-200 ${animating ? 'animate-bounce' : ''}`}
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={liked ? 0 : 2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>

            {/* Like Count */}
            {showCount && (
                <span className="font-medium">
                    {likeCount > 0 ? likeCount : ''}
                </span>
            )}
        </button>
    );
}
