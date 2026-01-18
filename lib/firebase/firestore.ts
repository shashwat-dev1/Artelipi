import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Post, CreatePostData, User, UpdateProfileData } from '@/types';
import slugify from 'slugify';

/**
 * Generate unique slug from title
 */
const generateSlug = (title: string): string => {
    const baseSlug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'\"!:@]/g,
    });
    const timestamp = Date.now();
    return `${baseSlug}-${timestamp}`;
};

/**
 * Upload image to Vercel Blob Storage via API route
 */
export const uploadImage = async (file: File, postId: string): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('postId', postId);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload image');
        }

        const data = await response.json();
        return data.url;
    } catch (error: any) {
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

/**
 * Create a new post
 */
export const createPost = async (
    postData: CreatePostData,
    authorId: string,
    authorName: string,
    authorPhotoURL?: string
): Promise<string> => {
    try {
        const slug = generateSlug(postData.title);
        const byline = `By ${authorName}`;

        const docRef = await addDoc(collection(db, 'posts'), {
            title: postData.title,
            byline,
            content: postData.content,
            imageURL: postData.imageURL || null,
            category: postData.category || null,
            keywords: postData.keywords || [],
            tags: postData.tags || [],
            authorId,
            authorName,
            authorPhotoURL: authorPhotoURL || null,
            slug,
            status: 'published',
            likeCount: 0,
            viewCount: 0,
            commentCount: 0,
            bookmarkCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error: any) {
        throw new Error(`Failed to create post: ${error.message}`);
    }
};

/**
 * Get post by slug
 */
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
    try {
        const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
        } as Post;
    } catch (error: any) {
        console.error('Error getting post:', error);
        return null;
    }
};

/**
 * Get post by ID
 */
export const getPostById = async (id: string): Promise<Post | null> => {
    try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            } as Post;
        }

        return null;
    } catch (error: any) {
        console.error('Error getting post:', error);
        return null;
    }
};

/**
 * Get all posts (latest first)
 */
export const getAllPosts = async (limitCount: number = 20): Promise<Post[]> => {
    try {
        const q = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Post[];
    } catch (error: any) {
        console.error('Error getting posts:', error);
        return [];
    }
};

/**
 * Get posts by author
 */
export const getPostsByAuthor = async (authorId: string): Promise<Post[]> => {
    try {
        const q = query(
            collection(db, 'posts'),
            where('authorId', '==', authorId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Post[];
    } catch (error: any) {
        console.error('Error getting posts by author:', error);
        return [];
    }
};

/**
 * Search posts by query (title, content, keywords)
 */
export const searchPosts = async (searchQuery: string): Promise<Post[]> => {
    try {
        const allPosts = await getAllPosts(100);
        const query = searchQuery.toLowerCase();

        return allPosts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(query);
            const contentMatch = post.content.toLowerCase().includes(query);
            const keywordsMatch = post.keywords?.some(keyword =>
                keyword.toLowerCase().includes(query)
            );
            const tagsMatch = post.tags?.some(tag =>
                tag.toLowerCase().includes(query)
            );

            return titleMatch || contentMatch || keywordsMatch || tagsMatch;
        });
    } catch (error: any) {
        console.error('Error searching posts:', error);
        return [];
    }
};

/**
 * Update post
 */
export const updatePost = async (
    postId: string,
    updates: Partial<CreatePostData>
): Promise<void> => {
    try {
        const docRef = doc(db, 'posts', postId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error: any) {
        throw new Error(`Failed to update post: ${error.message}`);
    }
};

/**
 * Delete post
 */
export const deletePost = async (postId: string, imageURL?: string): Promise<void> => {
    try {
        // Delete image from Vercel Blob if exists
        if (imageURL) {
            try {
                await fetch('/api/upload', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: imageURL }),
                });
            } catch (error) {
                console.error('Error deleting image:', error);
                // Don't throw - continue with post deletion
            }
        }

        // Delete post document
        await deleteDoc(doc(db, 'posts', postId));
    } catch (error: any) {
        throw new Error(`Failed to delete post: ${error.message}`);
    }
};

/**
 * Calculate reading time (words per minute = 200)
 */
export const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

// ==================== USER PROFILE FUNCTIONS ====================

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data() as User;
        }
        return null;
    } catch (error: any) {
        console.error('Error getting user:', error);
        return null;
    }
};

/**
 * Calculate profile completion percentage
 */
export const calculateProfileCompletion = (user: Partial<User>): number => {
    let completion = 0;

    // Required fields - 25%
    if (user.firstName && user.lastName && user.email && user.username) completion += 25;

    // Photo - 15%
    if (user.photoURL) completion += 15;

    // Gender - 5%
    if (user.gender) completion += 5;

    // Location - 10%
    if (user.country) completion += 10;

    // Short Bio - 15%
    if (user.bio && user.bio.length >= 20) completion += 15;

    // Long Bio - 10%
    if (user.longBio && user.longBio.length >= 50) completion += 10;

    // Social links - 20% total
    if (user.website) completion += 8;
    if (user.twitter) completion += 4;
    if (user.linkedin) completion += 4;
    if (user.medium) completion += 4;

    return Math.min(Math.round(completion), 100);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
    userId: string,
    profileData: UpdateProfileData
): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);

        // Get current user data to calculate completion
        const userDoc = await getDoc(userRef);
        const currentData = userDoc.data();

        // Merge updates with current data
        const updatedData = { ...currentData, ...profileData };

        // Calculate new completion percentage
        const completionPercentage = calculateProfileCompletion(updatedData);
        const profileComplete = completionPercentage === 100;

        await updateDoc(userRef, {
            ...profileData,
            profileComplete,
            profileCompletionPercentage: completionPercentage,
            updatedAt: serverTimestamp(),
        });
    } catch (error: any) {
        throw new Error(`Failed to update profile: ${error.message}`);
    }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file: File, userId: string): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('postId', `profile-${userId}`);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload image');
        }

        const data = await response.json();
        return data.url;
    } catch (error: any) {
        throw new Error(`Failed to upload profile picture: ${error.message}`);
    }
};
