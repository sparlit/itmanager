import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.changeType !== undefined) updateData.changeType = data.changeType;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.riskLevel !== undefined) updateData.riskLevel = data.riskLevel;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.implementationPlan !== undefined) updateData.implementationPlan = data.implementationPlan;
    if (data.rollbackPlan !== undefined) updateData.rollbackPlan = data.rollbackPlan;
    if (data.impactAnalysis !== undefined) updateData.impactAnalysis = data.impactAnalysis;
    if (data.requestedByName !== undefined) updateData.requestedByName = data.requestedByName;
    if (data.approvedBy !== undefined) updateData.approvedBy = data.approvedBy;
    if (data.approvedByName !== undefined) updateData.approvedByName = data.approvedByName;
    if (data.approvedAt !== undefined) updateData.approvedAt = data.approvedAt ? new Date(data.approvedAt) : null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.affectedAssets !== undefined) updateData.affectedAssets = data.affectedAssets;
    if (data.scheduledStart !== undefined) updateData.scheduledStart = data.scheduledStart ? new Date(data.scheduledStart) : null;
    if (data.scheduledEnd !== undefined) updateData.scheduledEnd = data.scheduledEnd ? new Date(data.scheduledEnd) : null;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;

    const change = await db.changeRequest.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ change });
  } catch {
    return NextResponse.json({ error: "Failed to update change request", details: "An internal error occurred" }, { status: 500 });
  }
}
