import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/firebase/firestore';
import PageWithSidebars from '@/components/layout/PageWithSidebars';
import ArticleContent from '@/components/article/ArticleContent';
import RecommendedArticles from '@/components/ml/RecommendedArticles';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Article Not Found',
        };
    }

    // Convert createdAt to Date if it's a Timestamp
    const publishedDate = post.createdAt instanceof Date
        ? post.createdAt
        : post.createdAt?.toDate?.() || new Date();

    return {
        title: `${post.title} | Artelipi`,
        description: post.content.substring(0, 160),
        authors: [{ name: post.authorName }],
        openGraph: {
            title: post.title,
            description: post.content.substring(0, 160),
            type: 'article',
            publishedTime: publishedDate.toISOString(),
            authors: [post.authorName],
            images: post.imageURL ? [post.imageURL] : [],
        },
    };
}

export async function generateStaticParams() {
    const posts = await getAllPosts(100);
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export const revalidate = 60;

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // Serialize the post to convert Firestore Timestamps to plain objects
    const serializedPost = {
        ...post,
        createdAt: post.createdAt instanceof Date
            ? post.createdAt
            : post.createdAt?.toDate?.() || new Date(),
        updatedAt: post.updatedAt instanceof Date
            ? post.updatedAt
            : post.updatedAt?.toDate?.() || new Date(),
    };

    return (
        <PageWithSidebars>
            <ArticleContent post={serializedPost} />

            {/* ML-Powered Recommendations */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <RecommendedArticles
                    currentArticle={{
                        title: serializedPost.title,
                        content: serializedPost.content
                    }}
                    limit={5}
                />
            </div>

        </PageWithSidebars>
    );
}
