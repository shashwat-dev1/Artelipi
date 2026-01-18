import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
                    <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
                    <p className="text-gray-600 mb-8 max-w-md">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link href="/" className="btn-primary inline-block">
                        Back to Home
                    </Link>
                </div>
            </div>
            <Footer />
        </>
    );
}
