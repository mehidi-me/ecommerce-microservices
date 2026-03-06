'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();

    if (items.length === 0) {
        return (
            <>
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
                    <p className="text-gray-500 mb-8">Add some products to get started</p>
                    <Link href="/products" className="btn-primary">Browse Products</Link>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="card p-4 flex gap-4 items-center">
                                {/* Thumbnail */}
                                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    {item.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <span className="text-2xl">📦</span>
                                    )}
                                </div>

                                {/* Item Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                    {item.variant && Object.keys(item.variant).length > 0 && (
                                        <p className="text-sm text-gray-500">
                                            {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </p>
                                    )}
                                    <p className="text-primary-500 font-bold mt-1">
                                        ${(item.salePrice ?? item.price).toFixed(2)}
                                    </p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold"
                                    >−</button>
                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold"
                                    >+</button>
                                </div>

                                {/* Subtotal + Remove */}
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-gray-900">
                                        ${((item.salePrice ?? item.price) * item.quantity).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => removeItem(item.productId, item.variant)}
                                        className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors"
                                    >Remove</button>
                                </div>
                            </div>
                        ))}

                        <button onClick={clearCart} className="text-sm text-gray-400 hover:text-gray-600 transition-colors mt-2">
                            Clear cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="card p-6 h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                <span>${total().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (estimated)</span>
                                <span>${(total() * 0.08).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                                <span>Total</span>
                                <span className="text-primary-500">${(total() * 1.08).toFixed(2)}</span>
                            </div>
                        </div>
                        <Link href="/checkout" id="checkout-btn" className="btn-primary w-full mt-6 text-center block">
                            Proceed to Checkout →
                        </Link>
                        <Link href="/products" className="btn-secondary w-full mt-3 text-center block text-sm">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
