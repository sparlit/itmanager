// GET /api/staff - List staff with optional filters (department, role, status, search)
// Includes counts for assignedTickets, reportedTickets, assetAssignments
// POST /api/staff - Create a new staff member

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staffSchema, paginationSchema } from "@/lib/validations";
import { errorResponse, validationError } from "@/lib/error";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  const start = Date.now();
  
  try {
    const { searchParams } = request.nextUrl;
    const params = paginationSchema.parse({
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    const department = searchParams.get("department");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
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

    const [staff, total] = await Promise.all([
      db.staff.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          _count: {
            select: {
              assignedTickets: true,
              reportedTickets: true,
              assetAssignments: true,
            },
          },
        },
      }),
      db.staff.count({ where }),
    ]);

    logger.info({ duration: Date.now() - start, count: staff.length, total }, 'Staff list fetched');

    return NextResponse.json({ 
      staff,
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
    logger.error({ err, duration: Date.now() - start }, 'Failed to fetch staff');
    return errorResponse("Failed to fetch staff", 500);
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  
  try {
    const body = await request.json();
    const data = staffSchema.parse(body);

    const staffMember = await db.staff.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        department: data.department || "IT",
        role: data.role || "Staff",
        avatar: data.avatar || null,
        status: data.status || "Active",
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

    logger.info({ id: staffMember.id, email: staffMember.email, duration: Date.now() - start }, 'Staff member created');

    return NextResponse.json(staffMember, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return validationError(err);
    }
    logger.error({ err, duration: Date.now() - start }, 'Failed to create staff');
    return errorResponse("Failed to create staff member", 500);
  }
}
