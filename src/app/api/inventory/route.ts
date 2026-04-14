import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryItemSchema, paginationSchema } from "@/lib/validations";
import { errorResponse, validationError } from "@/lib/error";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const start = Date.now();
  
  try {
    const { searchParams } = request.nextUrl;
    const params = paginationSchema.parse({
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock");
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

    const [items, total] = await Promise.all([
      db.inventoryItem.findMany({
        where,
        orderBy: { [sortBy]: sortOrder as "asc" | "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      db.inventoryItem.count({ where }),
    ]);

    const totalValue = items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0);

    logger.info({ duration: Date.now() - start, count: items.length, total }, 'Inventory fetched');

    return NextResponse.json({ 
      items, 
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
      totalValue 
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return validationError(err);
    }
    logger.error({ err, duration: Date.now() - start }, 'Failed to fetch inventory');
    return errorResponse("Failed to fetch inventory", 500);
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  
  try {
    const body = await request.json();
    const data = inventoryItemSchema.parse(body);

    // Check SKU uniqueness before creating
    const existing = await db.inventoryItem.findUnique({ where: { sku: data.sku } });
    if (existing) {
      return errorResponse("SKU already exists", 409);
    }

    const item = await db.inventoryItem.create({
      data: {
        name: data.name.trim(),
        category: data.category.trim(),
        sku: data.sku.trim().toUpperCase(),
        barcode: data.barcode || null,
        quantity: data.quantity ?? 0,
        minStockLevel: data.minStockLevel ?? 5,
        maxStockLevel: data.maxStockLevel || null,
        reorderQty: data.reorderQty || null,
        unitPrice: data.unitPrice || null,
        unitCost: data.unitCost || null,
        supplier: data.supplier || null,
        location: data.location || null,
        binLocation: data.binLocation || null,
        notes: data.notes || null,
        lastRestocked: (data.quantity ?? 0) > 0 ? new Date() : null,
      },
    });

    logger.info({ id: item.id, sku: item.sku, duration: Date.now() - start }, 'Inventory item created');

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return validationError(err);
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return errorResponse("SKU already exists", 409);
    }
    logger.error({ err, duration: Date.now() - start }, 'Failed to create inventory item');
    return errorResponse("Failed to create item", 500);
  }
}
