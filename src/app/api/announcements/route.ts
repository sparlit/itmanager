import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announcements = await prisma.$queryRaw`
      SELECT * FROM "Announcement"
      WHERE ("isActive" = true AND ("expiresAt" IS NULL OR "expiresAt" > NOW()))
      AND ("targetRoles" IS NULL OR "targetRoles" LIKE '%' || ${user.role} || '%')
      ORDER BY "createdAt" DESC
      LIMIT 20
    `;

    return NextResponse.json({ announcements });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch announcements", details: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, priority, targetRoles, expiresAt } = body;

    const id = `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.$queryRaw`
      INSERT INTO "Announcement" (id, title, content, priority, "targetRoles", "isActive", "createdBy", "createdAt", "expiresAt")
      VALUES (${id}, ${title}, ${content}, ${priority || 'normal'}, ${targetRoles || null}, true, ${user.userId}, NOW(), ${expiresAt || null})
    `;

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to create announcement", details: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, priority, targetRoles, isActive, expiresAt } = body;

    await prisma.$queryRaw`
      UPDATE "Announcement" SET
        title = COALESCE(${title}, title),
        content = COALESCE(${content}, content),
        priority = COALESCE(${priority}, priority),
        "targetRoles" = COALESCE(${targetRoles}, "targetRoles"),
        "isActive" = COALESCE(${isActive}, "isActive"),
        "expiresAt" = ${expiresAt}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to update announcement", details: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }

    await prisma.$queryRaw`DELETE FROM "Announcement" WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to delete announcement", details: msg }, { status: 500 });
  }
}
