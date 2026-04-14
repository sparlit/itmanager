import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { authRateLimitMiddleware, rateLimitMiddleware } from "@/lib/rate-limit";
import { errorResponse, validationError, unauthorized } from "@/lib/error";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimit = authRateLimitMiddleware(req);
  if (rateLimit) return rateLimit;

  try {
    const body = await req.json();
    const { username, password } = loginSchema.parse(body);

    const user = await db.user.findUnique({ where: { username } });

    if (!user) {
      logger.warn({ username }, 'Login attempt with invalid username');
      return errorResponse("Invalid username or password", 401);
    }

    if (!user.isActive) {
      return errorResponse("Account is disabled", 403);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return errorResponse(`Account locked. Try again in ${minutesLeft} minutes`, 423);
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      const failedAttempts = user.failedAttempts + 1;
      const updates: Record<string, unknown> = { failedAttempts };

      if (failedAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await db.user.update({ where: { id: user.id }, data: updates });
      logger.warn({ username, failedAttempts }, 'Failed login attempt');

      return errorResponse(
        failedAttempts >= 5 ? "Too many failed attempts. Account locked for 30 minutes" : "Invalid username or password",
        401
      );
    }

    // Successful login
    await db.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null, lastLogin: new Date() },
    });

    const token = await createToken({ userId: user.id, username: user.username, role: user.role });
    await setAuthCookie(token);

    logger.info({ userId: user.id, username: user.username }, 'User logged in');

    return NextResponse.json({
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return validationError(err);
    }
    logger.error({ err }, 'Login error');
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimit = rateLimitMiddleware(req);
  if (rateLimit) return rateLimit;

  // Create default admin if no users exist
  const count = await db.user.count();
  if (count === 0) {
    const hash = await hashPassword("admin123");
    await db.user.create({
      data: {
        username: "admin",
        email: "admin@itmanager.local",
        passwordHash: hash,
        name: "System Administrator",
        role: "admin",
      },
    });
    logger.info({}, 'Default admin user created');
  }
  return NextResponse.json({ message: "Auth service ready" });
}
