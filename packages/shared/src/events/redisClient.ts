import { createClient, RedisClientType } from 'redis';

let publisherClient: RedisClientType | null = null;
let subscriberClient: RedisClientType | null = null;

const getRedisUrl = (): string => process.env.REDIS_URL || 'redis://localhost:6379';

export const getPublisher = async (): Promise<RedisClientType> => {
    if (!publisherClient) {
        publisherClient = createClient({ url: getRedisUrl() }) as RedisClientType;
        publisherClient.on('error', (err) => console.error('Redis Publisher Error:', err));
        await publisherClient.connect();
    }
    return publisherClient;
};

export const getSubscriber = async (): Promise<RedisClientType> => {
    if (!subscriberClient) {
        subscriberClient = createClient({ url: getRedisUrl() }) as RedisClientType;
        subscriberClient.on('error', (err) => console.error('Redis Subscriber Error:', err));
        await subscriberClient.connect();
    }
    return subscriberClient;
};

export const publishEvent = async (channel: string, data: unknown): Promise<void> => {
    const publisher = await getPublisher();
    await publisher.publish(channel, JSON.stringify(data));
    console.log(`[EventBus] Published → ${channel}`);
};

export const subscribeToEvent = async (
    channel: string,
    handler: (data: unknown) => Promise<void>
): Promise<void> => {
    const subscriber = await getSubscriber();
    await subscriber.subscribe(channel, async (message) => {
        try {
            const data = JSON.parse(message);
            await handler(data);
        } catch (err) {
            console.error(`[EventBus] Error handling event ${channel}:`, err);
        }
    });
    console.log(`[EventBus] Subscribed → ${channel}`);
};

export const closeRedisConnections = async (): Promise<void> => {
    if (publisherClient) await publisherClient.quit();
    if (subscriberClient) await subscriberClient.quit();
};
