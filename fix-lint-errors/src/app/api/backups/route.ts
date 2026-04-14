import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && status !== "All") where.status = status;

    const backups = await db.backupRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const successful = backups.filter((b) => b.status === "Completed").length;
    const failed = backups.filter((b) => b.status === "Failed").length;
    const lastBackup = backups.length > 0 ? backups[0] : null;

    return NextResponse.json({ backups, successful, failed, lastBackup });
  } catch {
    return NextResponse.json({ error: "Failed to fetch backups", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backup = await db.backupRecord.create({
      data: {
        name: body.name || `Backup ${new Date().toISOString().split("T")[0]}`,
        type: body.type || "Manual",
        status: body.status || "Pending",
        location: body.location || "",
        notes: body.notes || "",
      },
    });
    return NextResponse.json({ backup }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create backup record", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.size !== undefined) updateData.size = data.size;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const backup = await db.backupRecord.update({ where: { id }, data: updateData });
    return NextResponse.json({ backup });
  } catch {
    return NextResponse.json({ error: "Failed to update backup", details: "An internal error occurred" }, { status: 500 });
  }
}
