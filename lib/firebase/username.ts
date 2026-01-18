import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

/**
 * Generate username from name
 */
export const generateUsername = (name: string): string => {
    // Remove special characters, convert to lowercase, replace spaces with hyphens
    const baseUsername = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.floor(Math.random() * 9999);
    return `${baseUsername}-${randomSuffix}`;
};

/**
 * Check if username is available
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, 'users'),
            where('username', '==', username.toLowerCase())
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    } catch (error) {
        console.error('Error checking username:', error);
        return false;
    }
};

/**
 * Validate username format
 */
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
    // Must be 3-30 characters
    if (username.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (username.length > 30) {
        return { valid: false, error: 'Username must be less than 30 characters' };
    }

    // Only alphanumeric, hyphens, and underscores
    if (!/^[a-z0-9_-]+$/.test(username)) {
        return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }

    // Cannot start or end with hyphen/underscore
    if (/^[-_]|[-_]$/.test(username)) {
        return { valid: false, error: 'Username cannot start or end with a hyphen or underscore' };
    }

    // Reserved usernames - all app routes and common pages
    const reserved = [
        // App routes
        'admin', 'api', 'settings', 'profile', 'login', 'signup', 'write',
        'search', 'about', 'contact', 'privacy', 'terms', 'post', 'posts',

        // Common pages
        'help', 'support', 'faq', 'blog', 'news', 'home', 'index',

        // Account/Auth related
        'account', 'user', 'users', 'auth', 'signin', 'signout', 'register',
        'logout', 'password', 'reset', 'verify', 'confirm',

        // Platform/System
        'app', 'www', 'mail', 'email', 'static', 'assets', 'cdn', 'img',
        'images', 'uploads', 'files', 'download', 'downloads',

        // Legal/Policy
        'legal', 'tos', 'dmca', 'copyright', 'trademark',

        // Social/Community
        'community', 'forum', 'discuss', 'feedback', 'report',

        // Reserved for future features
        'explore', 'trending', 'popular', 'latest', 'featured',
        'categories', 'tags', 'topics', 'authors',

        // Common usernames to avoid confusion
        'artelipi', 'official', 'staff', 'team', 'support',
        'moderator', 'mod', 'administrator',

        // Technical
        'root', 'system', 'null', 'undefined', 'test', 'demo',
    ];

    if (reserved.includes(username.toLowerCase())) {
        return { valid: false, error: 'This username is reserved' };
    }

    return { valid: true };
};

/**
 * Suggest available usernames
 */
export const suggestUsernames = async (baseName: string): Promise<string[]> => {
    const suggestions: string[] = [];
    const base = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20);

    // Try base username
    if (await isUsernameAvailable(base)) {
        suggestions.push(base);
    }

    // Try with numbers
    for (let i = 1; i <= 99; i++) {
        const username = `${base}${i}`;
        if (await isUsernameAvailable(username)) {
            suggestions.push(username);
            if (suggestions.length >= 5) break;
        }
    }

    // Try with random words
    const words = ['writes', 'creates', 'author', 'writer', 'blog'];
    for (const word of words) {
        const username = `${base}_${word}`;
        if (await isUsernameAvailable(username)) {
            suggestions.push(username);
            if (suggestions.length >= 5) break;
        }
    }

    return suggestions.slice(0, 5);
};

/**
 * Get user by username
 */
export const getUserByUsername = async (username: string): Promise<any | null> => {
    try {
        const q = query(
            collection(db, 'users'),
            where('username', '==', username.toLowerCase())
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            uid: doc.id,
            ...doc.data(),
        };
    } catch (error) {
        console.error('Error getting user by username:', error);
        return null;
    }
};
