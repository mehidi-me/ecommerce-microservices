import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

async function getFeaturedProducts() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products?limit=8&sort=popular`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

const categories = [
    { name: 'Clothing', emoji: '👕', slug: 'clothing', color: 'from-blue-400 to-blue-600' },
    { name: 'Electronics', emoji: '💻', slug: 'electronics', color: 'from-purple-400 to-purple-600' },
    { name: 'Home & Living', emoji: '🏠', slug: 'home', color: 'from-green-400 to-green-600' },
    { name: 'Sports', emoji: '⚽', slug: 'sports', color: 'from-orange-400 to-orange-600' },
];

export default async function HomePage() {
    const products = await getFeaturedProducts();

    return (
        <>
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary-500 via-accent to-purple-700 text-white py-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in">
                            🚀 Free shipping on orders over $50
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
                            Shop the Latest
                            <br />
                            <span className="text-yellow-300">Trends</span>
                        </h1>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Discover thousands of products with fast delivery, easy returns, and unbeatable prices.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/products" className="bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-yellow-50 transition-all hover:scale-105 shadow-lg">
                                Shop Now →
                            </Link>
                            <Link href="/auth/register" className="bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-xl hover:bg-white/30 transition-all border border-white/30">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Stats Banner */}
                <section className="bg-gray-900 text-white py-8">
                    <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {[
                            { label: 'Products', value: '10,000+' },
                            { label: 'Happy Customers', value: '50,000+' },
                            { label: 'Countries', value: '25+' },
                            { label: 'Daily Orders', value: '1,000+' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-3xl font-bold text-primary-400">{stat.value}</p>
                                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Categories */}
                <section className="max-w-7xl mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/products?category=${cat.slug}`}
                                className={`bg-gradient-to-br ${cat.color} rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform cursor-pointer shadow-md`}
                            >
                                <div className="text-4xl mb-2">{cat.emoji}</div>
                                <h3 className="font-semibold">{cat.name}</h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Featured Products */}
                <section className="max-w-7xl mx-auto px-4 pb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                        <Link href="/products" className="text-primary-500 hover:text-primary-600 font-semibold">
                            View All →
                        </Link>
                    </div>
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {products.map((product: any) => (
                                <Link key={product._id} href={`/products/${product._id}`} className="card group">
                                    <div className="bg-gray-100 rounded-t-2xl aspect-square flex items-center justify-center text-5xl">
                                        {product.images?.[0]?.url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover rounded-t-2xl" />
                                        ) : '📦'}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-lg font-bold text-primary-500">
                                                ${product.salePrice ?? product.price}
                                            </span>
                                            {product.salePrice && (
                                                <span className="text-sm text-gray-400 line-through">${product.price}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-5xl mb-4">🛍️</p>
                            <p className="text-xl">Products coming soon! Check back later.</p>
                        </div>
                    )}
                </section>

                {/* CTA Banner */}
                <section className="bg-gradient-to-r from-primary-500 to-accent mx-4 rounded-3xl p-12 text-center text-white mb-16 max-w-7xl lg:mx-auto">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
                    <p className="text-white/80 mb-6">Join thousands of happy customers today.</p>
                    <Link href="/auth/register" className="bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-yellow-50 transition-all inline-block">
                        Get Started Free
                    </Link>
                </section>
            </main>
            <Footer />
        </>
    );
}
