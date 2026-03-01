import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

const authRoutes = ['/login', '/register'];

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

    const session = await getSession();

    // Redirect logged-in users away from auth pages
    if (isAuthRoute && session) {
        if (session.role === 'ADMIN' || session.role === 'TRAINER') {
            return NextResponse.redirect(new URL('/admin', request.nextUrl));
        } else {
            return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
        }
    }

    // Protect /admin routes
    if (path.startsWith('/admin')) {
        if (!session) return NextResponse.redirect(new URL('/login', request.nextUrl));
        if (session.role !== 'ADMIN' && session.role !== 'TRAINER') {
            return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
        }
    }

    // Protect /dashboard routes (Customer)
    if (path.startsWith('/dashboard')) {
        if (!session) return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    // API Route protection (Admin only endpoints)
    if (path.startsWith('/api/members')) {
        if (!session) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        if (session.role !== 'ADMIN' && session.role !== 'TRAINER') {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
