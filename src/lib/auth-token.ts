import { jwtVerify, type JWTPayload } from "jose";

export interface AuthTokenPayload extends JWTPayload {
  userId: string;
  username: string;
  role: string;
}

function getJwtSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars"
  );
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}
