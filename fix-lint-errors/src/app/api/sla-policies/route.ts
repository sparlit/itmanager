import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const policies = await db.sLAPolicy.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ policies });
  } catch {
    return NextResponse.json({ error: "Failed to fetch SLA policies", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const policy = await db.sLAPolicy.create({
      data: {
        name: body.name,
        description: body.description || "",
        category: body.category || "All",
        priority: body.priority || "All",
        responseTime: body.responseTime || 60,
        resolutionTime: body.resolutionTime || 480,
        escalationTime: body.escalationTime || 240,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });
    return NextResponse.json({ policy }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create SLA policy", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.responseTime !== undefined) updateData.responseTime = data.responseTime;
    if (data.resolutionTime !== undefined) updateData.resolutionTime = data.resolutionTime;
    if (data.escalationTime !== undefined) updateData.escalationTime = data.escalationTime;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const policy = await db.sLAPolicy.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ policy });
  } catch {
    return NextResponse.json({ error: "Failed to update SLA policy", details: "An internal error occurred" }, { status: 500 });
  }
}
