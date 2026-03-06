import { Request, Response } from 'express';
import Stripe from 'stripe';
import { asyncHandler, createError } from '../utils/errors';
import { publishEvent } from '../events/publisher';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20',
});

// POST /payments/intent
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw createError('Unauthorized', 401);

    const { orderId, amount, currency = 'usd' } = req.body;

    if (!orderId || !amount) throw createError('orderId and amount are required', 400);
    if (amount < 50) throw createError('Amount must be at least 50 cents', 400);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency,
        metadata: { orderId, userId },
        automatic_payment_methods: { enabled: true },
    });

    res.json({
        success: true,
        data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        },
    });
});

// POST /payments/webhook
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        res.status(500).json({ error: 'Webhook secret not configured' });
        return;
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(400).json({ error: 'Webhook signature verification failed' });
        return;
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { orderId, userId, userEmail } = paymentIntent.metadata;

    switch (event.type) {
        case 'payment_intent.succeeded':
            await publishEvent('payment.success', {
                orderId,
                userId,
                userEmail,
                total: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                paymentIntentId: paymentIntent.id,
            });
            console.log(`[PaymentService] Payment succeeded for order ${orderId}`);
            break;

        case 'payment_intent.payment_failed':
            await publishEvent('payment.failed', {
                orderId,
                userId,
                userEmail,
                paymentIntentId: paymentIntent.id,
            });
            console.log(`[PaymentService] Payment failed for order ${orderId}`);
            break;

        default:
            console.log(`[PaymentService] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};
