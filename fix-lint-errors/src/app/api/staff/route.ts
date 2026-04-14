// GET /api/staff - List staff with optional filters (department, role, status, search)
// Includes counts for assignedTickets, reportedTickets, assetAssignments
// POST /api/staff - Create a new staff member

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const department = searchParams.get("department");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, any> = {};
    if (department) where.department = department;
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const staff = await db.staff.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ staff });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch staff", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, department, role, avatar, status } = body;

    const staffMember = await db.staff.create({
      data: {
        name,
        email,
        phone: phone || null,
        department: department || "IT",
        role: role || "Staff",
        avatar: avatar || null,
        status: status || "Active",
      },
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

    return NextResponse.json(staffMember, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create staff member", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
