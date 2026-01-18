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
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { Bookmark, Post } from '@/types';

/**
 * Toggle bookmark on a post
 * Returns true if bookmarked, false if unbookmarked
 */
export const toggleBookmark = async (postId: string, userId: string): Promise<boolean> => {
    const bookmarkId = `${userId}_${postId}`;
    const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
    const postRef = doc(db, 'posts', postId);

    try {
        const bookmarkDoc = await getDoc(bookmarkRef);

        if (bookmarkDoc.exists()) {
            // Remove bookmark and decrement count
            await deleteDoc(bookmarkRef);
            await updateDoc(postRef, {
                bookmarkCount: increment(-1)
            });
            return false;
        } else {
            // Add bookmark and increment count
            const newBookmark: Bookmark = {
                id: bookmarkId,
                postId,
                userId,
                createdAt: serverTimestamp() as any
            };
            await setDoc(bookmarkRef, newBookmark);
            await updateDoc(postRef, {
                bookmarkCount: increment(1)
            });
            return true;
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        throw error;
    }
};

/**
 * Check if user has bookmarked a post
 */
export const hasUserBookmarked = async (postId: string, userId: string): Promise<boolean> => {
    const bookmarkId = `${userId}_${postId}`;
    const bookmarkRef = doc(db, 'bookmarks', bookmarkId);

    try {
        const bookmarkDoc = await getDoc(bookmarkRef);
        return bookmarkDoc.exists();
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        return false;
    }
};

/**
 * Get all bookmarked post IDs for a user
 */
export const getUserBookmarks = async (userId: string): Promise<string[]> => {
    try {
        const bookmarksQuery = query(
            collection(db, 'bookmarks'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(bookmarksQuery);
        return snapshot.docs.map(doc => doc.data().postId);
    } catch (error) {
        console.error('Error getting user bookmarks:', error);
        return [];
    }
};

/**
 * Get all bookmarked posts for a user (with full post data)
 */
export const getUserBookmarkedPosts = async (userId: string): Promise<Post[]> => {
    try {
        const postIds = await getUserBookmarks(userId);

        if (postIds.length === 0) {
            return [];
        }

        // Fetch all posts
        const posts: Post[] = [];
        for (const postId of postIds) {
            const postRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postRef);
            if (postDoc.exists()) {
                posts.push({ id: postDoc.id, ...postDoc.data() } as Post);
            }
        }

        return posts;
    } catch (error) {
        console.error('Error getting bookmarked posts:', error);
        return [];
    }
};

/**
 * Get bookmark count for a post
 */
export const getBookmarkCount = async (postId: string): Promise<number> => {
    const postRef = doc(db, 'posts', postId);

    try {
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
            return postDoc.data().bookmarkCount || 0;
        }
        return 0;
    } catch (error) {
        console.error('Error getting bookmark count:', error);
        return 0;
    }
};
