'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

const CATEGORIES = ['All', 'clothing', 'electronics', 'home', 'sports', 'books'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [addingId, setAddingId] = useState<string | null>(null);
    const addItem = useCartStore((s) => s.addItem);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 12, sort };
            if (search) params.search = search;
            if (category !== 'All') params.category = category;

            const res = await productsApi.list(params);
            setProducts(res.data.data || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, sort, category]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const handleAddToCart = (product: { _id: string; name: string; price: number; salePrice?: number; images?: Array<{ url: string }> }) => {
        setAddingId(product._id);
        addItem({
            productId: product._id,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice,
            quantity: 1,
            image: product.images?.[0]?.url,
        });
        setTimeout(() => setAddingId(null), 1000);
    };

    return (
        <>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="input flex-1"
                        id="search-input"
                    />
                    <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="input md:w-48"
                        id="sort-select"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setCategory(cat); setPage(1); }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-500'
                                }`}
                            id={`cat-${cat}`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="card animate-pulse">
                                <div className="bg-gray-200 aspect-square rounded-t-2xl" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="text-xl">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
                        {products.map((product) => (
                            <div key={product._id} className="card group overflow-hidden">
                                <Link href={`/products/${product._id}`}>
                                    <div className="bg-gray-100 aspect-square flex items-center justify-center overflow-hidden relative">
                                        {product.images?.[0]?.url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <span className="text-5xl">📦</span>
                                        )}
                                        {product.salePrice && (
                                            <span className="absolute top-2 left-2 badge-error">SALE</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1 capitalize">{product.category}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div>
                                                <span className="text-lg font-bold text-primary-500">${product.salePrice ?? product.price}</span>
                                                {product.salePrice && (
                                                    <span className="text-sm text-gray-400 line-through ml-2">${product.price}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                                ★ <span className="text-gray-600">{product.ratings?.average?.toFixed(1) || '0.0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <div className="px-4 pb-4">
                                    <button
                                        id={`add-to-cart-${product._id}`}
                                        onClick={() => handleAddToCart(product)}
                                        disabled={addingId === product._id || product.inventory === 0}
                                        className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${addingId === product._id
                                                ? 'bg-green-500 text-white'
                                                : product.inventory === 0
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-primary-500 text-white hover:bg-primary-600'
                                            }`}
                                    >
                                        {addingId === product._id ? '✓ Added!' : product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-10">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">
                            ← Prev
                        </button>
                        <span className="flex items-center px-4 text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">
                            Next →
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
