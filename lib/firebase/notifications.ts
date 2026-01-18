// Notification system

import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { Notification, NotificationType } from '@/types/notifications';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    fromUserId: string;
    fromUserName: string;
    fromUserPhoto?: string;
    postId?: string;
    postTitle?: string;
    postSlug?: string;
    message: string;
}

/**
 * Create a new notification
 */
export async function createNotification(params: CreateNotificationParams): Promise<string> {
    try {
        const notificationData = {
            userId: params.userId,
            type: params.type,
            fromUserId: params.fromUserId,
            fromUserName: params.fromUserName,
            fromUserPhoto: params.fromUserPhoto || null,
            postId: params.postId || null,
            postTitle: params.postTitle || null,
            postSlug: params.postSlug || null,
            message: params.message,
            read: false,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'notifications'), notificationData);
        return docRef.id;
    } catch (error: any) {
        throw new Error(`Failed to create notification: ${error.message}`);
    }
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(
    userId: string,
    limit: number = 20
): Promise<Notification[]> {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            firestoreLimit(limit)
        );

        const querySnapshot = await getDocs(q);
        const notifications: Notification[] = [];

        querySnapshot.forEach((doc) => {
            notifications.push({
                id: doc.id,
                ...doc.data(),
            } as Notification);
        });

        return notifications;
    } catch (error) {
        console.error('Error getting notifications:', error);
        return [];
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'notifications', notificationId), {
            read: true,
        });
    } catch (error: any) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string): Promise<void> {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const querySnapshot = await getDocs(q);

        const updatePromises = querySnapshot.docs.map((doc) =>
            updateDoc(doc.ref, { read: true })
        );

        await Promise.all(updatePromises);
    } catch (error: any) {
        throw new Error(`Failed to mark all as read: ${error.message}`);
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'notifications', notificationId), {
            deleted: true,
        });
    } catch (error: any) {
        throw new Error(`Failed to delete notification: ${error.message}`);
    }
}
