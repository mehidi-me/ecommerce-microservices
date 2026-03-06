'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function OrderDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const isSuccess = searchParams.get('success') === 'true';

    useEffect(() => {
        if (!isAuthenticated()) { router.push('/auth/login'); return; }
        const id = params.id as string;
        ordersApi.get(id)
            .then((res) => setOrder(res.data.data))
            .catch(() => router.push('/orders'))
            .finally(() => setLoading(false));
    }, [params.id, isAuthenticated, router]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
                    <div className="card p-6 space-y-3">
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!order) return null;

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12">
                {isSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-6 mb-8 text-center animate-fade-in">
                        <p className="text-3xl mb-2">🎉</p>
                        <h2 className="text-xl font-bold">Order Placed Successfully!</h2>
                        <p className="text-sm mt-1">Thank you for your order. Check your email for confirmation.</p>
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                    </h1>
                    <Link href="/orders" className="text-primary-500 hover:underline text-sm">← All Orders</Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        {/* Order items */}
                        <div className="card p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Items Ordered</h3>
                            {(order.items || []).map((item: { id: string; name: string; quantity: number; price: number; variant?: Record<string, string> }) => (
                                <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        {item.variant && Object.keys(item.variant).length > 0 && (
                                            <p className="text-sm text-gray-500">{Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                                        )}
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                            <div className="flex justify-between font-bold text-gray-900 mt-4 pt-4 border-t border-gray-100">
                                <span>Total</span>
                                <span className="text-primary-500">${Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Status */}
                        <div className="card p-6">
                            <h3 className="font-bold text-gray-900 mb-3">Order Status</h3>
                            <span className="badge bg-primary-100 text-primary-700 text-sm">
                                {order.status?.replace('_', ' ')}
                            </span>
                            <p className="text-sm text-gray-500 mt-2">
                                Placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        {/* Shipping */}
                        <div className="card p-6">
                            <h3 className="font-bold text-gray-900 mb-3">Shipping Address</h3>
                            {order.address && (
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>{order.address.street}</p>
                                    <p>{order.address.city}{order.address.state ? `, ${order.address.state}` : ''}</p>
                                    <p>{order.address.postalCode}, {order.address.country}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
