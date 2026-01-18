// Feed generation for homepage

import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './config';
import { Post } from '@/types';

/**
 * Get personalized feed for user (For You tab)
 * Includes articles from followed authors + recommended
 */
export async function getPersonalizedFeed(
    userId: string,
    followingIds: string[],
    limitCount: number = 20
): Promise<Post[]> {
    try {
        const posts: Post[] = [];

        // Get articles from followed authors
        if (followingIds.length > 0) {
            // Firestore 'in' query limited to 10 items, so batch if needed
            const batches = [];
            for (let i = 0; i < followingIds.length; i += 10) {
                const batch = followingIds.slice(i, i + 10);
                batches.push(batch);
            }

            for (const batch of batches) {
                const q = query(
                    collection(db, 'posts'),
                    where('authorId', 'in', batch),
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );
                const snapshot = await getDocs(q);
                snapshot.forEach((doc) => {
                    posts.push({ id: doc.id, ...doc.data() } as Post);
                });
            }
        }

        // If not enough posts, add recommended/recent posts
        if (posts.length < limitCount) {
            const remaining = limitCount - posts.length;
            const q = query(
                collection(db, 'posts'),
                orderBy('viewCount', 'desc'),
                limit(remaining)
            );
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => {
                // Don't add duplicates
                if (!posts.find(p => p.id === doc.id)) {
                    posts.push({ id: doc.id, ...doc.data() } as Post);
                }
            });
        }

        // Sort by date (newest first)
        posts.sort((a, b) => {
            const aDate = a.createdAt instanceof Date ? a.createdAt : a.createdAt?.toDate?.() || new Date();
            const bDate = b.createdAt instanceof Date ? b.createdAt : b.createdAt?.toDate?.() || new Date();
            return bDate.getTime() - aDate.getTime();
        });

        return posts.slice(0, limitCount);
    } catch (error) {
        console.error('Error getting personalized feed:', error);
        return [];
    }
}

/**
 * Get featured feed (Featured tab)
 * All recent + top-performing articles
 */
export async function getFeaturedFeed(limitCount: number = 20): Promise<Post[]> {
    try {
        const posts: Post[] = [];

        // Get recent articles
        const recentQuery = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const recentSnapshot = await getDocs(recentQuery);
        recentSnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() } as Post);
        });

        // Get top-performing articles
        const topQuery = query(
            collection(db, 'posts'),
            orderBy('viewCount', 'desc'),
            limit(10)
        );
        const topSnapshot = await getDocs(topQuery);
        topSnapshot.forEach((doc) => {
            // Don't add duplicates
            if (!posts.find(p => p.id === doc.id)) {
                posts.push({ id: doc.id, ...doc.data() } as Post);
            }
        });

        // Sort by engagement score (views + likes)
        posts.sort((a, b) => {
            const aScore = (a.viewCount || 0) + (a.likeCount || 0) * 2;
            const bScore = (b.viewCount || 0) + (b.likeCount || 0) * 2;
            return bScore - aScore;
        });

        return posts.slice(0, limitCount);
    } catch (error) {
        console.error('Error getting featured feed:', error);
        return [];
    }
}

/**
 * Get all articles (fallback)
 */
export async function getAllArticles(limitCount: number = 20): Promise<Post[]> {
    try {
        const q = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        const posts: Post[] = [];
        snapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() } as Post);
        });
        return posts;
    } catch (error) {
        console.error('Error getting all articles:', error);
        return [];
    }
}
