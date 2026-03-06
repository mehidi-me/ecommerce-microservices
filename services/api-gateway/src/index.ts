import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(morgan('combined'));
app.use(rateLimiter);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// ─── Service URLs ───────────────────────────────────────────────────
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:4001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:4002';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:4003';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:4004';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:4005';

// ─── Proxy Config Helper ────────────────────────────────────────────
const proxyOptions = (target: string) => ({
    target,
    changeOrigin: true,
    on: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (err: Error, _req: any, res: any) => {
            console.error('Proxy error:', err.message);
            if (res && typeof res.status === 'function') {
                res.status(502).json({ success: false, error: 'Service temporarily unavailable' });
            } else if (res && typeof res.end === 'function') {
                res.statusCode = 502;
                res.end(JSON.stringify({ success: false, error: 'Service temporarily unavailable' }));
            }
        },
    },
});

// ─── PUBLIC ROUTES (no auth required) ──────────────────────────────
// Auth
app.use('/api/auth', createProxyMiddleware(proxyOptions(AUTH_SERVICE_URL)));

// Products — GET is public, write requires admin
app.use('/api/products', (req, res, next) => {
    if (req.method === 'GET') {
        return createProxyMiddleware(proxyOptions(PRODUCT_SERVICE_URL))(req, res, next);
    }
    authMiddleware(req, res, (err) => {
        if (err) return next(err);
        createProxyMiddleware(proxyOptions(PRODUCT_SERVICE_URL))(req, res, next);
    });
});

// ─── PROTECTED ROUTES (JWT required) ───────────────────────────────
// Users
app.use('/api/users', authMiddleware, createProxyMiddleware(proxyOptions(USER_SERVICE_URL)));

// Orders
app.use('/api/orders', authMiddleware, createProxyMiddleware(proxyOptions(ORDER_SERVICE_URL)));

// Payments
app.use('/api/payments', (req, res, next) => {
    // Webhook is public
    if (req.path === '/webhook' && req.method === 'POST') {
        return createProxyMiddleware(proxyOptions(PAYMENT_SERVICE_URL))(req, res, next);
    }
    authMiddleware(req, res, (err) => {
        if (err) return next(err);
        createProxyMiddleware(proxyOptions(PAYMENT_SERVICE_URL))(req, res, next);
    });
});

// ─── Not Found ──────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});

export default app;
