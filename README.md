# 🛒 Ecommerce Microservices — Production Build

A fully production-ready ecommerce platform built with 7 independent microservices, a Next.js 14 frontend, and a complete DevOps setup.

## Architecture

```
Client (Next.js 14)
        │
   [ API Gateway :3000 ]  ← JWT Auth, Rate Limiting, Routing
        │
  ┌─────┼───────────────────────────────────┐
  │     │                                   │
Auth  User  Product  Order  Payment  Notification
:4001 :4002  :4003  :4004   :4005     :4006
  │     │      │      │       │           │
  └──PostgreSQL──┘  MongoDB  Redis ──────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v3 |
| API Gateway | Node.js + Express + http-proxy-middleware |
| Backend Services | Node.js + Express + TypeScript |
| Databases | PostgreSQL 16, MongoDB 7, Redis 7 |
| Payments | Stripe Payment Intents + Webhooks |
| Email | Resend |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions → GitHub Container Registry |

## Quick Start

### 1. Clone and configure

```bash
git clone <your-repo>
cd microservices-ecommerce
cp .env.example .env
```

### 2. Fill in `.env` values

At minimum for local development, set:
```bash
JWT_SECRET=your_random_32char_secret_here_abc123
JWT_REFRESH_SECRET=another_random_32char_secret_xyz789
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
RESEND_API_KEY=re_your_resend_key   # Optional — emails print to console if missing
```

> **All databases (PostgreSQL, MongoDB, Redis) run locally via Docker — no external accounts needed.**

### 3. Run everything

```bash
docker compose up --build
```

Services start at:
| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| API Gateway | http://localhost:3000 |
| PostgreSQL | localhost:5432 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

## API Reference

### Auth Service
```bash
POST /api/auth/register   { email, password }
POST /api/auth/login      { email, password }
POST /api/auth/refresh    { refreshToken }
GET  /api/auth/me         (requires Bearer token)
```

### Products
```bash
GET  /api/products                          (pagination, search, filter, sort)
GET  /api/products/:id
GET  /api/products/category/:category
POST /api/products         (admin only)     { name, price, category, inventory, ... }
PUT  /api/products/:id     (admin only)
DEL  /api/products/:id     (admin only — soft delete)
```

### Orders
```bash
POST /api/orders           (auth required)  { items, total, address }
GET  /api/orders/my-orders (auth required)
GET  /api/orders/:id       (auth required)
PUT  /api/orders/:id/status (admin only)    { status, trackingNumber? }
```

### Payments
```bash
POST /api/payments/intent  (auth required)  { orderId, amount, currency }
POST /api/payments/webhook                  (Stripe only — raw body)
```

### Users
```bash
GET  /api/users/profile    (auth required)
PUT  /api/users/profile    (auth required)
GET  /api/users/addresses  (auth required)
POST /api/users/addresses  (auth required)
DEL  /api/users/addresses/:id (auth required)
```

## Seeding Demo Data

```bash
# Create an admin user (update credentials in seed script first)
node scripts/seed.js
```

## Testing Payments (Stripe Test Mode)

Use these test card numbers:
| Card | Description |
|---|---|
| `4242 4242 4242 4242` | Always succeeds |
| `4000 0000 0000 0002` | Always declines |
| `4000 0025 0000 3155` | 3D Secure required |

Use any future expiry date and any 3-digit CVV.

## Production Deployment

### Railway.app (Recommended)
1. Push repository to GitHub
2. Connect to Railway and import repo
3. Add each service as a separate Railway service
4. Add PostgreSQL, MongoDB, and Redis plugins
5. Set environment variables from `.env.example`
6. Railway auto-deploys on every push to main

### Docker Deployment
```bash
# Build all images
docker compose build

# Tag and push to registry
docker tag ecommerce-auth-service your-registry/auth-service:latest
docker push your-registry/auth-service:latest

# On production server
docker compose -f docker-compose.prod.yml up -d
```

## Project Structure

```
microservices-ecommerce/
├── services/
│   ├── api-gateway/        # Port 3000 — JWT Auth + Routing
│   ├── auth-service/       # Port 4001 — Register/Login/JWT
│   ├── user-service/       # Port 4002 — Profiles/Addresses
│   ├── product-service/    # Port 4003 — MongoDB Catalog
│   ├── order-service/      # Port 4004 — Checkout/Orders
│   ├── payment-service/    # Port 4005 — Stripe Payments
│   └── notification-service/ # Port 4006 — Email Events
├── frontend/               # Next.js 14 App Router
├── packages/shared/        # Shared TypeScript types + utils
├── .github/workflows/      # GitHub Actions CI/CD
├── docker-compose.yml
└── .env.example
```

## Environment Variables

See [`.env.example`](./.env.example) for all required variables.

## License

MIT
# ecommerce-microservices
