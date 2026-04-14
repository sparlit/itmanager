import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status && status !== "All") where.status = status;
    if (category && category !== "All") where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { requestedByName: { contains: search } },
      ];
    }

    const changes = await db.changeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json({ changes });
  } catch {
    return NextResponse.json({ error: "Failed to fetch changes", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const change = await db.changeRequest.create({
      data: {
        title: body.title,
        description: body.description,
        changeType: body.changeType || "Standard",
        priority: body.priority || "Medium",
        riskLevel: body.riskLevel || "Low",
        status: body.status || "Draft",
        reason: body.reason || "",
        implementationPlan: body.implementationPlan || "",
        rollbackPlan: body.rollbackPlan || "",
        impactAnalysis: body.impactAnalysis || "",
        requestedByName: body.requestedByName || "",
        category: body.category || "Infrastructure",
        affectedAssets: body.affectedAssets || "",
        scheduledStart: body.scheduledStart ? new Date(body.scheduledStart) : null,
        scheduledEnd: body.scheduledEnd ? new Date(body.scheduledEnd) : null,
      },
    });

    return NextResponse.json({ change }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create change request", details: "An internal error occurred" }, { status: 500 });
  }
}
