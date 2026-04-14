// PUT /api/inventory/update?id=<itemId> - Update an inventory item

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      category,
      sku,
      quantity,
      minStockLevel,
      unitPrice,
      supplier,
      location,
      lastRestocked,
      notes,
    } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (sku !== undefined) data.sku = sku;
    if (quantity !== undefined) data.quantity = quantity;
    if (minStockLevel !== undefined) data.minStockLevel = minStockLevel;
    if (unitPrice !== undefined) data.unitPrice = unitPrice ?? null;
    if (supplier !== undefined) data.supplier = supplier || null;
    if (location !== undefined) data.location = location || null;
    if (lastRestocked !== undefined)
      data.lastRestocked = lastRestocked ? new Date(lastRestocked) : null;
    if (notes !== undefined) data.notes = notes || null;

    const item = await db.inventoryItem.update({
      where: { id },
      data,
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { error: "Failed to update inventory item", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
