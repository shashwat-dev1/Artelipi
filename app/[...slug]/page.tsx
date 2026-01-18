import { notFound, redirect } from 'next/navigation';
import { getUserByUsername } from '@/lib/firebase/username';
import { getPostsByAuthor } from '@/lib/firebase/firestore';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompletionRing from '@/components/profile/CompletionRing';
import ArticleCard from '@/components/article/ArticleCard';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    // Check if this is a username route
    if (!slug || !slug[0]) {
        return { title: 'Page Not Found' };
    }

    const firstSegment = decodeURIComponent(slug[0]);
    let username: string;

    if (firstSegment.startsWith('@')) {
        username = firstSegment.substring(1);
    } else {
        username = firstSegment;
    }

    const user = await getUserByUsername(username);

    if (!user) {
        return { title: 'User Not Found' };
    }

    return {
        title: `${user.name} (@${user.username}) | Artelipi`,
        description: user.bio || `Read articles by ${user.name} on Artelipi`,
        openGraph: {
            title: `${user.name} (@${user.username})`,
            description: user.bio || `Read articles by ${user.name} on Artelipi`,
            images: user.photoURL ? [user.photoURL] : [],
        },
    };
}

export const revalidate = 60;

export default async function CatchAllPage({ params }: PageProps) {
    const { slug } = await params;

    // Check if this is a username route (starts with @)
    if (!slug || slug.length === 0) {
        notFound();
    }

    const firstSegment = decodeURIComponent(slug[0]);

    // Check if it starts with @ or if it's just a username
    let username: string;

    if (firstSegment.startsWith('@')) {
        // Remove @ symbol
        username = firstSegment.substring(1);
    } else {
        // Treat as username (for /username format)
        username = firstSegment;
    }

    if (!username) {
        notFound();
    }

    const user = await getUserByUsername(username);

    if (!user) {
        notFound();
    }

    // Get user's articles
    const articles = await getPostsByAuthor(user.uid);

    // Format member since date
    const memberSince = user.createdAt instanceof Date
        ? user.createdAt
        : user.createdAt?.toDate?.() || new Date();

    const formattedDate = memberSince.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const showCompletionRing = user.profileCompletionPercentage < 100;

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white">
                {/* Profile Header */}
                <div className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar with Completion Ring */}
                            <div className="relative flex-shrink-0">
                                {showCompletionRing ? (
                                    <div className="relative">
                                        <CompletionRing
                                            percentage={user.profileCompletionPercentage}
                                            size={140}
                                            strokeWidth={6}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {user.photoURL ? (
                                                <Image
                                                    src={user.photoURL}
                                                    alt={user.name}
                                                    width={120}
                                                    height={120}
                                                    className="rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.name}
                                            width={140}
                                            height={140}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-[140px] h-[140px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                                <p className="text-gray-600 mb-1">@{user.username}</p>
                                <p className="text-sm text-gray-500 mb-4">Author at Artelipi</p>

                                {user.bio && (
                                    <p className="text-lg text-gray-700 mb-6 max-w-2xl">
                                        {user.bio}
                                    </p>
                                )}

                                {user.longBio && (
                                    <p className="text-gray-600 mb-6 max-w-2xl leading-relaxed">
                                        {user.longBio}
                                    </p>
                                )}

                                {/* Metadata */}
                                <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
                                    {user.location && (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Member since {formattedDate}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-8 mb-6">
                                    <div>
                                        <div className="text-2xl font-bold">{articles.length}</div>
                                        <div className="text-sm text-gray-600">Articles</div>
                                    </div>
                                    {user.totalViews !== undefined && user.totalViews > 0 && (
                                        <div>
                                            <div className="text-2xl font-bold">{user.totalViews.toLocaleString()}</div>
                                            <div className="text-sm text-gray-600">Views</div>
                                        </div>
                                    )}
                                </div>

                                {/* Social Links */}
                                {(user.website || user.twitter || user.linkedin || user.github) && (
                                    <div className="flex gap-4">
                                        {user.website && (
                                            <a
                                                href={user.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-600 hover:text-blue-600 transition-colors"
                                                title="Website"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                        )}
                                        {user.twitter && (
                                            <a
                                                href={`https://twitter.com/${user.twitter}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-600 hover:text-blue-400 transition-colors"
                                                title="Twitter"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                                </svg>
                                            </a>
                                        )}
                                        {user.linkedin && (
                                            <a
                                                href={`https://linkedin.com/in/${user.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-600 hover:text-blue-700 transition-colors"
                                                title="LinkedIn"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                            </a>
                                        )}
                                        {user.github && (
                                            <a
                                                href={`https://github.com/${user.github}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                                title="GitHub"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Articles Section */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-2xl font-bold mb-8">
                        Published Articles ({articles.length})
                    </h2>

                    {articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {articles.map((article) => (
                                <ArticleCard key={article.id} post={article} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-lg">No articles published yet</p>
                            <p className="text-gray-500 text-sm mt-2">Check back later for new content!</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
