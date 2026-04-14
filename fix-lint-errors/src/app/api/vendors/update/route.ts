// PUT /api/vendors/update - Update vendor fields

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, contactPerson, email, phone, website, address, contractStart, contractEnd, rating, category, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (contactPerson !== undefined) data.contactPerson = contactPerson;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (website !== undefined) data.website = website;
    if (address !== undefined) data.address = address;
    if (contractStart !== undefined) data.contractStart = contractStart ? new Date(contractStart) : null;
    if (contractEnd !== undefined) data.contractEnd = contractEnd ? new Date(contractEnd) : null;
    if (rating !== undefined) data.rating = Number(rating);
    if (category !== undefined) data.category = category;
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const vendor = await db.vendor.update({
      where: { id },
      data,
    });

    return NextResponse.json({ vendor });
  } catch {
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}
