import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware handles requests for Vite client and other non-existent resources
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect from root to landing page instead of auth/login
  if (pathname === '/') {
    // Don't redirect if there's already an access token (user is logged in)
    const hasToken = request.cookies.has('accessToken') || request.headers.get('authorization');
    if (!hasToken) {
      // This will show the landing page instead of redirecting to login
      return NextResponse.next();
    }
  }

  // Handle Vite client requests that might be coming from browser extensions or other sources
  if (pathname.startsWith('/@vite/client') || pathname.includes('vite')) {
    // Return empty response with 200 status to prevent console errors
    return new NextResponse(null, { status: 200 });
  }

  // Continue normal request processing for all other requests
  return NextResponse.next();
}

// Configure middleware to run only for specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};