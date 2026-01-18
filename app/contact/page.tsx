import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
    title: 'Contact Us | Artelipi',
    description: 'Get in touch with the Artelipi team.',
};

export default function ContactPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-white py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-5xl font-bold mb-6">Contact Us</h1>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                        <p className="text-xl">
                            We'd love to hear from you. Whether you have a question, feedback, or just want to say hello,
                            feel free to reach out.
                        </p>

                        <div className="bg-gray-50 p-8 rounded-2xl mt-8">
                            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Email</h3>
                                    <a href="mailto:hello@artelipi.com" className="text-blue-600 hover:text-blue-700">
                                        hello@artelipi.com
                                    </a>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Support</h3>
                                    <a href="mailto:support@artelipi.com" className="text-blue-600 hover:text-blue-700">
                                        support@artelipi.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">How do I start writing?</h3>
                                    <p>
                                        Simply create an account, sign in, and click the "Write" button in the header.
                                        You'll be able to publish your first article immediately.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Is Artelipi free?</h3>
                                    <p>
                                        Yes! Artelipi is completely free to use for both writers and readers.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Can I edit or delete my articles?</h3>
                                    <p>
                                        You can delete your articles at any time. Editing functionality will be added in a future update.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
