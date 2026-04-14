import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";
    const period = searchParams.get("period") || "30";

    let data;

    switch (type) {
      case "overview":
        const overview = await prisma.$queryRaw`
          SELECT 
            COUNT(*) as "totalRequests",
            COUNT(*) FILTER (WHERE status = 'Pending') as "pendingRequests",
            COUNT(*) FILTER (WHERE status = 'In Progress') as "inProgressRequests",
            COUNT(*) FILTER (WHERE status = 'Completed') as "completedRequests",
            COUNT(*) FILTER (WHERE status = 'Rejected') as "rejectedRequests"
          FROM "ServiceRequest"
        `;
        data = overview;
        break;

      case "by-service":
        const byService = await prisma.$queryRaw`
          SELECT 
            sc.name as "serviceName",
            sc.category,
            COUNT(sr.id) as "requestCount",
            COUNT(sr.id) FILTER (WHERE sr.status = 'Completed') as "completedCount"
          FROM "ServiceCatalog" sc
          LEFT JOIN "ServiceRequest" sr ON sc.id = sr."serviceId"
          GROUP BY sc.id, sc.name, sc.category
          ORDER BY "requestCount" DESC
        `;
        data = byService;
        break;

      case "by-category":
        const byCategory = await prisma.$queryRaw`
          SELECT 
            sc.category,
            COUNT(sr.id) as "requestCount",
            ROUND(COUNT(sr.id) * 100.0 / NULLIF(SUM(COUNT(sr.id)) OVER(), 0), 1) as "percentage"
          FROM "ServiceCatalog" sc
          LEFT JOIN "ServiceRequest" sr ON sc.id = sr."serviceId"
          GROUP BY sc.category
          ORDER BY "requestCount" DESC
        `;
        data = byCategory;
        break;

      case "by-user":
        const byUser = await prisma.$queryRaw`
          SELECT 
            "userName",
            "userEmail",
            COUNT(*) as "requestCount",
            COUNT(*) FILTER (WHERE status = 'Completed') as "completedCount"
          FROM "ServiceRequest"
          GROUP BY "userId", "userName", "userEmail"
          ORDER BY "requestCount" DESC
          LIMIT 20
        `;
        data = byUser;
        break;

      case "by-priority":
        const byPriority = await prisma.$queryRaw`
          SELECT 
            priority,
            COUNT(*) as "requestCount",
            COUNT(*) FILTER (WHERE status = 'Completed') as "completedCount"
          FROM "ServiceRequest"
          GROUP BY priority
          ORDER BY 
            CASE priority 
              WHEN 'Critical' THEN 1 
              WHEN 'High' THEN 2 
              WHEN 'Medium' THEN 3 
              ELSE 4 
            END
        `;
        data = byPriority;
        break;

      case "trends":
        const trends = await prisma.$queryRaw`
          SELECT 
            DATE("createdAt") as "date",
            COUNT(*) as "requestCount"
          FROM "ServiceRequest"
          WHERE "createdAt" >= NOW() - INTERVAL '${period} days'
          GROUP BY DATE("createdAt")
          ORDER BY "date" ASC
        `;
        data = trends;
        break;

      case "avg-resolution-time":
        const avgTime = await prisma.$queryRaw`
          SELECT 
            sc.name as "serviceName",
            AVG(EXTRACT(EPOCH FROM (sr."completedAt" - sr."createdAt")) / 3600) as "avgHours"
          FROM "ServiceRequest" sr
          LEFT JOIN "ServiceCatalog" sc ON sr."serviceId" = sc.id
          WHERE sr.status = 'Completed' AND sr."completedAt" IS NOT NULL
          GROUP BY sc.id, sc.name
          ORDER BY "avgHours" ASC
          LIMIT 10
        `;
        data = avgTime;
        break;

      default:
        data = [];
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to generate report", details: msg }, { status: 500 });
  }
}
