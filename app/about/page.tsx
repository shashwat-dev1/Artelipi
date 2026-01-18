import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
    title: 'About Artelipi | Premium Multi-Author Publishing Platform',
    description: 'Learn about Artelipi, a modern editorial-first blogging platform for high-quality long-form content.',
};

export default function AboutPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-5xl font-bold mb-6">About Artelipi</h1>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                        <p className="text-xl leading-relaxed">
                            Artelipi is a premium multi-author publishing platform designed for writers who value quality,
                            readability, and editorial discipline.
                        </p>

                        <h2 className="text-3xl font-bold mt-12 mb-4">Our Mission</h2>
                        <p>
                            We believe that great writing deserves a great platform. Artelipi provides a distraction-free,
                            beautifully designed space for authors to share their stories, insights, and ideas with the world.
                        </p>

                        <h2 className="text-3xl font-bold mt-12 mb-4">Editorial Philosophy</h2>
                        <p>
                            Every article on Artelipi follows a strict editorial structure:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Headline:</strong> Clear, compelling, and mandatory</li>
                            <li><strong>Byline:</strong> Automatically generated from your profile</li>
                            <li><strong>Hero Image:</strong> Optional visual storytelling</li>
                            <li><strong>Content:</strong> Rich, well-formatted long-form writing</li>
                        </ul>

                        <h2 className="text-3xl font-bold mt-12 mb-4">For Writers</h2>
                        <p>
                            Artelipi is built for writers who want to focus on their craft. No complex dashboards,
                            no analytics overload—just a clean, intuitive interface for writing and publishing.
                        </p>

                        <h2 className="text-3xl font-bold mt-12 mb-4">For Readers</h2>
                        <p>
                            We prioritize the reading experience above all else. Optimal line width, beautiful typography,
                            and a distraction-free layout ensure that every article is a pleasure to read.
                        </p>

                        <h2 className="text-3xl font-bold mt-12 mb-4">Technology</h2>
                        <p>
                            Artelipi is built with modern web technologies including Next.js, Firebase, and Tailwind CSS.
                            We're committed to performance, accessibility, and a premium user experience.
                        </p>

                        <div className="bg-blue-50 p-8 rounded-2xl mt-12">
                            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
                            <p className="mb-6">
                                Ready to start writing? Create your free account and publish your first article today.
                            </p>
                            <a href="/signup" className="btn-primary inline-block">
                                Get Started
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
