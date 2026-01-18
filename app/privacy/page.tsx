import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
    title: 'Privacy Policy | Artelipi',
    description: 'Privacy Policy for Artelipi publishing platform.',
};

export default function PrivacyPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
                    <p className="text-gray-600 mb-8">Last updated: December 29, 2025</p>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                        <h2 className="text-3xl font-bold mt-8 mb-4">Introduction</h2>
                        <p>
                            At Artelipi, we take your privacy seriously. This Privacy Policy explains how we collect,
                            use, and protect your personal information when you use our platform.
                        </p>

                        <h2 className="text-3xl font-bold mt-8 mb-4">Information We Collect</h2>
                        <h3 className="text-2xl font-semibold mt-6 mb-3">Account Information</h3>
                        <p>When you create an account, we collect:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Your name</li>
                            <li>Email address</li>
                            <li>Profile photo (if you sign in with Google)</li>
                        </ul>

                        <h3 className="text-2xl font-semibold mt-6 mb-3">Content</h3>
                        <p>
                            We store the articles you publish, including headlines, content, and optional hero images.
                        </p>

                        <h3 className="text-2xl font-semibold mt-6 mb-3">Usage Data</h3>
                        <p>
                            We may collect information about how you use Artelipi, including pages visited and features used.
                        </p>

                        <h2 className="text-3xl font-bold mt-8 mb-4">How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To provide and maintain our service</li>
                            <li>To authenticate your account</li>
                            <li>To display your published articles</li>
                            <li>To communicate with you about your account</li>
                            <li>To improve our platform</li>
                        </ul>

                        <h2 className="text-3xl font-bold mt-8 mb-4">Data Storage</h2>
                        <p>
                            Your data is stored securely using Firebase services provided by Google. We implement
                            industry-standard security measures to protect your information.
                        </p>

                        <h2 className="text-3xl font-bold mt-8 mb-4">Public Information</h2>
                        <p>
                            Please note that articles you publish on Artelipi are publicly accessible. Your name and
                            profile photo (if provided) will be displayed alongside your published articles.
                        </p>

                        <h2 className="text-3xl font-bold mt-8 mb-4">Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal data</li>
                            <li>Delete your articles</li>
                            <li>Request deletion of your account</li>
                        </ul>

                        <h2 className="text-3xl font-bold mt-8 mb-4">Third-Party Services</h2>
                        <p>
                            We use Firebase (Google) for authentication, database, and storage. Please review
                            Google's Privacy Policy for information about how they handle your data.
                        </p>

                        <h2 className="text-3xl font-bold mt-8 mb-4">Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes
                            by posting the new Privacy Policy on this page.
                        </p>

                        <h2 className="text-3xl font-bold mt-8 mb-4">Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at{' '}
                            <a href="mailto:privacy@artelipi.com" className="text-blue-600 hover:text-blue-700">
                                privacy@artelipi.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
