// PUT /api/assets/update?id=<assetId> - Update an asset

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      serialNumber,
      category,
      status,
      condition,
      purchaseDate,
      purchaseCost,
      warrantyEnd,
      vendor,
      location,
      notes,
    } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (serialNumber !== undefined) data.serialNumber = serialNumber;
    if (category !== undefined) data.category = category;
    if (status !== undefined) data.status = status;
    if (condition !== undefined) data.condition = condition;
    if (purchaseDate !== undefined)
      data.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
    if (purchaseCost !== undefined) data.purchaseCost = purchaseCost ?? null;
    if (warrantyEnd !== undefined)
      data.warrantyEnd = warrantyEnd ? new Date(warrantyEnd) : null;
    if (vendor !== undefined) data.vendor = vendor || null;
    if (location !== undefined) data.location = location || null;
    if (notes !== undefined) data.notes = notes || null;

    const asset = await db.asset.update({
      where: { id },
      data,
      include: {
        assignments: {
          include: { staff: { select: { name: true } } },
          orderBy: { assignedAt: "desc" },
        },
        maintenance: {
          orderBy: { performedAt: "desc" },
        },
      },
    });

    return NextResponse.json(asset);
  } catch {
    return NextResponse.json(
      { error: "Failed to update asset", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
