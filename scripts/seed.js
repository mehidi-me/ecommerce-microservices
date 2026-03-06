#!/usr/bin/env node
/**
 * Seed Script — creates demo products and an admin user
 * Usage: node scripts/seed.js
 * (Run after docker compose up)
 */

const API = 'http://localhost:3000';

async function fetchJSON(url, options = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    return res.json();
}

async function seed() {
    console.log('🌱 Starting seed...');

    // 1. Register admin user
    const admin = await fetchJSON(`${API}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com', password: 'Admin1234!' }),
    });

    if (!admin.success) {
        console.log('Admin user already exists or registration failed, trying login...');
    }

    const login = await fetchJSON(`${API}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com', password: 'Admin1234!' }),
    });

    if (!login.success) {
        console.error('Failed to get admin token. Make sure services are running.');
        process.exit(1);
    }

    const adminToken = login.data.accessToken;
    console.log('✅ Admin user ready');

    // NOTE: To make a user admin, update the role directly in PostgreSQL:
    // UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

    // 2. Create demo products
    const products = [
        {
            name: 'Classic White T-Shirt',
            description: 'Premium cotton t-shirt, perfect for any occasion.',
            price: 29.99,
            category: 'clothing',
            inventory: 150,
            tags: ['t-shirt', 'cotton', 'casual'],
            variants: [{ name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }],
            images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', alt: 'White T-Shirt' }],
        },
        {
            name: 'Wireless Pro Headphones',
            description: 'Noise-cancelling headphones with 30-hour battery life.',
            price: 199.99,
            salePrice: 149.99,
            category: 'electronics',
            inventory: 45,
            tags: ['headphones', 'wireless', 'audio'],
            images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Headphones' }],
        },
        {
            name: 'Running Sneakers',
            description: 'Lightweight performance running shoes with cushioned sole.',
            price: 89.99,
            category: 'sports',
            inventory: 80,
            tags: ['shoes', 'running', 'sports'],
            variants: [
                { name: 'Size', options: ['7', '8', '9', '10', '11', '12'] },
                { name: 'Color', options: ['Black', 'White', 'Blue'] },
            ],
            images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', alt: 'Sneakers' }],
        },
        {
            name: 'Minimalist Desk Lamp',
            description: 'LED desk lamp with adjustable brightness and color temperature.',
            price: 49.99,
            category: 'home',
            inventory: 200,
            tags: ['lamp', 'led', 'desk', 'home-office'],
            images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', alt: 'Desk Lamp' }],
        },
        {
            name: 'Leather Crossbody Bag',
            description: 'Genuine leather bag with multiple compartments.',
            price: 79.99,
            category: 'clothing',
            inventory: 30,
            tags: ['bag', 'leather', 'accessories'],
            images: [{ url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', alt: 'Leather Bag' }],
        },
        {
            name: 'Smart Watch Pro',
            description: 'Track fitness, notifications, and more on your wrist.',
            price: 299.99,
            salePrice: 249.99,
            category: 'electronics',
            inventory: 25,
            tags: ['smartwatch', 'fitness', 'wearable'],
            images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', alt: 'Smart Watch' }],
        },
    ];

    for (const product of products) {
        const res = await fetchJSON(`${API}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify(product),
        });

        if (res.success) {
            console.log(`  ✅ Created: ${product.name}`);
        } else {
            console.log(`  ⚠️  ${product.name}: ${res.error || 'already exists or admin role required'}`);
        }
    }

    console.log('\n🎉 Seed complete!');
    console.log('\nIMPORTANT: To create products, update admin role in DB first:');
    console.log("  docker exec ecommerce-postgres psql -U ecommerce -c \"UPDATE users SET role='admin' WHERE email='admin@example.com';\"");
    console.log('\nThen re-run this script.');
}

seed().catch(console.error);
