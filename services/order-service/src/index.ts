import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import orderRouter from './routes/order';
import { errorHandler } from './utils/errors';
import { runMigrations } from './db';
import { startSubscribers } from './events/subscriber';

const app = express();
const PORT = process.env.PORT || 4004;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'order-service' });
});

app.use('/', orderRouter);
app.use(errorHandler);

const start = async () => {
    await runMigrations();
    await startSubscribers();
    app.listen(PORT, () => console.log(`🛒 Order Service running on port ${PORT}`));
};

start().catch((err) => {
    console.error(err);
    process.exit(1);
});

export default app;
