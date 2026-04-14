import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.vendor !== undefined) updateData.vendor = data.vendor;
    if (data.licenseKey !== undefined) updateData.licenseKey = data.licenseKey;
    if (data.licenseType !== undefined) updateData.licenseType = data.licenseType;
    if (data.totalSeats !== undefined) updateData.totalSeats = data.totalSeats;
    if (data.usedSeats !== undefined) updateData.usedSeats = data.usedSeats;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null;
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    if (data.autoRenew !== undefined) updateData.autoRenew = data.autoRenew;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const license = await db.softwareLicense.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ license });
  } catch {
    return NextResponse.json({ error: "Failed to update license", details: "An internal error occurred" }, { status: 500 });
  }
}
