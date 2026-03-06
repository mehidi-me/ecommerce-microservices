'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    salePrice?: number;
    quantity: number;
    image?: string;
    variant?: Record<string, string>;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string, variant?: Record<string, string>) => void;
    updateQuantity: (productId: string, quantity: number, variant?: Record<string, string>) => void;
    clearCart: () => void;
    total: () => number;
    itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem) => {
                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (i) =>
                            i.productId === newItem.productId &&
                            JSON.stringify(i.variant) === JSON.stringify(newItem.variant)
                    );
                    if (existingIndex >= 0) {
                        const items = [...state.items];
                        items[existingIndex] = {
                            ...items[existingIndex],
                            quantity: items[existingIndex].quantity + newItem.quantity,
                        };
                        return { items };
                    }
                    return { items: [...state.items, newItem] };
                });
            },

            removeItem: (productId, variant) => {
                set((state) => ({
                    items: state.items.filter(
                        (i) =>
                            !(
                                i.productId === productId &&
                                JSON.stringify(i.variant) === JSON.stringify(variant)
                            )
                    ),
                }));
            },

            updateQuantity: (productId, quantity, variant) => {
                if (quantity <= 0) {
                    get().removeItem(productId, variant);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.productId === productId &&
                            JSON.stringify(i.variant) === JSON.stringify(variant)
                            ? { ...i, quantity }
                            : i
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            total: () =>
                get().items.reduce(
                    (sum, item) => sum + (item.salePrice ?? item.price) * item.quantity,
                    0
                ),

            itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
        }),
        { name: 'ecommerce-cart' }
    )
);
