import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const changeId = searchParams.get("changeId");
    if (!changeId) return NextResponse.json({ error: "changeId is required" }, { status: 400 });

    const comments = await db.changeComment.findMany({
      where: { changeId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { changeId, authorName, content } = body;
    if (!changeId || !authorName || !content) {
      return NextResponse.json({ error: "changeId, authorName, and content are required" }, { status: 400 });
    }

    const comment = await db.changeComment.create({
      data: { changeId, authorId: "system", authorName, content },
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add comment", details: "An internal error occurred" }, { status: 500 });
  }
}
