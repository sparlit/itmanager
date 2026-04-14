// GET /api/tickets/comments?ticketId=<id> - List comments for a ticket (ordered by createdAt asc)
// POST /api/tickets/comments - Create a new comment on a ticket

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json(
        { error: "ticketId is required" },
        { status: 400 }
      );
    }

    const comments = await db.ticketComment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch comments", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, authorId, authorName, content, isInternal } = body;

    const comment = await db.ticketComment.create({
      data: {
        ticketId,
        authorId,
        authorName,
        content,
        isInternal: isInternal ?? false,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create comment", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
