'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createPost, uploadImage } from '@/lib/firebase/firestore';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { CATEGORIES } from '@/lib/constants';

export default function WritePage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [keywords, setKeywords] = useState('');
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
    const [publishing, setPublishing] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Please sign in to write articles');
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            setHeroImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeroImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublish = async () => {
        if (!title.trim()) {
            toast.error('Please enter a headline');
            return;
        }

        if (!content.trim()) {
            toast.error('Please write some content');
            return;
        }

        if (!user) {
            toast.error('You must be signed in to publish');
            return;
        }

        // Use userData if available, otherwise fall back to Firebase user data
        const authorName = userData?.name || user.displayName || 'Anonymous';
        const authorPhoto = userData?.photoURL || user.photoURL || undefined;

        console.log('Publishing with:', { user: user.uid, userData, authorName });

        setPublishing(true);

        try {
            let imageURL: string | undefined;

            // Upload image if provided
            if (heroImage) {
                const tempPostId = `temp-${Date.now()}`;
                imageURL = await uploadImage(heroImage, tempPostId);
            }

            // Create post
            const keywordsArray = keywords
                .split(',')
                .map(k => k.trim())
                .filter(k => k.length > 0);

            const postId = await createPost(
                {
                    title: title.trim(),
                    content: content.trim(),
                    imageURL,
                    category: category || undefined,
                    keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
                },
                user.uid,
                authorName,
                authorPhoto
            );

            toast.success('Article published successfully!');

            // Get the post to redirect to it
            const { getPostById } = await import('@/lib/firebase/firestore');
            const post = await getPostById(postId);

            if (post) {
                router.push(`/post/${post.slug}`);
            } else {
                router.push('/');
            }
        } catch (error: any) {
            console.error('Publish error:', error);
            toast.error(error.message || 'Failed to publish article');
        } finally {
            setPublishing(false);
        }
    };

    if (authLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Write Your Story</h1>
                        <p className="text-gray-600">
                            Byline: <span className="font-semibold">By {userData?.name || user?.displayName || 'Author'}</span>
                        </p>
                    </div>

                    {/* Writing Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                        {/* Headline */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Headline <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your article headline..."
                                className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-600 focus:ring-0 px-0 py-3 placeholder:text-gray-300"
                                maxLength={200}
                            />
                            <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
                        </div>

                        {/* Hero Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hero Image (Optional)
                            </label>

                            {heroImagePreview ? (
                                <div className="relative">
                                    <Image
                                        src={heroImagePreview}
                                        alt="Hero preview"
                                        width={800}
                                        height={400}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            setHeroImage(null);
                                            setHeroImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg
                                            className="w-12 h-12 mb-3 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                                Article Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your article here... (Markdown supported)"
                                className="textarea-field min-h-[400px] font-serif text-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Supports Markdown formatting (headings, lists, links, etc.)
                            </p>
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select a category (optional)</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Help readers discover your article by topic
                            </p>
                        </div>

                        {/* Keywords */}
                        <div>
                            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                                Keywords
                            </label>
                            <input
                                id="keywords"
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="e.g., javascript, react, web development"
                                className="input-field"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Separate keywords with commas. These help with search but won't be displayed publicly.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <button
                                onClick={() => router.push('/')}
                                className="btn-secondary"
                                disabled={publishing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={publishing || !title.trim() || !content.trim()}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {publishing ? 'Publishing...' : 'Publish Article'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
