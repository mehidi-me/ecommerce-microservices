// Shared types used across all microservices

export interface JWTPayload {
    userId: string;
    email: string;
    role: 'customer' | 'admin';
    iat?: number;
    exp?: number;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface User {
    id: string;
    email: string;
    role: 'customer' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
}

export interface Address {
    id: string;
    userId: string;
    label: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
}

export interface ProductVariant {
    name: string;
    options: string[];
}

export interface ProductImage {
    url: string;
    alt: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice?: number;
    category: string;
    images: ProductImage[];
    variants: ProductVariant[];
    inventory: number;
    isActive: boolean;
    tags: string[];
    ratings: {
        average: number;
        count: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
    variant?: Record<string, string>;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'payment_failed';

export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    total: number;
    currency: string;
    address: ShippingAddress;
    items?: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

// Event types for Redis Pub/Sub
export interface OrderCreatedEvent {
    orderId: string;
    userId: string;
    userEmail: string;
    total: number;
    currency: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    address: ShippingAddress;
}

export interface PaymentSuccessEvent {
    orderId: string;
    userId: string;
    userEmail: string;
    total: number;
    currency: string;
    paymentIntentId: string;
}

export interface PaymentFailedEvent {
    orderId: string;
    userId: string;
    userEmail: string;
    paymentIntentId: string;
}

export interface OrderShippedEvent {
    orderId: string;
    userId: string;
    userEmail: string;
    trackingNumber?: string;
}

export interface UserRegisteredEvent {
    userId: string;
    email: string;
    firstName?: string;
}

export const EVENTS = {
    ORDER_CREATED: 'order.created',
    PAYMENT_SUCCESS: 'payment.success',
    PAYMENT_FAILED: 'payment.failed',
    ORDER_SHIPPED: 'order.shipped',
    ORDER_DELIVERED: 'order.delivered',
    USER_REGISTERED: 'user.registered',
} as const;
