import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import userRouter from './routes/user';
import { errorHandler } from './utils/errors';
import { runMigrations } from './db';

const app = express();
const PORT = process.env.PORT || 4002;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'user-service' });
});

app.use('/', userRouter);
app.use(errorHandler);

const start = async () => {
    await runMigrations();
    app.listen(PORT, () => console.log(`👤 User Service running on port ${PORT}`));
};

start().catch((err) => {
    console.error(err);
    process.exit(1);
});

export default app;
