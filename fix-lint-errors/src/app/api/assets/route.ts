// GET /api/assets - List assets with optional filters (status, category, search)
// Includes assignments with staff names and maintenance records
// POST /api/assets - Create a new asset

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, any> = {};
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

    const assets = await db.asset.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ assets });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch assets", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const asset = await db.asset.create({
      data: {
        name,
        serialNumber,
        category,
        status: status || "Available",
        condition: condition || "Good",
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ?? null,
        warrantyEnd: warrantyEnd ? new Date(warrantyEnd) : null,
        vendor: vendor || null,
        location: location || null,
        notes: notes || null,
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

    return NextResponse.json(asset, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create asset", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
