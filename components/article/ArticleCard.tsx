import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { calculateReadingTime } from '@/lib/firebase/firestore';

interface ArticleCardProps {
    post: Post;
}

export default function ArticleCard({ post }: ArticleCardProps) {
    const readingTime = calculateReadingTime(post.content);

    // Handle both Date and Timestamp types
    const createdAt = post.createdAt instanceof Date
        ? post.createdAt
        : post.createdAt?.toDate?.() || new Date();

    const formattedDate = createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Link href={`/post/${post.slug}`} className="group block">
            <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Hero Image */}
                {post.imageURL && (
                    <div className="relative h-48 w-full overflow-hidden">
                        <Image
                            src={post.imageURL}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {/* Title */}
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                    </h2>

                    {/* Byline */}
                    <div className="flex items-center gap-3 mb-3">
                        {post.authorPhotoURL ? (
                            <Image
                                src={post.authorPhotoURL}
                                alt={post.authorName}
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                                {post.authorName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <p className="byline text-xs">
                            {post.byline} · {formattedDate} · {readingTime} min read
                        </p>
                    </div>

                    {/* Excerpt */}
                    <p className="text-gray-600 line-clamp-3">
                        {post.content.substring(0, 150)}...
                    </p>
                </div>
            </article>
        </Link>
    );
}
