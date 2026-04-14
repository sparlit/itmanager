import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get('it_auth')?.value
  return cookie === 'true'
}

function getRole(req: NextRequest): string | null {
  return req.cookies.get('it_role')?.value ?? null
}

function isAuthorized(req: NextRequest): boolean {
  const role = getRole(req)
  return isAuth(req) && (role === 'admin' || role === 'tech')
}

function isAdmin(req: NextRequest): boolean {
  const role = getRole(req)
  return role === 'admin'
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  if (url.pathname.startsWith('/internal')) {
    if (!isAuthorized(req)) {
      url.pathname = '/internal/login'
      return NextResponse.redirect(url)
    }
    // Admin-only routes guard
    if (url.pathname.startsWith('/internal/admin')) {
      if (!isAdmin(req)) {
        url.pathname = '/internal/login'
        return NextResponse.redirect(url)
      }
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/internal/:path*'
}
