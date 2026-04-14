// GET /api/knowledge-base - List articles with optional search and category filters
// POST /api/knowledge-base - Create a new article
// PUT /api/knowledge-base - Increment views or read article

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (category && category !== "All") {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { tags: { contains: search } },
        { author: { contains: search } },
      ];
    }

    const articles = await db.knowledgeBaseArticle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, tags, author, status } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const article = await db.knowledgeBaseArticle.create({
      data: {
        title: title.trim(),
        content: content || "",
        category: category || "General",
        tags: tags || "",
        author: author || "",
        status: status || "Published",
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, incrementViews } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (incrementViews) {
      updateData.views = { increment: 1 };
    }

    const article = await db.knowledgeBaseArticle.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}
