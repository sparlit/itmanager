import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { notifyITGroup, formatServiceRequestNotification } from "@/lib/whatsapp";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "my-requests";

    let requests;
    
    if (view === "my-requests" || user.role !== "admin") {
      requests = await prisma.$queryRaw`
        SELECT sr.*, sc.name as "serviceName", sc.category as "serviceCategory", sc.icon as "serviceIcon"
        FROM "ServiceRequest" sr
        LEFT JOIN "ServiceCatalog" sc ON sr."serviceId" = sc.id
        WHERE sr."userId" = ${user.userId}
        ORDER BY sr."createdAt" DESC
      `;
    } else {
      requests = await prisma.$queryRaw`
        SELECT sr.*, sc.name as "serviceName", sc.category as "serviceCategory", sc.icon as "serviceIcon"
        FROM "ServiceRequest" sr
        LEFT JOIN "ServiceCatalog" sc ON sr."serviceId" = sc.id
        ORDER BY sr."createdAt" DESC
      `;
    }
    
    return NextResponse.json({ requests });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch requests", details: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.$queryRaw`SELECT name, email FROM "User" WHERE id = ${user.userId}` as { name: string; email: string }[];
    const userInfo = dbUser[0] || { name: user.username, email: "" };

    const body = await request.json();
    const { serviceId, priority, notes, deliveryLocation, preferredDate } = body;

    const service = await prisma.$queryRaw`SELECT name FROM "ServiceCatalog" WHERE id = ${serviceId}` as { name: string }[];
    if (!service || service.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNotes = `Notes: ${notes || 'N/A'}\nLocation: ${deliveryLocation || 'N/A'}\nPreferred Date: ${preferredDate || 'N/A'}`;
    
    await prisma.$queryRaw`
      INSERT INTO "ServiceRequest" (id, "serviceId", "userId", "userName", "userEmail", status, priority, notes, "createdAt", "updatedAt")
      VALUES (${requestId}, ${serviceId}, ${user.userId}, ${userInfo.name}, ${userInfo.email}, 'Pending', ${priority || 'Medium'}, ${fullNotes}, NOW(), NOW())
    `;

    await prisma.$queryRaw`
      UPDATE "ServiceCatalog" SET requests = requests + 1 WHERE id = ${serviceId}
    `;

    const notificationMessage = formatServiceRequestNotification(
      requestId,
      service[0].name,
      userInfo.name,
      priority || "Medium",
      fullNotes
    );
    notifyITGroup(notificationMessage).catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: "Service request submitted successfully",
      requestId
    }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Service request error:", msg);
    return NextResponse.json({ error: "Failed to submit service request", details: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, status, priority, assignedTo, assignedToName, resolution } = body;

    if (status === "Completed" || status === "Rejected") {
      await prisma.$queryRaw`
        UPDATE "ServiceRequest" SET 
          status = COALESCE(${status}, status), 
          priority = COALESCE(${priority}, priority), 
          "assignedTo" = COALESCE(${assignedTo}, "assignedTo"),
          "assignedToName" = COALESCE(${assignedToName}, "assignedToName"),
          resolution = COALESCE(${resolution}, resolution), 
          "completedAt" = NOW(), 
          "updatedAt" = NOW() 
        WHERE id = ${requestId}
      `;
    } else {
      await prisma.$queryRaw`
        UPDATE "ServiceRequest" SET 
          status = COALESCE(${status}, status), 
          priority = COALESCE(${priority}, priority), 
          "assignedTo" = COALESCE(${assignedTo}, "assignedTo"),
          "assignedToName" = COALESCE(${assignedToName}, "assignedToName"),
          resolution = COALESCE(${resolution}, resolution), 
          "updatedAt" = NOW() 
        WHERE id = ${requestId}
      `;
    }

    return NextResponse.json({ success: true, message: "Request updated" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to update request", details: msg }, { status: 500 });
  }
}
