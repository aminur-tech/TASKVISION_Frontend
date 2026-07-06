import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Intercept all outgoing /api requests
  if (pathname.startsWith('/api')) {
    
    // Upstream Django server URL
    const BACKEND_URL = 'http://localhost:8000'; // Using IP avoids local DNS resolution delays
    
    // Construct the destination URL while preserving subpaths and search query parameters
    const targetUrl = `${BACKEND_URL}${pathname}${search}`;

    // Clone headers to pass down authentication tokens and client contexts safely
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-forwarded-host', request.nextUrl.host);

    // Return a transparent Edge Rewrite (masks the destination port from the client browser)
    return NextResponse.rewrite(new URL(targetUrl, request.url), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Pass through static pages, assets, and UI components untouched
  return NextResponse.next();
}

// Optimization: Strictly isolate edge engine runtime executions to actual API strings
export const config = {
  matcher: [
    '/tasks/:path*',
    '/annotations/:path*',
    '/api/:path*',
  ],
};