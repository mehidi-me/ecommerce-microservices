export interface JWTPayload {
    userId: string;
    email: string;
    role: 'customer' | 'admin';
}
