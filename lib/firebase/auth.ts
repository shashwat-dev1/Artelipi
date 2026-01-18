import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/types';
import { generateUsername, isUsernameAvailable } from './username';

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        const { sendEmailVerification } = await import('firebase/auth');
        await sendEmailVerification(user);

        // Create minimal user document in Firestore
        // User will complete profile after email verification
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            emailVerified: false,
            name: '',
            firstName: '',
            lastName: '',
            username: '',
            photoURL: null,
            bio: '',
            longBio: '',
            gender: '',
            location: '',
            country: '',
            state: '',
            city: '',
            website: '',
            twitter: '',
            linkedin: '',
            github: '',
            pronouns: '',
            timezone: '',
            profileComplete: false,
            profileCompletionPercentage: 0,
            totalArticles: 0,
            totalViews: 0,
            // Follow system
            followers: [],
            following: [],
            followerCount: 0,
            followingCount: 0,
            // Reading list
            readingList: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return user;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user document exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        // If user doesn't exist, create user document with minimal data
        // User will complete profile in /complete-profile
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                name: '',
                firstName: '',
                lastName: '',
                username: '',
                photoURL: user.photoURL,
                bio: '',
                longBio: '',
                gender: '',
                location: '',
                country: '',
                state: '',
                city: '',
                website: '',
                twitter: '',
                linkedin: '',
                github: '',
                pronouns: '',
                timezone: '',
                profileComplete: false,
                profileCompletionPercentage: user.photoURL ? 15 : 0, // Photo adds 15%
                totalArticles: 0,
                totalViews: 0,
                // Follow system
                followers: [],
                following: [],
                followerCount: 0,
                followingCount: 0,
                // Reading list
                readingList: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        return user;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/**
 * Sign out
 */
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/**
 * Get current user data from Firestore
 */
export const getUserData = async (uid: string): Promise<User | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data() as User;
        }
        return null;
    } catch (error: any) {
        console.error('Error getting user data:', error);
        return null;
    }
};

/**
 * Auth state observer
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
