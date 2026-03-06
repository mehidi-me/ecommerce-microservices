'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ordersApi, paymentsApi } from '@/lib/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

function StripePaymentForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        setError('');

        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: `${window.location.origin}/orders` },
            redirect: 'if_required',
        });

        if (stripeError) {
            setError(stripeError.message || 'Payment failed');
            setLoading(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                id="pay-now-btn"
                type="submit"
                disabled={!stripe || loading}
                className="btn-primary w-full py-4 mt-4 text-lg disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, clearCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const [step, setStep] = useState<'address' | 'payment'>('address');
    const [clientSecret, setClientSecret] = useState('');
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [address, setAddress] = useState<Address>({
        street: '', city: '', state: '', country: 'US', postalCode: '',
    });

    if (!isAuthenticated()) {
        router.push('/auth/login');
        return null;
    }

    if (items.length === 0) {
        router.push('/cart');
        return null;
    }

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const orderRes = await ordersApi.create({
                items: items.map((i) => ({
                    productId: i.productId,
                    name: i.name,
                    quantity: i.quantity,
                    price: i.salePrice ?? i.price,
                    variant: i.variant,
                })),
                total: total(),
                currency: 'USD',
                address,
            });

            const newOrderId = orderRes.data.data.id;
            setOrderId(newOrderId);

            const intentRes = await paymentsApi.createIntent({
                orderId: newOrderId,
                amount: total(),
                currency: 'usd',
            });

            setClientSecret(intentRes.data.data.clientSecret);
            setStep('payment');
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data?.error || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        clearCart();
        router.push(`/orders/${orderId}?success=true`);
    };

    return (
        <>
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                {/* Step Indicator */}
                <div className="flex items-center gap-4 mb-10">
                    {['address', 'payment'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === s || (i === 0 && step === 'payment') ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {i === 0 && step === 'payment' ? '✓' : i + 1}
                            </div>
                            <span className={`font-medium text-sm ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s === 'address' ? 'Shipping Address' : 'Payment'}
                            </span>
                            {i < 1 && <div className="flex-1 h-px bg-gray-200 ml-2" style={{ width: '60px' }} />}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {step === 'address' && (
                            <div className="card p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
                                <form onSubmit={handleAddressSubmit} className="space-y-4">
                                    <input
                                        className="input"
                                        placeholder="Street address"
                                        value={address.street}
                                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                        required
                                        id="street-input"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            className="input"
                                            placeholder="City"
                                            value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                            required
                                            id="city-input"
                                        />
                                        <input
                                            className="input"
                                            placeholder="State"
                                            value={address.state}
                                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                            id="state-input"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            className="input"
                                            placeholder="Country (e.g. US)"
                                            value={address.country}
                                            onChange={(e) => setAddress({ ...address, country: e.target.value })}
                                            required
                                            id="country-input"
                                        />
                                        <input
                                            className="input"
                                            placeholder="Postal code"
                                            value={address.postalCode}
                                            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                                            required
                                            id="postal-input"
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <button id="continue-to-payment" type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
                                        {loading ? 'Processing...' : 'Continue to Payment →'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 'payment' && clientSecret && (
                            <div className="card p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment</h2>
                                <div className="mb-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                                    💡 Test card: <strong>4242 4242 4242 4242</strong> | Any future date | Any 3-digit CVV
                                </div>
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <StripePaymentForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
                                </Elements>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="card p-6 h-fit">
                        <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm mb-4">
                            {items.map((item, i) => (
                                <div key={i} className="flex justify-between">
                                    <span className="text-gray-600 truncate flex-1 mr-2">{item.name} ×{item.quantity}</span>
                                    <span className="text-gray-900 flex-shrink-0">${((item.salePrice ?? item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                            <div className="flex justify-between font-bold text-gray-900">
                                <span>Total</span>
                                <span className="text-primary-500">${total().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
