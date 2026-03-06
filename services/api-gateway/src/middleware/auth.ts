import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Inline type — avoids importing from outside the Docker build context
interface JWTPayload {
    userId: string;
    email: string;
    role: 'customer' | 'admin';
    iat?: number;
    exp?: number;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Authorization token required' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET not configured');

        const payload = jwt.verify(token, secret) as JWTPayload;
        req.user = payload;

        // Inject user info into upstream headers
        req.headers['x-user-id'] = payload.userId;
        req.headers['x-user-email'] = payload.email;
        req.headers['x-user-role'] = payload.role;

        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ success: false, error: 'Token expired' });
        } else if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, error: 'Invalid token' });
        } else {
            res.status(500).json({ success: false, error: 'Authentication error' });
        }
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Admin access required' });
        return;
    }
    next();
};
