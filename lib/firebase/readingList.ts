// Reading List functionality

import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Add article to reading list
 */
export async function addToReadingList(
    userId: string,
    postId: string
): Promise<void> {
    try {
        await updateDoc(doc(db, 'users', userId), {
            readingList: arrayUnion(postId),
        });
    } catch (error: any) {
        throw new Error(`Failed to add to reading list: ${error.message}`);
    }
}

/**
 * Remove article from reading list
 */
export async function removeFromReadingList(
    userId: string,
    postId: string
): Promise<void> {
    try {
        await updateDoc(doc(db, 'users', userId), {
            readingList: arrayRemove(postId),
        });
    } catch (error: any) {
        throw new Error(`Failed to remove from reading list: ${error.message}`);
    }
}

/**
 * Check if article is in reading list
 */
export async function isInReadingList(
    userId: string,
    postId: string
): Promise<boolean> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        if (!userData || !userData.readingList) {
            return false;
        }

        return userData.readingList.includes(postId);
    } catch (error) {
        console.error('Error checking reading list:', error);
        return false;
    }
}

/**
 * Get user's reading list
 */
export async function getReadingList(userId: string): Promise<string[]> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        return userData?.readingList || [];
    } catch (error) {
        console.error('Error getting reading list:', error);
        return [];
    }
}

/**
 * Get reading list count
 */
export async function getReadingListCount(userId: string): Promise<number> {
    try {
        const readingList = await getReadingList(userId);
        return readingList.length;
    } catch (error) {
        console.error('Error getting reading list count:', error);
        return 0;
    }
}
