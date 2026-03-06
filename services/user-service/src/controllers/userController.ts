import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../db';
import { asyncHandler, createError } from '../utils/errors';

const profileSchema = z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    phone: z.string().max(20).optional(),
    avatarUrl: z.string().url().optional(),
});

const addressSchema = z.object({
    label: z.string().default('Home'),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional().default(''),
    country: z.string().min(1),
    postalCode: z.string().min(1),
    isDefault: z.boolean().default(false),
});

// GET /profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw createError('Unauthorized', 401);

    const result = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
    );

    res.json({ success: true, data: result.rows[0] || null });
});

// PUT /profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw createError('Unauthorized', 401);

    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const { firstName, lastName, phone, avatarUrl } = parsed.data;

    const result = await pool.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, phone, avatar_url)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE
     SET first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
         last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
         phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
         avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
         updated_at = NOW()
     RETURNING *`,
        [userId, firstName, lastName, phone, avatarUrl]
    );

    res.json({ success: true, data: result.rows[0] });
});

// GET /addresses
export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw createError('Unauthorized', 401);

    const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [userId]
    );

    res.json({ success: true, data: result.rows });
});

// POST /addresses
export const addAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw createError('Unauthorized', 401);

    const parsed = addressSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const { label, street, city, state, country, postalCode, isDefault } = parsed.data;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        if (isDefault) {
            await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
        }
        const result = await client.query(
            `INSERT INTO addresses (user_id, label, street, city, state, country, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [userId, label, street, city, state, country, postalCode, isDefault]
        );
        await client.query('COMMIT');
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

// DELETE /addresses/:id
export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw createError('Unauthorized', 401);

    const { id } = req.params;

    const result = await pool.query(
        'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
    );

    if (result.rows.length === 0) throw createError('Address not found', 404);

    res.json({ success: true, message: 'Address deleted' });
});
