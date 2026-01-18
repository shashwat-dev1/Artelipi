import { Timestamp } from 'firebase/firestore';

export interface UserAnalytics {
    userId: string;

    // Overall stats
    totalViews: number;
    totalLikes: number;
    totalBookmarks: number;
    totalComments: number;
    totalArticles: number;
    totalFollowers: number;
    totalFollowing: number;

    // Time-based stats
    viewsThisWeek: number;
    viewsThisMonth: number;
    likesThisWeek: number;
    likesThisMonth: number;

    // Article performance
    topArticles: ArticleStats[];

    // Growth
    followerGrowth: GrowthData[];
    viewGrowth: GrowthData[];

    lastUpdated: Timestamp | Date;
}

export interface ArticleStats {
    postId: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
    bookmarks: number;
    comments: number;
    readTime: number;
    publishedAt: Timestamp | Date;
}

export interface GrowthData {
    date: string;        // YYYY-MM-DD
    value: number;
}

export interface DailyAnalytics {
    userId: string;
    date: string;        // YYYY-MM-DD
    views: number;
    likes: number;
    bookmarks: number;
    newFollowers: number;
    articlesPublished: number;
    createdAt: Timestamp | Date;
}
