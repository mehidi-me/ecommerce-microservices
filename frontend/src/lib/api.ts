import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

import Cookies from 'js-cookie';

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            Cookies.remove('accessToken');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// API helpers
export const authApi = {
    register: (data: { email: string; password: string }) =>
        api.post('/api/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/api/auth/login', data),
    me: () => api.get('/api/auth/me'),
};

export const productsApi = {
    list: (params?: Record<string, string | number>) =>
        api.get('/api/products', { params }),
    get: (id: string) => api.get(`/api/products/${id}`),
    category: (category: string, params?: Record<string, string | number>) =>
        api.get(`/api/products/category/${category}`, { params }),
    create: (data: unknown) => api.post('/api/products', data),
    update: (id: string, data: unknown) => api.put(`/api/products/${id}`, data),
    delete: (id: string) => api.delete(`/api/products/${id}`),
};

export const ordersApi = {
    create: (data: unknown) => api.post('/api/orders', data),
    myOrders: (params?: Record<string, string | number>) =>
        api.get('/api/orders/my-orders', { params }),
    get: (id: string) => api.get(`/api/orders/${id}`),
    updateStatus: (id: string, data: { status: string; trackingNumber?: string }) =>
        api.put(`/api/orders/${id}/status`, data),
};

export const paymentsApi = {
    createIntent: (data: { orderId: string; amount: number; currency?: string }) =>
        api.post('/api/payments/intent', data),
};

export const usersApi = {
    getProfile: () => api.get('/api/users/profile'),
    updateProfile: (data: unknown) => api.put('/api/users/profile', data),
    getAddresses: () => api.get('/api/users/addresses'),
    addAddress: (data: unknown) => api.post('/api/users/addresses', data),
    deleteAddress: (id: string) => api.delete(`/api/users/addresses/${id}`),
};
