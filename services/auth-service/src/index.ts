import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth';
import { errorHandler } from './utils/errors';
import { runMigrations } from './db';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

app.use('/', authRouter);

app.use(errorHandler);

const start = async () => {
    try {
        await runMigrations();
        app.listen(PORT, () => console.log(`🔐 Auth Service running on port ${PORT}`));
    } catch (err) {
        console.error('Failed to start auth service:', err);
        process.exit(1);
    }
};

start();

export default app;
