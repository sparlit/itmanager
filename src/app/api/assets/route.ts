// GET /api/assets - List assets with optional filters (status, category, search)
// Includes assignments with staff names and maintenance records
// POST /api/assets - Create a new asset

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assetSchema, paginationSchema } from "@/lib/validations";
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

    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { serialNumber: { contains: search } },
        { vendor: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const [assets, total] = await Promise.all([
      db.asset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          assignments: {
            include: { staff: { select: { name: true } } },
            orderBy: { assignedAt: "desc" },
          },
          maintenance: {
            orderBy: { performedAt: "desc" },
          },
        },
      }),
      db.asset.count({ where }),
    ]);

    logger.info({ duration: Date.now() - start, count: assets.length, total }, 'Assets fetched');

    return NextResponse.json({ 
      assets,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      }
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return validationError(err);
    }
    logger.error({ err, duration: Date.now() - start }, 'Failed to fetch assets');
    return errorResponse("Failed to fetch assets", 500);
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  
  try {
    const body = await request.json();
    const data = assetSchema.parse(body);

    const asset = await db.asset.create({
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        category: data.category,
        status: data.status || "Available",
        condition: data.condition || "Good",
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchaseCost: data.purchaseCost ?? null,
        warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
        vendor: data.vendor || null,
        location: data.location || null,
        notes: data.notes || null,
      },
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

    logger.info({ id: asset.id, name: asset.name, duration: Date.now() - start }, 'Asset created');

    return NextResponse.json(asset, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return validationError(err);
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return errorResponse("Asset with this serial number already exists", 400);
    }
    logger.error({ err, duration: Date.now() - start }, 'Failed to create asset');
    return errorResponse("Failed to create asset", 500);
  }
}
