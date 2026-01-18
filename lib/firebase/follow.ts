// Follow/Unfollow functionality

import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from './config';
import { createNotification } from './notifications';

/**
 * Follow a user
 */
export async function followUser(
    currentUserId: string,
    targetUserId: string,
    currentUserName: string,
    currentUserPhoto?: string
): Promise<void> {
    if (currentUserId === targetUserId) {
        throw new Error('You cannot follow yourself');
    }

    try {
        // Check if already following
        const alreadyFollowing = await isFollowing(currentUserId, targetUserId);
        if (alreadyFollowing) {
            throw new Error('Already following this user');
        }

        // Get current user data
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        const currentUserData = currentUserDoc.data();
        const currentFollowing = currentUserData?.following || [];
        const newFollowingCount = currentFollowing.length + 1;

        // Get target user data
        const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
        const targetUserData = targetUserDoc.data();
        const currentFollowers = targetUserData?.followers || [];
        const newFollowerCount = currentFollowers.length + 1;

        // Update current user's following list
        await updateDoc(doc(db, 'users', currentUserId), {
            following: arrayUnion(targetUserId),
            followingCount: newFollowingCount,
        });

        // Update target user's followers list
        await updateDoc(doc(db, 'users', targetUserId), {
            followers: arrayUnion(currentUserId),
            followerCount: newFollowerCount,
        });

        // Create notification for target user
        await createNotification({
            userId: targetUserId,
            type: 'follow',
            fromUserId: currentUserId,
            fromUserName: currentUserName,
            fromUserPhoto: currentUserPhoto,
            message: `${currentUserName} started following you`,
        });

    } catch (error: any) {
        throw new Error(`Failed to follow user: ${error.message}`);
    }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
    currentUserId: string,
    targetUserId: string
): Promise<void> {
    try {
        // Get current user data
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        const currentUserData = currentUserDoc.data();
        const currentFollowing = currentUserData?.following || [];
        const newFollowingCount = Math.max(0, currentFollowing.length - 1);

        // Get target user data
        const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
        const targetUserData = targetUserDoc.data();
        const currentFollowers = targetUserData?.followers || [];
        const newFollowerCount = Math.max(0, currentFollowers.length - 1);

        // Remove from current user's following list
        await updateDoc(doc(db, 'users', currentUserId), {
            following: arrayRemove(targetUserId),
            followingCount: newFollowingCount,
        });

        // Remove from target user's followers list
        await updateDoc(doc(db, 'users', targetUserId), {
            followers: arrayRemove(currentUserId),
            followerCount: newFollowerCount,
        });

    } catch (error: any) {
        throw new Error(`Failed to unfollow user: ${error.message}`);
    }
}

/**
 * Check if current user is following target user
 */
export async function isFollowing(
    currentUserId: string,
    targetUserId: string
): Promise<boolean> {
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUserId));
        const userData = userDoc.data();

        if (!userData || !userData.following) {
            return false;
        }

        return userData.following.includes(targetUserId);
    } catch (error) {
        console.error('Error checking follow status:', error);
        return false;
    }
}

/**
 * Get user's followers
 */
export async function getFollowers(userId: string): Promise<string[]> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        return userData?.followers || [];
    } catch (error) {
        console.error('Error getting followers:', error);
        return [];
    }
}

/**
 * Get user's following
 */
export async function getFollowing(userId: string): Promise<string[]> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        return userData?.following || [];
    } catch (error) {
        console.error('Error getting following:', error);
        return [];
    }
}
