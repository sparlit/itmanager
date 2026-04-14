import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");
    const staffId = searchParams.get("staffId");

    const where: Record<string, unknown> = {};
    if (ticketId) where.ticketId = ticketId;
    if (staffId) where.staffId = staffId;

    const entries = await db.timeEntry.findMany({
      where,
      orderBy: { startTime: "desc" },
    });

    const totalDuration = entries.reduce((sum, e) => sum + (e.duration || 0), 0);

    return NextResponse.json({ entries, totalDuration });
  } catch {
    return NextResponse.json({ error: "Failed to fetch time entries", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const startTime = new Date(body.startTime);
    const endTime = body.endTime ? new Date(body.endTime) : null;
    const duration = endTime ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) : null;

    const entry = await db.timeEntry.create({
      data: {
        ticketId: body.ticketId || null,
        staffId: body.staffId || null,
        staffName: body.staffName || "",
        description: body.description,
        startTime,
        endTime,
        duration,
        billable: body.billable || false,
        category: body.category || "Work",
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create time entry", details: "An internal error occurred" }, { status: 500 });
  }
}
