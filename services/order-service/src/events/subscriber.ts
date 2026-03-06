import { createClient } from 'redis';
import pool from '../db';

const getSubscriber = async () => {
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    client.on('error', (err) => console.error('Redis Subscriber Error:', err));
    await client.connect();
    return client;
};

export const startSubscribers = async (): Promise<void> => {
    const subscriber = await getSubscriber();

    // payment.success → update order status to confirmed
    await subscriber.subscribe('payment.success', async (message) => {
        try {
            const { orderId, paymentIntentId } = JSON.parse(message);
            await pool.query(
                'UPDATE orders SET status = $1, payment_intent_id = $2 WHERE id = $3',
                ['confirmed', paymentIntentId, orderId]
            );
            console.log(`[OrderService] Order ${orderId} confirmed`);
        } catch (err) {
            console.error('[OrderService] payment.success handler error:', err);
        }
    });

    // payment.failed → update order status to payment_failed
    await subscriber.subscribe('payment.failed', async (message) => {
        try {
            const { orderId } = JSON.parse(message);
            await pool.query(
                "UPDATE orders SET status = 'payment_failed' WHERE id = $1",
                [orderId]
            );
            console.log(`[OrderService] Order ${orderId} payment failed`);
        } catch (err) {
            console.error('[OrderService] payment.failed handler error:', err);
        }
    });

    console.log('[OrderService] Event subscribers started');
};
