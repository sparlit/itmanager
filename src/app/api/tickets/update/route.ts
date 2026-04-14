// PUT /api/tickets/update?id=<ticketId> - Update a ticket
// Automatically sets resolvedAt/closedAt based on status changes

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, assignedTo, resolvedAt, closedAt } = body;

    // Build update data with auto-set timestamps
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (assignedTo !== undefined) data.assignedTo = assignedTo || null;
    if (resolvedAt !== undefined) data.resolvedAt = resolvedAt ? new Date(resolvedAt) : null;
    if (closedAt !== undefined) data.closedAt = closedAt ? new Date(closedAt) : null;

    // Auto-set resolvedAt when status changes to "Resolved"
    if (status === "Resolved" && !data.resolvedAt) {
      data.resolvedAt = new Date();
    }
    // Auto-set closedAt when status changes to "Closed"
    if (status === "Closed" && !data.closedAt) {
      data.closedAt = new Date();
    }

    const ticket = await db.ticket.update({
      where: { id },
      data,
      include: {
        reporter: { select: { name: true } },
        assignee: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json(
      { error: "Failed to update ticket", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
