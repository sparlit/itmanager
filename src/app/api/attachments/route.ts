import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const attachments = await db.attachment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ attachments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const attachment = await db.attachment.create({
      data: {
        fileName: body.fileName,
        originalName: body.originalName || body.fileName,
        mimeType: body.mimeType || "application/octet-stream",
        size: body.size || 0,
        path: body.path || "",
        entityType: body.entityType,
        entityId: body.entityId,
        uploadedBy: body.uploadedBy || "",
        uploadedByName: body.uploadedByName || "",
      },
    });
    return NextResponse.json({ attachment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create attachment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "Attachment ID is required" }, { status: 400 });
    await db.attachment.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}
