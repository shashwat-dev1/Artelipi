// Analytics and user statistics

import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { UserAnalytics, ArticleStats } from '@/types/analytics';
import { Post, User } from '@/types';

/**
 * Get user analytics
 */
export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    try {
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data() as User;

        if (!userData) {
            return null;
        }

        // Get user's articles
        const articlesQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', userId),
            where('status', '==', 'published')
        );
        const articlesSnapshot = await getDocs(articlesQuery);

        const articles: Post[] = [];
        articlesSnapshot.forEach((doc) => {
            articles.push({ id: doc.id, ...doc.data() } as Post);
        });

        // Calculate totals
        const totalViews = articles.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalLikes = articles.reduce((sum, post) => sum + (post.likeCount || 0), 0);
        const totalBookmarks = articles.reduce((sum, post) => sum + (post.bookmarkCount || 0), 0);
        const totalComments = articles.reduce((sum, post) => sum + (post.commentCount || 0), 0);

        // Get top articles
        const topArticles: ArticleStats[] = articles
            .map((post) => ({
                postId: post.id,
                title: post.title,
                slug: post.slug,
                views: post.views || 0,
                likes: post.likeCount || 0,
                bookmarks: post.bookmarkCount || 0,
                comments: post.commentCount || 0,
                readTime: Math.ceil(post.content.length / 1000),
                publishedAt: post.createdAt,
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        // Calculate time-based stats (last 7 and 30 days)
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const recentArticles = articles.filter((post) => {
            const postDate = post.createdAt instanceof Date ? post.createdAt : post.createdAt.toDate();
            return postDate >= monthAgo;
        });

        const viewsThisWeek = recentArticles
            .filter((post) => {
                const postDate = post.createdAt instanceof Date ? post.createdAt : post.createdAt.toDate();
                return postDate >= weekAgo;
            })
            .reduce((sum, post) => sum + (post.views || 0), 0);

        const viewsThisMonth = recentArticles.reduce((sum, post) => sum + (post.views || 0), 0);

        const likesThisWeek = recentArticles
            .filter((post) => {
                const postDate = post.createdAt instanceof Date ? post.createdAt : post.createdAt.toDate();
                return postDate >= weekAgo;
            })
            .reduce((sum, post) => sum + (post.likeCount || 0), 0);

        const likesThisMonth = recentArticles.reduce((sum, post) => sum + (post.likeCount || 0), 0);

        // Build analytics object
        const analytics: UserAnalytics = {
            userId,
            totalViews,
            totalLikes,
            totalBookmarks,
            totalComments,
            totalArticles: articles.length,
            totalFollowers: userData.followerCount || 0,
            totalFollowing: userData.followingCount || 0,
            viewsThisWeek,
            viewsThisMonth,
            likesThisWeek,
            likesThisMonth,
            topArticles,
            followerGrowth: [],
            viewGrowth: [],
            lastUpdated: new Date(),
        };

        return analytics;
    } catch (error) {
        console.error('Error getting user analytics:', error);
        return null;
    }
}

/**
 * Get article statistics
 */
export async function getArticleStats(postId: string): Promise<ArticleStats | null> {
    try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        const post = postDoc.data() as Post;

        if (!post) {
            return null;
        }

        return {
            postId,
            title: post.title,
            slug: post.slug,
            views: post.views || 0,
            likes: post.likeCount || 0,
            bookmarks: post.bookmarkCount || 0,
            comments: post.commentCount || 0,
            readTime: Math.ceil(post.content.length / 1000),
            publishedAt: post.createdAt,
        };
    } catch (error) {
        console.error('Error getting article stats:', error);
        return null;
    }
}

/**
 * Get reading stats for user
 */
export async function getReadingStats(userId: string) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data() as User;

        if (!userData) {
            return null;
        }

        const readingListCount = userData.readingList?.length || 0;
        const followingCount = userData.followingCount || 0;

        return {
            readingListCount,
            followingCount,
            articlesRead: 0, // TODO: Track reading history
            timeSpentReading: 0, // TODO: Track reading time
        };
    } catch (error) {
        console.error('Error getting reading stats:', error);
        return null;
    }
}
