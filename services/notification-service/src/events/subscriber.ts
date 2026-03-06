import { createClient } from 'redis';
import { sendEmail } from '../emails/sender';
import {
    orderConfirmationTemplate,
    paymentSuccessTemplate,
    paymentFailedTemplate,
    shippingTemplate,
    welcomeTemplate,
} from '../emails/templates';

const getSubscriber = async () => {
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    client.on('error', (err) => console.error('Redis Subscriber Error:', err));
    await client.connect();
    return client;
};

export const startSubscribers = async (): Promise<void> => {
    const subscriber = await getSubscriber();

    await subscriber.subscribe('order.created', async (message) => {
        const data = JSON.parse(message);
        const tmpl = orderConfirmationTemplate(data);
        await sendEmail(data.userEmail, tmpl.subject, tmpl.html);
    });

    await subscriber.subscribe('payment.success', async (message) => {
        const data = JSON.parse(message);
        const tmpl = paymentSuccessTemplate(data);
        await sendEmail(data.userEmail, tmpl.subject, tmpl.html);
    });

    await subscriber.subscribe('payment.failed', async (message) => {
        const data = JSON.parse(message);
        const tmpl = paymentFailedTemplate(data);
        await sendEmail(data.userEmail, tmpl.subject, tmpl.html);
    });

    await subscriber.subscribe('order.shipped', async (message) => {
        const data = JSON.parse(message);
        const tmpl = shippingTemplate(data);
        await sendEmail(data.userEmail, tmpl.subject, tmpl.html);
    });

    await subscriber.subscribe('user.registered', async (message) => {
        const data = JSON.parse(message);
        const tmpl = welcomeTemplate({ email: data.email });
        await sendEmail(data.email, tmpl.subject, tmpl.html);
    });

    console.log('[NotificationService] All event subscribers started');
};
