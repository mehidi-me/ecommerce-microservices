'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export interface AuthUser {
    id: string;
    email: string;
    role: 'customer' | 'admin';
}

interface AuthStore {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,

            setAuth: (user, accessToken, refreshToken) => {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                Cookies.set('accessToken', accessToken, { expires: 1 }); // Expires in 1 day
                set({ user, accessToken, refreshToken });
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                Cookies.remove('accessToken');
                set({ user: null, accessToken: null, refreshToken: null });
            },

            isAuthenticated: () => !!get().accessToken && !!get().user,
            isAdmin: () => get().user?.role === 'admin',
        }),
        { name: 'ecommerce-auth', partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken }) }
    )
);
