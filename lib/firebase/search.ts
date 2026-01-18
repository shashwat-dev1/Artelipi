// Enhanced search utilities for articles and authors

import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from './config';
import { Post, User } from '@/types';

export interface SearchResults {
    authors: User[];
    articles: Post[];
}

/**
 * Search for both authors and articles
 */
export async function searchAll(
    searchQuery: string,
    limit: number = 20
): Promise<SearchResults> {
    try {
        const searchLower = searchQuery.toLowerCase().trim();

        if (!searchLower) {
            return { authors: [], articles: [] };
        }

        // Search users (authors)
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const allUsers: User[] = [];

        usersSnapshot.forEach((doc) => {
            const data = doc.data();
            allUsers.push({
                uid: doc.id,
                ...data,
            } as User);
        });

        // Filter authors by name or username
        const matchingAuthors = allUsers.filter((user) => {
            const nameMatch = user.name?.toLowerCase().includes(searchLower);
            const usernameMatch = user.username?.toLowerCase().includes(searchLower);
            return nameMatch || usernameMatch;
        });

        // Search articles
        const postsQuery = query(collection(db, 'posts'));
        const postsSnapshot = await getDocs(postsQuery);
        const allPosts: Post[] = [];

        postsSnapshot.forEach((doc) => {
            const data = doc.data();
            allPosts.push({
                id: doc.id,
                ...data,
            } as Post);
        });

        // Filter articles
        const matchingArticles = allPosts.filter((post) => {
            const titleMatch = post.title?.toLowerCase().includes(searchLower);
            const contentMatch = post.content?.toLowerCase().includes(searchLower);
            const authorMatch = post.authorName?.toLowerCase().includes(searchLower);
            const keywordsMatch = post.keywords?.some(k =>
                k.toLowerCase().includes(searchLower)
            );
            const categoryMatch = post.category?.toLowerCase().includes(searchLower);

            return titleMatch || contentMatch || authorMatch || keywordsMatch || categoryMatch;
        });

        // Sort articles by creation date
        matchingArticles.sort((a, b) => {
            const aDate = a.createdAt instanceof Date ? a.createdAt :
                a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
            const bDate = b.createdAt instanceof Date ? b.createdAt :
                b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
            return bDate.getTime() - aDate.getTime();
        });

        return {
            authors: matchingAuthors.slice(0, 5), // Top 5 authors
            articles: matchingArticles.slice(0, limit),
        };
    } catch (error) {
        console.error('Error searching:', error);
        return { authors: [], articles: [] };
    }
}

/**
 * Search articles only (backward compatibility)
 */
export async function searchArticles(
    searchQuery: string,
    limit: number = 20
): Promise<Post[]> {
    const results = await searchAll(searchQuery, limit);
    return results.articles;
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
    category: string,
    limit: number = 20
): Promise<Post[]> {
    try {
        const q = query(
            collection(db, 'posts'),
            where('category', '==', category)
        );

        const querySnapshot = await getDocs(q);
        const posts: Post[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            posts.push({
                id: doc.id,
                ...data,
            } as Post);
        });

        // Sort by creation date (newest first)
        posts.sort((a, b) => {
            const aDate = a.createdAt instanceof Date ? a.createdAt :
                a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
            const bDate = b.createdAt instanceof Date ? b.createdAt :
                b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
            return bDate.getTime() - aDate.getTime();
        });

        return posts.slice(0, limit);
    } catch (error) {
        console.error('Error getting articles by category:', error);
        return [];
    }
}

/**
 * Get articles by author
 */
export async function getArticlesByAuthor(
    authorId: string,
    limit: number = 20
): Promise<Post[]> {
    try {
        const q = query(
            collection(db, 'posts'),
            where('authorId', '==', authorId)
        );

        const querySnapshot = await getDocs(q);
        const posts: Post[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            posts.push({
                id: doc.id,
                ...data,
            } as Post);
        });

        // Sort by creation date (newest first)
        posts.sort((a, b) => {
            const aDate = a.createdAt instanceof Date ? a.createdAt :
                a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
            const bDate = b.createdAt instanceof Date ? b.createdAt :
                b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
            return bDate.getTime() - aDate.getTime();
        });

        return posts.slice(0, limit);
    } catch (error) {
        console.error('Error getting articles by author:', error);
        return [];
    }
}
