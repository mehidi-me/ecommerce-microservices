import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: { default: 'ShopNow — Modern Ecommerce', template: '%s | ShopNow' },
    description: 'Discover and shop the best products online. Fast shipping, easy returns.',
    keywords: ['ecommerce', 'shopping', 'online store'],
    openGraph: {
        type: 'website',
        title: 'ShopNow — Modern Ecommerce',
        description: 'Discover and shop the best products online',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50">
                {children}
            </body>
        </html>
    );
}
