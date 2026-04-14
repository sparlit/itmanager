import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && status !== "All") where.status = status;

    const requests = await db.serviceCatalog.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: "Failed to fetch service requests", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const serviceRequest = await db.serviceCatalog.update({
      where: { id: body.serviceId },
      data: { requests: { increment: 1 } },
    });

    return NextResponse.json({ serviceRequest }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to submit service request" }, { status: 500 });
  }
}
