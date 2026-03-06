'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const STATUS_STYLES: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    processing: 'badge-info',
    shipped: 'badge-purple',
    delivered: 'badge-success',
    cancelled: 'badge-error',
    payment_failed: 'badge-error',
};

export default function OrdersPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async () => {
        try {
            const res = await ordersApi.myOrders();
            setOrders(res.data.data || []);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated()) { router.push('/auth/login'); return; }
        loadOrders();
    }, [isAuthenticated, router, loadOrders]);

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">📦</p>
                        <p className="text-xl text-gray-500 mb-6">No orders yet</p>
                        <Link href="/products" className="btn-primary">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link key={order.id} href={`/orders/${order.id}`} className="card p-6 block hover:border-primary-200 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={STATUS_STYLES[order.status] || 'badge bg-gray-100 text-gray-700'}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-lg font-bold text-primary-500">${Number(order.total).toFixed(2)}</span>
                                        <span className="text-primary-400 text-sm">View →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
