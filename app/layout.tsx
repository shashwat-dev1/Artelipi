import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import AppLayout from "@/components/layout/AppLayout";
import OnboardingWrapper from "@/components/profile/OnboardingWrapper";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
    display: 'swap',
});

const playfair = Playfair_Display({
    weight: ['400', '500', '600', '700', '800', '900'],
    subsets: ["latin"],
    variable: '--font-playfair',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Artelipi - Thoughtful Writing, Without the Noise",
    description: "A place for long-form ideas, not algorithms. Premium editorial platform for serious writers.",
    keywords: ["blogging", "publishing", "articles", "writing", "editorial", "long-form"],
    authors: [{ name: "Artelipi" }],
    openGraph: {
        title: "Artelipi - Thoughtful Writing, Without the Noise",
        description: "A place for long-form ideas, not algorithms.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="antialiased font-sans bg-premium-bg text-premium-text">
                <AuthProvider>
                    <SidebarProvider>
                        <OnboardingWrapper>
                            <AppLayout>
                                {children}
                            </AppLayout>
                        </OnboardingWrapper>
                        <Toaster position="top-right" />
                    </SidebarProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
