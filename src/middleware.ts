import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL("/links", request.url));
  } else {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }
}

export const config = {
  matcher: ['/'],
}