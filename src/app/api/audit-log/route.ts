import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity");
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (startDate || endDate) {
      const createdAt: { gte?: Date; lte?: Date } = {};
      if (startDate) createdAt.gte = new Date(startDate);
      if (endDate) createdAt.lte = new Date(endDate);
      where.createdAt = createdAt;
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.auditLog.count({ where }),
    ]);

    const actionCounts: Record<string, number> = {};
    const entityCounts: Record<string, number> = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      entityCounts[log.entity] = (entityCounts[log.entity] || 0) + 1;
    });

    return NextResponse.json({
      logs,
      summary: {
        total,
        byAction: actionCounts,
        byEntity: entityCounts,
      },
      pagination: { total, limit, offset },
    });
  } catch (err) {
    console.error("Audit log error:", err);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entity, action, details, entityId, oldValue, newValue } = await request.json();

    const auditEntry = await db.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.username,
        action: action || "custom",
        entity: entity || "system",
        entityId: entityId || "",
        details: typeof details === "string" ? details : JSON.stringify(details || {}),
        oldValue: oldValue || "",
        newValue: newValue || "",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true, log: auditEntry });
  } catch (err) {
    console.error("Audit log create error:", err);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}
