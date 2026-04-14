// POST /api/assets/assign - Assign an asset to a staff member
// PUT /api/assets/assign?assignmentId=<id> - Return (unassign) an asset

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, staffId, notes } = body;

    if (!assetId || !staffId) {
      return NextResponse.json(
        { error: "assetId and staffId are required" },
        { status: 400 }
      );
    }

    // Check if asset is already assigned
    const existing = await db.assetAssignment.findFirst({
      where: { assetId, returnedAt: null },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Asset is already assigned to someone" },
        { status: 400 }
      );
    }

    const assignment = await db.assetAssignment.create({
      data: {
        assetId,
        staffId,
        notes: notes || null,
      },
      include: {
        asset: { select: { name: true, serialNumber: true } },
        staff: { select: { name: true } },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to assign asset", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignmentId is required" },
        { status: 400 }
      );
    }

    const assignment = await db.assetAssignment.update({
      where: { id: assignmentId },
      data: { returnedAt: new Date() },
      include: {
        asset: { select: { name: true, serialNumber: true } },
        staff: { select: { name: true } },
      },
    });

    // Update asset status back to Available
    await db.asset.update({
      where: { id: assignment.assetId },
      data: { status: "Available" },
    });

    return NextResponse.json(assignment);
  } catch {
    return NextResponse.json(
      { error: "Failed to return asset", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
