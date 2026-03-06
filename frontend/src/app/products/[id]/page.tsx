'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailPage() {
    const params = useParams();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const router = useRouter();

    useEffect(() => {
        const id = params.id as string;
        productsApi.get(id)
            .then((res) => setProduct(res.data.data))
            .catch(() => router.push('/products'))
            .finally(() => setLoading(false));
    }, [params.id, router]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({
            productId: product._id,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice,
            quantity,
            image: product.images?.[0]?.url,
            variant: Object.keys(selectedVariants).length ? selectedVariants : undefined,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-2 gap-12 animate-pulse">
                        <div className="bg-gray-200 aspect-square rounded-2xl" />
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4" />
                            <div className="h-6 bg-gray-200 rounded w-1/2" />
                            <div className="h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded w-5/6" />
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!product) return null;

    const effectivePrice = product.salePrice ?? product.price;
    const discount = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : null;

    return (
        <>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center overflow-hidden relative">
                            {product.images?.[0]?.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-8xl">📦</span>
                            )}
                            {discount && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                                    -{discount}%
                                </div>
                            )}
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-2">
                                {product.images.slice(1, 4).map((img: { url: string; alt: string }, i: number) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img key={i} src={img.url} alt={img.alt} className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <span className="badge-purple mb-2">{product.category}</span>
                            <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex text-yellow-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className={i < Math.round(product.ratings?.average || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                    ))}
                                </div>
                                <span className="text-gray-500 text-sm">({product.ratings?.count || 0} reviews)</span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-primary-500">${effectivePrice}</span>
                            {product.salePrice && (
                                <span className="text-xl text-gray-400 line-through">${product.price}</span>
                            )}
                        </div>

                        <p className="text-gray-600 leading-relaxed">{product.description}</p>

                        {/* Variants */}
                        {product.variants?.map((variant: { name: string; options: string[] }) => (
                            <div key={variant.name}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {variant.name}: <span className="text-primary-500">{selectedVariants[variant.name] || 'Select'}</span>
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {variant.options.map((opt: string) => (
                                        <button
                                            key={opt}
                                            onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${selectedVariants[variant.name] === opt
                                                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                                                    : 'border-gray-200 text-gray-600 hover:border-primary-200'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold">−</button>
                                <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold">+</button>
                                <span className="text-sm text-gray-500 ml-2">{product.inventory} in stock</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {product.tags?.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {product.tags.map((tag: string) => (
                                    <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Add to Cart */}
                        <div className="flex gap-3">
                            <button
                                id="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={product.inventory === 0}
                                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${added
                                        ? 'bg-green-500 text-white'
                                        : product.inventory === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:scale-[1.02]'
                                    }`}
                            >
                                {added ? '✓ Added to Cart!' : product.inventory === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
