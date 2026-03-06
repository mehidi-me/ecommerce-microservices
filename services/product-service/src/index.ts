import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import productRouter from './routes/product';
import { errorHandler } from './utils/errors';

const app = express();
const PORT = process.env.PORT || 4003;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'product-service' });
});

app.use('/', productRouter);
app.use(errorHandler);

const start = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce-products');
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`📦 Product Service running on port ${PORT}`));
};

start().catch((err) => {
    console.error(err);
    process.exit(1);
});

export default app;
