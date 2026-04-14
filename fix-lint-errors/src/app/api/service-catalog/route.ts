import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (category && category !== "All") where.category = category;
    if (status && status !== "All") where.status = status;

    const services = await db.serviceCatalog.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ services });
  } catch {
    return NextResponse.json({ error: "Failed to fetch services", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service = await db.serviceCatalog.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category || "General",
        icon: body.icon || "Package",
        status: body.status || "Active",
        estimatedTime: body.estimatedTime || "",
        approvalRequired: body.approvalRequired || false,
        formFields: body.formFields || "",
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create service", details: "An internal error occurred" }, { status: 500 });
  }
}
