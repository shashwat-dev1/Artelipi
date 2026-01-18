import { Timestamp } from 'firebase/firestore';

export type NotificationType =
    | 'new_article'    // Author you follow published a new article
    | 'like'           // Someone liked your article
    | 'comment'        // Someone commented on your article
    | 'follow'         // Someone followed you
    | 'bookmark';      // Someone bookmarked your article

export interface Notification {
    id: string;
    userId: string;           // User who receives this notification
    type: NotificationType;
    fromUserId: string;       // User who triggered the notification
    fromUserName: string;
    fromUserPhoto?: string;
    postId?: string;          // Related post (if applicable)
    postTitle?: string;
    postSlug?: string;
    message: string;
    read: boolean;
    createdAt: Timestamp | Date;
}

export interface NotificationPreferences {
    newArticles: boolean;     // Notify when followed authors publish
    likes: boolean;           // Notify when someone likes your article
    comments: boolean;        // Notify when someone comments
    follows: boolean;         // Notify when someone follows you
    bookmarks: boolean;       // Notify when someone bookmarks your article
    emailNotifications: boolean;
}
