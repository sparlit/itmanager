import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.$queryRaw`
      SELECT * FROM "ServiceCatalog" ORDER BY "sortOrder" ASC
    `;
    return NextResponse.json({ services });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch services", details: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, icon, status, estimatedTime, approvalRequired, sortOrder } = body;

    const id = `srv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.$queryRaw`
      INSERT INTO "ServiceCatalog" (id, name, description, category, icon, status, "estimatedTime", "approvalRequired", "sortOrder", "views", "requests", "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${description}, ${category || 'General'}, ${icon || 'Package'}, ${status || 'Active'}, ${estimatedTime || ''}, ${approvalRequired || false}, ${sortOrder || 0}, 0, 0, NOW(), NOW())
    `;

    return NextResponse.json({ service: { id, name, description } }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to create service", details: msg }, { status: 500 });
  }
}
