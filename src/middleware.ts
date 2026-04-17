import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyToken,
  AUTH_COOKIE_NAME,
  isPublicPage,
  isPublicApi,
  isProtectedPage,
  isProtectedApi
} from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static files and internal Next.js paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If it's not a protected page or API, we don't need to check auth
  if (!isProtectedPage(pathname) && !isProtectedApi(pathname)) {
    return NextResponse.next();
  }

  // If it's explicitly public, allow it
  if (isPublicPage(pathname) || isPublicApi(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (user) {
    return NextResponse.next();
  }

  // If not authenticated, handle based on whether it's an API or page
  if (isProtectedApi(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/landing";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
