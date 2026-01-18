import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-premium-border bg-premium-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Main Footer Content */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    {/* Brand */}
                    <div>
                        <h2 className="font-serif text-2xl font-semibold text-premium-text mb-2">
                            Artelipi
                        </h2>
                        <p className="text-muted max-w-xs">
                            Thoughtful writing, without the noise.
                        </p>
                    </div>

                    {/* Links */}
                    <nav className="flex gap-8 text-sm">
                        <Link
                            href="/about"
                            className="text-premium-text-secondary hover:text-premium-text transition-colors duration-200"
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="text-premium-text-secondary hover:text-premium-text transition-colors duration-200"
                        >
                            Contact
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-premium-text-secondary hover:text-premium-text transition-colors duration-200"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-premium-text-secondary hover:text-premium-text transition-colors duration-200"
                        >
                            Terms
                        </Link>
                    </nav>
                </div>

                {/* Bottom Bar */}
                <div className="premium-divider pt-8">
                    <p className="text-muted text-center">
                        © {currentYear} Artelipi
                    </p>
                </div>
            </div>
        </footer>
    );
}
