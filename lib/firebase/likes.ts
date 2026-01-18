import { db } from './config';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    increment,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { Like } from '@/types';

/**
 * Toggle like on a post
 * Returns true if liked, false if unliked
 */
export const toggleLike = async (postId: string, userId: string): Promise<boolean> => {
    const likeId = `${userId}_${postId}`;
    const likeRef = doc(db, 'likes', likeId);
    const postRef = doc(db, 'posts', postId);

    try {
        const likeDoc = await getDoc(likeRef);

        if (likeDoc.exists()) {
            // Unlike: Remove like and decrement count
            await deleteDoc(likeRef);
            await updateDoc(postRef, {
                likeCount: increment(-1)
            });
            return false;
        } else {
            // Like: Add like and increment count
            const newLike: Like = {
                id: likeId,
                postId,
                userId,
                createdAt: serverTimestamp() as any
            };
            await setDoc(likeRef, newLike);
            await updateDoc(postRef, {
                likeCount: increment(1)
            });
            return true;
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
};

/**
 * Check if user has liked a post
 */
export const hasUserLiked = async (postId: string, userId: string): Promise<boolean> => {
    const likeId = `${userId}_${postId}`;
    const likeRef = doc(db, 'likes', likeId);

    try {
        const likeDoc = await getDoc(likeRef);
        return likeDoc.exists();
    } catch (error) {
        console.error('Error checking like status:', error);
        return false;
    }
};

/**
 * Get like count for a post
 */
export const getLikeCount = async (postId: string): Promise<number> => {
    const postRef = doc(db, 'posts', postId);

    try {
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
            return postDoc.data().likeCount || 0;
        }
        return 0;
    } catch (error) {
        console.error('Error getting like count:', error);
        return 0;
    }
};

/**
 * Get all users who liked a post
 */
export const getPostLikes = async (postId: string): Promise<Like[]> => {
    try {
        const likesQuery = query(
            collection(db, 'likes'),
            where('postId', '==', postId)
        );
        const snapshot = await getDocs(likesQuery);
        return snapshot.docs.map(doc => doc.data() as Like);
    } catch (error) {
        console.error('Error getting post likes:', error);
        return [];
    }
};

/**
 * Get all posts liked by a user
 */
export const getUserLikes = async (userId: string): Promise<string[]> => {
    try {
        const likesQuery = query(
            collection(db, 'likes'),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(likesQuery);
        return snapshot.docs.map(doc => doc.data().postId);
    } catch (error) {
        console.error('Error getting user likes:', error);
        return [];
    }
};
