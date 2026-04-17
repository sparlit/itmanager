import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "it_auth";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars"
);

export interface AuthTokenPayload extends JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: { userId: string; username: string; role: string }): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

// Route definitions
export const PUBLIC_PAGE_PREFIXES = ["/landing", "/login", "/services", "/it-services"];
export const PUBLIC_API_PATHS = new Set([
  "/api/auth",
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/logout",
]);

export const PUBLIC_API_PREFIXES = [
  "/api/business",
  "/api/chat",
  "/api/complaints",
  "/api/customers",
  "/api/feedback",
  "/api/orders",
];

export function isPublicPage(pathname: string) {
  if (pathname === "/" || pathname === "/landing") return true;
  return PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isPublicApi(pathname: string) {
  return PUBLIC_API_PATHS.has(pathname) || PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isProtectedPage(pathname: string) {
  return pathname.startsWith("/portal") || pathname.startsWith("/internal") || pathname.startsWith("/admin");
}

export function isProtectedApi(pathname: string) {
  return pathname.startsWith("/api/") && !isPublicApi(pathname);
}
