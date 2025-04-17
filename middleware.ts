import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Don't rewrite requests to the .well-known directory
  if (request.nextUrl.pathname.startsWith('/.well-known')) {
    return NextResponse.next();
  }

  // Continue with default behavior for other routes
  return NextResponse.next();
}

// Specify paths this middleware will run for
export const config = {
  matcher: [
    // Apply this middleware to all paths
    '/(.*)',
  ],
}; 