'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { followUser, unfollowUser, isFollowing } from '@/lib/firebase/follow';
import toast from 'react-hot-toast';

interface FollowButtonProps {
    targetUserId: string;
    targetUserName: string;
    className?: string;
}

export default function FollowButton({ targetUserId, targetUserName, className = '' }: FollowButtonProps) {
    const { user, userData } = useAuth();
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkFollowStatus();
    }, [user, targetUserId]);

    const checkFollowStatus = async () => {
        if (!user) {
            setChecking(false);
            return;
        }

        try {
            const status = await isFollowing(user.uid, targetUserId);
            setFollowing(status);
        } catch (error) {
            console.error('Error checking follow status:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleFollow = async () => {
        if (!user || !userData) {
            toast.error('Please sign in to follow users');
            return;
        }

        setLoading(true);
        try {
            if (following) {
                await unfollowUser(user.uid, targetUserId);
                setFollowing(false);
                toast.success(`Unfollowed ${targetUserName}`);
            } else {
                await followUser(
                    user.uid,
                    targetUserId,
                    userData.name,
                    userData.photoURL || undefined
                );
                setFollowing(true);
                toast.success(`Following ${targetUserName}`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update follow status');
        } finally {
            setLoading(false);
        }
    };

    // Don't show button if user is viewing their own profile
    if (user?.uid === targetUserId) {
        return null;
    }

    if (checking) {
        return (
            <button className={`btn-outline ${className}`} disabled>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </button>
        );
    }

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`${following ? 'btn-outline' : 'btn-primary'} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : following ? (
                'Following'
            ) : (
                'Follow'
            )}
        </button>
    );
}
