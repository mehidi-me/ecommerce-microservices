import { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product';
import { asyncHandler, createError } from '../utils/errors';

const productSchema = z.object({
    name: z.string().min(1),
    description: z.string().default(''),
    price: z.number().positive(),
    salePrice: z.number().positive().optional(),
    category: z.string().min(1),
    images: z.array(z.object({ url: z.string().url(), alt: z.string().default('') })).default([]),
    variants: z.array(z.object({ name: z.string(), options: z.array(z.string()) })).default([]),
    inventory: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
});

// GET /products
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
    const {
        page = '1', limit = '20', search, category, minPrice, maxPrice, sort,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        newest: { createdAt: -1 },
        popular: { 'ratings.average': -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
        Product.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
        Product.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: products,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    });
});

// GET /products/:id
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id).lean();
    if (!product || !product.isActive) throw createError('Product not found', 404);
    res.json({ success: true, data: product });
});

// GET /products/category/:category
export const getByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(50, parseInt((req.query.limit as string) || '20'));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find({ category, isActive: true }).skip(skip).limit(limit).lean(),
        Product.countDocuments({ category, isActive: true }),
    ]);

    res.json({
        success: true,
        data: products,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

// POST /products (admin only — role checked by calling the guard)
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') throw createError('Admin access required', 403);

    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const product = await Product.create(parsed.data);
    res.status(201).json({ success: true, data: product });
});

// PUT /products/:id (admin only)
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') throw createError('Admin access required', 403);

    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const product = await Product.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
    if (!product) throw createError('Product not found', 404);

    res.json({ success: true, data: product });
});

// DELETE /products/:id (soft delete — admin only)
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') throw createError('Admin access required', 403);

    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) throw createError('Product not found', 404);

    res.json({ success: true, message: 'Product deactivated' });
});
