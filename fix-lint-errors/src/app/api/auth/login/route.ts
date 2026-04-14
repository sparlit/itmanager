import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword, createToken, setAuthCookie } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json({ error: `Account locked. Try again in ${minutesLeft} minutes` }, { status: 423 });
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      const failedAttempts = user.failedAttempts + 1;
      const updates: Record<string, unknown> = { failedAttempts };

      if (failedAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
      }

      await prisma.user.update({ where: { id: user.id }, data: updates });

      return NextResponse.json(
        { error: failedAttempts >= 5 ? "Too many failed attempts. Account locked for 30 minutes" : "Invalid credentials" },
        { status: 401 }
      );
    }

    // Successful login
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null, lastLogin: new Date() },
    });

    const token = await createToken({ userId: user.id, username: user.username, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  // Create default admin if no users exist
  const count = await prisma.user.count();
  if (count === 0) {
    const hash = await hashPassword("admin123");
    await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@itmanager.local",
        passwordHash: hash,
        name: "System Administrator",
        role: "admin",
      },
    });
  }
  return NextResponse.json({ message: "Auth service ready" });
}
