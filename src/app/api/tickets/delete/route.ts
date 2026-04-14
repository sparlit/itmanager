import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // Delete comments first (cascade), then the ticket
    await db.ticketComment.deleteMany({ where: { ticketId: id } });
    await db.ticket.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete ticket", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
