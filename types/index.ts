import { Timestamp } from 'firebase/firestore';

export interface User {
    id?: string; // Firestore document ID
    uid: string;
    name: string; // Display name (firstName + lastName)
    firstName?: string;
    lastName?: string;
    username?: string; // Unique username for @username URLs
    email: string;
    emailVerified?: boolean;
    photoURL?: string | null;
    bio?: string;
    longBio?: string; // Extended bio for profile page

    // Demographics
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';

    // Location
    location?: string; // Legacy field (kept for backward compatibility)
    country?: string;
    state?: string;
    city?: string;

    // Social links
    website?: string;
    twitter?: string;
    linkedin?: string;
    medium?: string;
    pronouns?: string;
    timezone?: string;
    profileComplete: boolean;
    profileCompletionPercentage: number;
    totalArticles?: number;
    totalViews?: number;

    // Follow system
    followers?: string[];      // Array of user IDs who follow this user
    following?: string[];      // Array of user IDs this user follows
    followerCount?: number;
    followingCount?: number;

    // Reading list
    readingList?: string[];    // Array of post IDs saved to reading list

    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
}

export interface Post {
    id: string;
    title: string;
    byline: string;
    content: string;
    imageURL?: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    slug: string;
    category?: string;     // Article category (Technology, Philosophy, etc.)
    keywords?: string[];   // For search, not displayed
    tags?: string[];       // Public tags, displayed
    views?: number;        // View count
    likeCount?: number;    // Like count
    commentCount?: number; // Comment count
    bookmarkCount?: number;// Bookmark count
    status?: 'draft' | 'published'; // Publication status
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
}

export interface CreatePostData {
    title: string;
    content: string;
    imageURL?: string;
    category?: string;
    keywords?: string[];
    tags?: string[];
}

export interface UpdateProfileData {
    name?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
    longBio?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    location?: string;
    country?: string;
    state?: string;
    city?: string;
    website?: string;
    twitter?: string;
    linkedin?: string;
    medium?: string;
    pronouns?: string;
    timezone?: string;
    photoURL?: string | null;
}

// Article Engagement Types
export interface Like {
    id: string;           // userId_postId
    postId: string;
    userId: string;
    createdAt: Timestamp | Date;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorUsername: string;
    authorPhotoURL?: string;
    content: string;
    parentCommentId?: string; // For nested replies
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
    isEdited: boolean;
}

export interface Bookmark {
    id: string;           // userId_postId
    userId: string;
    postId: string;
    createdAt: Timestamp | Date;
}
