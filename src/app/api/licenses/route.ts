import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status && status !== "All") where.status = status;
    if (category && category !== "All") where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { vendor: { contains: search } },
        { licenseKey: { contains: search } },
      ];
    }

    const licenses = await db.softwareLicense.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ licenses });
  } catch {
    return NextResponse.json({ error: "Failed to fetch licenses", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const license = await db.softwareLicense.create({
      data: {
        name: body.name,
        vendor: body.vendor,
        licenseKey: body.licenseKey || "",
        licenseType: body.licenseType,
        totalSeats: body.totalSeats,
        usedSeats: body.usedSeats || 0,
        status: body.status,
        category: body.category,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        autoRenew: body.autoRenew || false,
        cost: body.cost || null,
        assignedTo: body.assignedTo || "",
        notes: body.notes || "",
      },
    });

    return NextResponse.json({ license }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create license", details: "An internal error occurred" }, { status: 500 });
  }
}
