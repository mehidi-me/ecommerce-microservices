import { createClient } from 'redis';

let publisherClient: ReturnType<typeof createClient> | null = null;

const getPublisher = async () => {
    if (!publisherClient) {
        publisherClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
        publisherClient.on('error', (err) => console.error('Redis Publisher Error:', err));
        await publisherClient.connect();
    }
    return publisherClient;
};

export const publishEvent = async (channel: string, data: unknown): Promise<void> => {
    const publisher = await getPublisher();
    await publisher.publish(channel, JSON.stringify(data));
    console.log(`[EventBus] Published → ${channel}`);
};
