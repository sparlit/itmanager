import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { unauthorized, forbidden, serverError, errorResponse } from "@/lib/error";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return unauthorized();
    if (err.message?.includes("Forbidden")) return forbidden();
    console.error("GET users error:", err);
    return serverError("Failed to fetch users");
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { username, email, name, role, password, isActive } = await req.json();

    if (!username || !email || !name || !password) {
      return errorResponse("All fields are required", 400);
    }

    const existing = await db.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existing) {
      return errorResponse("Username or email already exists", 400);
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.user.create({
      data: { username, email, name, role: role || "user", passwordHash, isActive: isActive ?? true },
    });

    return NextResponse.json({ user: { id: newUser.id, username: newUser.username, email: newUser.email, name: newUser.name, role: newUser.role } });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return unauthorized();
    if (err.message?.includes("Forbidden")) return forbidden();
    console.error("POST user error:", err);
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();

    const { id, username, email, name, role, password, isActive } = await req.json();

    if (!id) {
      return errorResponse("User ID is required", 400);
    }

    const updateData: Record<string, unknown> = { email, name, role, isActive };
    
    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ user: { id: updated.id, username: updated.username, email: updated.email, name: updated.name, role: updated.role } });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return unauthorized();
    if (err.message?.includes("Forbidden")) return forbidden();
    console.error("PUT user error:", err);
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("User ID is required", 400);
    }

    if (id === user.userId) {
      return errorResponse("Cannot delete yourself", 400);
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return unauthorized();
    if (err.message?.includes("Forbidden")) return forbidden();
    console.error("DELETE user error:", err);
    return serverError("Failed to delete user");
  }
}
