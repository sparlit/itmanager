import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = { deletedAt: null };
    if (category && category !== "All") where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { supplier: { contains: search } },
      ];
    }
    if (lowStock === "true") {
      where.quantity = { lte: db.inventoryItem.fields.minStockLevel };
    }

    const [items, total] = await Promise.all([
      db.inventoryItem.findMany({
        where,
        orderBy: { [sortBy]: sortOrder as "asc" | "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.inventoryItem.count({ where }),
    ]);

    const totalValue = items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0);
    const lowStockCount = items.filter((i) => i.quantity <= i.minStockLevel).length;

    return NextResponse.json({ items, total, page, limit, totalValue, lowStockCount });
  } catch {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, sku } = body;
    if (!name?.trim() || !category?.trim() || !sku?.trim()) {
      return NextResponse.json({ error: "Name, category, and SKU are required" }, { status: 400 });
    }

    const existing = await db.inventoryItem.findUnique({ where: { sku } });
    if (existing) return NextResponse.json({ error: "SKU already exists" }, { status: 409 });

    const item = await db.inventoryItem.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        sku: sku.trim().toUpperCase(),
        barcode: body.barcode || null,
        quantity: body.quantity ?? 0,
        minStockLevel: body.minStockLevel ?? 5,
        maxStockLevel: body.maxStockLevel || null,
        reorderQty: body.reorderQty || null,
        unitPrice: body.unitPrice || null,
        unitCost: body.unitCost || null,
        supplier: body.supplier || null,
        location: body.location || null,
        binLocation: body.binLocation || null,
        notes: body.notes || null,
        lastRestocked: body.quantity > 0 ? new Date() : null,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
