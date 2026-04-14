// GET /api/vendors - List vendors with optional search query
// POST /api/vendors - Create a new vendor

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const vendors = await db.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ vendors });
  } catch {
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      contactPerson,
      email,
      phone,
      website,
      address,
      contractStart,
      contractEnd,
      rating,
      category,
      status,
      notes,
    } = body;

    const vendor = await db.vendor.create({
      data: {
        name,
        contactPerson: contactPerson || "",
        email: email || "",
        phone: phone || "",
        website: website || "",
        address: address || "",
        contractStart: contractStart ? new Date(contractStart) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        rating: rating ?? 0,
        category: category || "General",
        status: status || "Active",
        notes: notes || "",
      },
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}
