import 'dotenv/config';
import { startSubscribers } from './events/subscriber';

const start = async () => {
    try {
        await startSubscribers();
        console.log('📧 Notification Service started and listening for events');
    } catch (err) {
        console.error('Failed to start notification service:', err);
        process.exit(1);
    }
};

start();
