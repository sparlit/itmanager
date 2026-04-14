import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, category, tags, author, status } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (author !== undefined) updateData.author = author;
    if (status !== undefined) updateData.status = status;

    const article = await db.knowledgeBaseArticle.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}
