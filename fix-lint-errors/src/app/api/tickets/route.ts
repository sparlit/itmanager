// GET /api/tickets - List tickets with optional filters (status, priority, category, search)
// POST /api/tickets - Create a new ticket

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, any> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { reportedByName: { contains: search } },
      ];
    }

    const tickets = await db.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { name: true } },
        assignee: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({ tickets });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tickets", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      priority,
      category,
      reportedByName,
      reportedById,
      reportedFromDepartment,
      reportDate,
      reportTime,
      assignedToName,
      assignedToId,
    } = body;

    // If a staff ID was selected via combobox, use it; otherwise try to match by name
    let reporterId = reportedById || null;
    if (!reporterId && reportedByName) {
      const match = await db.staff.findFirst({
        where: { name: { equals: reportedByName } },
        select: { id: true },
      });
      reporterId = match?.id || null;
    }

    // Same for assigned to
    let assigneeId = assignedToId || null;
    if (!assigneeId && assignedToName) {
      const match = await db.staff.findFirst({
        where: { name: { equals: assignedToName } },
        select: { id: true },
      });
      assigneeId = match?.id || null;
    }

    const ticket = await db.ticket.create({
      data: {
        title,
        description,
        priority,
        category,
        reportedBy: reporterId,
        reportedByName: reportedByName || "",
        reportedFromDepartment: reportedFromDepartment || "",
        reportDate: reportDate || "",
        reportTime: reportTime || "",
        assignedTo: assigneeId,
        assignedToName: assignedToName || null,
      },
      include: {
        reporter: { select: { name: true } },
        assignee: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create ticket", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
