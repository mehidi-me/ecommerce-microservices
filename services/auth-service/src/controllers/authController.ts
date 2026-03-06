import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../db';
import { asyncHandler, createError } from '../utils/errors';
import { JWTPayload } from '../types';

const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const generateTokens = (payload: JWTPayload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
    });
    return { accessToken, refreshToken };
};

// POST /register
export const register = asyncHandler(async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        throw createError(parsed.error.errors[0].message, 400);
    }

    const { email, password } = parsed.data;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
        throw createError('Email already registered', 409);
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, rounds);

    const result = await pool.query(
        `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'customer')
     RETURNING id, email, role, created_at`,
        [email.toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const payload: JWTPayload = { userId: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);

    res.status(201).json({
        success: true,
        data: {
            user: { id: user.id, email: user.email, role: user.role },
            accessToken,
            refreshToken,
        },
    });
});

// POST /login
export const login = asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        throw createError(parsed.error.errors[0].message, 400);
    }

    const { email, password } = parsed.data;

    const result = await pool.query(
        'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1',
        [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
        throw createError('Invalid email or password', 401);
    }

    const user = result.rows[0];

    if (!user.is_active) {
        throw createError('Account is deactivated', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw createError('Invalid email or password', 401);
    }

    const payload: JWTPayload = { userId: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);

    res.json({
        success: true,
        data: {
            user: { id: user.id, email: user.email, role: user.role },
            accessToken,
            refreshToken,
        },
    });
});

// POST /refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError('Refresh token required', 400);

    try {
        const payload = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET as string
        ) as JWTPayload;

        const result = await pool.query(
            'SELECT id, email, role, is_active FROM users WHERE id = $1',
            [payload.userId]
        );
        if (result.rows.length === 0 || !result.rows[0].is_active) {
            throw createError('User not found', 401);
        }

        const user = result.rows[0];
        const newPayload: JWTPayload = { userId: user.id, email: user.email, role: user.role };
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(newPayload);

        res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
    } catch {
        throw createError('Invalid refresh token', 401);
    }
});

// GET /me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw createError('Unauthorized', 401);

    const result = await pool.query(
        'SELECT id, email, role, created_at FROM users WHERE id = $1',
        [userId]
    );
    if (result.rows.length === 0) throw createError('User not found', 404);

    res.json({ success: true, data: result.rows[0] });
});
