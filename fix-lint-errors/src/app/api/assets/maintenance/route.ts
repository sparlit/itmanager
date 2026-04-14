// POST /api/assets/maintenance - Create a maintenance record for an asset

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, type, description, performedBy, cost } = body;

    if (!assetId || !type || !description || !performedBy) {
      return NextResponse.json(
        {
          error:
            "assetId, type, description, and performedBy are required",
        },
        { status: 400 }
      );
    }

    const record = await db.maintenanceRecord.create({
      data: {
        assetId,
        type,
        description,
        performedBy,
        cost: cost ?? null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to create maintenance record",
        details: "An internal error occurred",
      },
      { status: 500 }
    );
  }
}
