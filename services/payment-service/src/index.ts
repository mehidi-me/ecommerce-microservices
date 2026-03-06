import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import paymentRouter from './routes/payment';
import { errorHandler } from './utils/errors';

const app = express();
const PORT = process.env.PORT || 4005;

app.use(helmet());
app.use(cors());
// Note: webhook route uses raw body, so we add json parser AFTER routes
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'payment-service' });
});

app.use('/', paymentRouter);
app.use(errorHandler);

app.listen(PORT, () => console.log(`💳 Payment Service running on port ${PORT}`));

export default app;
