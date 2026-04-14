import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth-token";

const PUBLIC_PAGE_PREFIXES = ["/landing", "/login", "/services", "/it-services"];
const PUBLIC_API_PATHS = new Set([
  "/api/auth",
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/logout",
]);

const PUBLIC_API_PREFIXES = [
  "/api/business",
  "/api/chat",
  "/api/complaints",
  "/api/customers",
  "/api/feedback",
  "/api/orders",
];

function isPublicPage(pathname: string) {
  return PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PATHS.has(pathname) || PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedPage(pathname: string) {
  return pathname.startsWith("/portal") || pathname.startsWith("/internal") || pathname.startsWith("/admin");
}

function isProtectedApi(pathname: string) {
  return pathname.startsWith("/api/") && !isPublicApi(pathname);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtectedPage(pathname) && !isProtectedApi(pathname)) {
    return NextResponse.next();
  }

  if (isPublicPage(pathname) || isPublicApi(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth-token")?.value;
  const user = token ? await verifyAuthToken(token) : null;

  if (user) {
    return NextResponse.next();
  }

  if (isProtectedApi(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/landing";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/portal/:path*", "/internal/:path*", "/admin/:path*", "/api/:path*"],
};
