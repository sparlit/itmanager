// PUT /api/staff/update?id=<staffId> - Update a staff member

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, phone, department, role, avatar, status } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone || null;
    if (department !== undefined) data.department = department;
    if (role !== undefined) data.role = role;
    if (avatar !== undefined) data.avatar = avatar || null;
    if (status !== undefined) data.status = status;

    const staffMember = await db.staff.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            assignedTickets: true,
            reportedTickets: true,
            assetAssignments: true,
          },
        },
      },
    });

    return NextResponse.json(staffMember);
  } catch {
    return NextResponse.json(
      { error: "Failed to update staff member", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
