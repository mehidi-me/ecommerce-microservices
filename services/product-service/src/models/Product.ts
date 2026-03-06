import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice?: number;
    category: string;
    images: Array<{ url: string; alt: string }>;
    variants: Array<{ name: string; options: string[] }>;
    inventory: number;
    isActive: boolean;
    tags: string[];
    ratings: { average: number; count: number };
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true, index: true },
        slug: { type: String, unique: true },
        description: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        salePrice: { type: Number, min: 0 },
        category: { type: String, required: true, index: true },
        images: [{ url: String, alt: { type: String, default: '' } }],
        variants: [{ name: String, options: [String] }],
        inventory: { type: Number, default: 0, min: 0 },
        isActive: { type: Boolean, default: true, index: true },
        tags: [{ type: String }],
        ratings: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0, min: 0 },
        },
    },
    { timestamps: true }
);

// Text index for full-text search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'ratings.average': -1 });

// Auto-generate slug from name before saving
ProductSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
