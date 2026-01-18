'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { addToReadingList, removeFromReadingList, isInReadingList } from '@/lib/firebase/readingList';
import toast from 'react-hot-toast';

interface ReadingListButtonProps {
    postId: string;
    postTitle: string;
    className?: string;
    showText?: boolean;
}

export default function ReadingListButton({
    postId,
    postTitle,
    className = '',
    showText = true
}: ReadingListButtonProps) {
    const { user } = useAuth();
    const [inList, setInList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkListStatus();
    }, [user, postId]);

    const checkListStatus = async () => {
        if (!user) {
            setChecking(false);
            return;
        }

        try {
            const status = await isInReadingList(user.uid, postId);
            setInList(status);
        } catch (error) {
            console.error('Error checking reading list:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleToggle = async () => {
        if (!user) {
            toast.error('Please sign in to save articles');
            return;
        }

        setLoading(true);
        try {
            if (inList) {
                await removeFromReadingList(user.uid, postId);
                setInList(false);
                toast.success('Removed from reading list');
            } else {
                await addToReadingList(user.uid, postId);
                setInList(true);
                toast.success('Added to reading list');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update reading list');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    if (checking) {
        return (
            <button className={`btn-outline text-sm ${className}`} disabled>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`btn-outline text-sm ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={inList ? 'Remove from reading list' : 'Add to reading list'}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                    <svg
                        className="w-5 h-5"
                        fill={inList ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                    </svg>
                    {showText && (
                        <span className="ml-2">
                            {inList ? 'Saved' : 'Save'}
                        </span>
                    )}
                </>
            )}
        </button>
    );
}
