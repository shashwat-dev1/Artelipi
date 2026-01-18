'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUserByUsername } from '@/lib/firebase/username';
import { getFollowers } from '@/lib/firebase/follow';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import FollowButton from '@/components/user/FollowButton';

export default function FollowersPage() {
    const params = useParams();
    const username = params.username as string;

    const [user, setUser] = useState<User | null>(null);
    const [followers, setFollowers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFollowers();
    }, [username]);

    const loadFollowers = async () => {
        setLoading(true);
        try {
            // Get the profile user
            const profileUser = await getUserByUsername(username);
            if (!profileUser) {
                setLoading(false);
                return;
            }
            setUser(profileUser);

            // Get follower IDs
            const followerIds = await getFollowers(profileUser.uid);

            // Fetch each follower's data
            const followerPromises = followerIds.map(async (followerId) => {
                const userDoc = await getDoc(doc(db, 'users', followerId));
                if (userDoc.exists()) {
                    return { uid: userDoc.id, ...userDoc.data() } as unknown as User;
                }
                return null;
            });

            const followerUsers = await Promise.all(followerPromises);
            const validFollowers = followerUsers.filter((u): u is User => u !== null);
            setFollowers(validFollowers);
        } catch (error) {
            console.error('Error loading followers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-premium-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted">Loading followers...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-muted">User not found</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={`/${username}`}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to profile
                        </Link>
                        <h1 className="text-3xl font-bold">Followers</h1>
                        <p className="text-gray-600 mt-1">{followers.length} follower{followers.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Followers List */}
                    {followers.length > 0 ? (
                        <div className="space-y-4">
                            {followers.map((follower) => (
                                <div
                                    key={follower.uid}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <Link href={`/${follower.username}`} className="flex items-center gap-4 flex-1">
                                            {follower.photoURL ? (
                                                <Image
                                                    src={follower.photoURL}
                                                    alt={follower.name}
                                                    width={56}
                                                    height={56}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                                                    {follower.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg hover:text-premium-accent transition-colors">
                                                    {follower.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm">@{follower.username}</p>
                                                {follower.bio && (
                                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{follower.bio}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                    <span>{follower.followerCount || 0} followers</span>
                                                    <span>·</span>
                                                    <span>{follower.totalArticles || 0} articles</span>
                                                </div>
                                            </div>
                                        </Link>
                                        <FollowButton
                                            targetUserId={follower.uid}
                                            targetUserName={follower.name}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border border-gray-200 rounded-lg">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No followers yet</h3>
                            <p className="text-gray-500">When people follow {user.name}, they'll appear here</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
