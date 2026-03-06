import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/account', '/orders', '/checkout'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    if (!isProtected) return NextResponse.next();

    // Check for auth token in cookies or headers
    // Since we use localStorage (client-side), redirect unauthenticated users
    // will be handled client-side. Middleware adds an extra layer for SSR routes.
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*', '/orders/:path*', '/checkout/:path*'],
};
