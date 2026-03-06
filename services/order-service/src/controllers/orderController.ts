import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../db';
import { asyncHandler, createError } from '../utils/errors';
import { publishEvent } from '../events/publisher';

const orderItemSchema = z.object({
    productId: z.string().min(1),
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    variant: z.record(z.string()).optional(),
});

const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1),
    total: z.number().positive(),
    currency: z.string().length(3).default('USD'),
    address: z.object({
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().optional().default(''),
        country: z.string().min(1),
        postalCode: z.string().min(1),
    }),
});

// POST /orders
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    if (!userId) throw createError('Unauthorized', 401);

    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const { items, total, currency, address } = parsed.data;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const orderResult = await client.query(
            `INSERT INTO orders (user_id, status, total, currency, address)
       VALUES ($1, 'pending', $2, $3, $4) RETURNING *`,
            [userId, total, currency, JSON.stringify(address)]
        );
        const order = orderResult.rows[0];

        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, name, quantity, price, variant)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [order.id, item.productId, item.name, item.quantity, item.price, item.variant ? JSON.stringify(item.variant) : null]
            );
        }

        await client.query('COMMIT');

        // Publish event for notification service
        await publishEvent('order.created', {
            orderId: order.id,
            userId,
            userEmail,
            total,
            currency,
            items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            address,
        });

        res.status(201).json({ success: true, data: { id: order.id, status: order.status, total, currency } });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

// GET /orders/my-orders
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw createError('Unauthorized', 401);

    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(50, parseInt((req.query.limit as string) || '10'));
    const offset = (page - 1) * limit;

    const { rows: orders } = await pool.query(
        `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );

    const { rows: countRows } = await pool.query(
        'SELECT COUNT(*) FROM orders WHERE user_id = $1',
        [userId]
    );
    const total = parseInt(countRows[0].count);

    res.json({
        success: true,
        data: orders,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

// GET /orders/:id
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    const { rows: orders } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (orders.length === 0) throw createError('Order not found', 404);

    const order = orders[0];
    if (order.user_id !== userId && userRole !== 'admin') {
        throw createError('Access denied', 403);
    }

    const { rows: items } = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
    );

    res.json({ success: true, data: { ...order, items } });
});

// PUT /orders/:id/status (admin)
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const userRole = req.headers['x-user-role'] as string;
    if (userRole !== 'admin') throw createError('Admin access required', 403);

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed'];
    if (!validStatuses.includes(status)) throw createError('Invalid status', 400);

    const userId = req.headers['x-user-id'] as string;

    const { rows } = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, req.params.id]
    );
    if (rows.length === 0) throw createError('Order not found', 404);

    if (status === 'shipped') {
        await publishEvent('order.shipped', {
            orderId: rows[0].id,
            userId: rows[0].user_id,
            userEmail: '',
            trackingNumber: req.body.trackingNumber,
        });
    }

    // Suppress unused variable warning
    void userId;

    res.json({ success: true, data: rows[0] });
});
