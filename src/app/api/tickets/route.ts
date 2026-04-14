// GET /api/tickets - List tickets with optional filters (status, priority, category, search)
// POST /api/tickets - Create a new ticket

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticketSchema, paginationSchema } from "@/lib/validations";
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

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { reportedByName: { contains: search } },
      ];
    }

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          reporter: { select: { name: true } },
          assignee: { select: { name: true } },
          _count: { select: { comments: true } },
        },
      }),
      db.ticket.count({ where }),
    ]);

    logger.info({ duration: Date.now() - start, count: tickets.length, total }, 'Tickets fetched');

    return NextResponse.json({ 
      tickets,
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
    logger.error({ err, duration: Date.now() - start }, 'Failed to fetch tickets');
    return errorResponse("Failed to fetch tickets", 500);
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  
  try {
    const body = await request.json();
    const data = ticketSchema.parse(body);

    const {
      reportedByName,
      reportedById,
      reportedFromDepartment,
      reportDate,
      reportTime,
      assignedToName,
      assignedToId,
    } = body;

    // Resolve reporter by name or ID
    let reporterId = reportedById || null;
    if (!reporterId && reportedByName) {
      const match = await db.staff.findFirst({
        where: { name: { equals: reportedByName } },
        select: { id: true },
      });
      reporterId = match?.id || null;
    }

    // Resolve assignee by name or ID
    let assigneeId = assignedToId || null;
    if (!assigneeId && assignedToName) {
      const match = await db.staff.findFirst({
        where: { name: { equals: assignedToName } },
        select: { id: true },
      });
      assigneeId = match?.id || null;
    }

    const ticket = await db.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || "Medium",
        category: data.category || "",
        reportedBy: reporterId,
        reportedByName: reportedByName || "",
        reportedFromDepartment: reportedFromDepartment || "",
        reportDate: reportDate || "",
        reportTime: reportTime || "",
        assignedTo: assigneeId,
        assignedToName: assignedToName || null,
      },
      include: {
        reporter: { select: { name: true } },
        assignee: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    });

    logger.info({ id: ticket.id, title: ticket.title, duration: Date.now() - start }, 'Ticket created');

    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return validationError(err);
    }
    logger.error({ err, duration: Date.now() - start }, 'Failed to create ticket');
    return errorResponse("Failed to create ticket", 500);
  }
}
