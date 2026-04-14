import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { format, parseISO, addDays, isAfter, isBefore, startOfDay } from "date-fns";

export async function GET() {
  try {
    // Fetch all assets with warranty end dates
    const assets = await db.asset.findMany({
      where: { warrantyEnd: { not: null } },
      select: {
        id: true,
        name: true,
        category: true,
        warrantyEnd: true,
        serialNumber: true,
      },
    });

    // Fetch all maintenance records
    const maintenanceRecords = await db.maintenanceRecord.findMany({
      include: {
        asset: {
          select: { name: true, category: true },
        },
      },
    });

    // Fetch all critical and high priority tickets
    const tickets = await db.ticket.findMany({
      where: {
        priority: { in: ["Critical", "High"] },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        createdAt: true,
        category: true,
        reportDate: true,
      },
    });

    const now = startOfDay(new Date());
    const thirtyDaysLater = addDays(now, 30);

    const events: Array<{
      id: string;
      title: string;
      date: string;
      type: "warranty" | "maintenance" | "review";
      description: string;
      relatedId: string;
      relatedType: string;
      color: string;
    }> = [];

    // Warranty events (only include warranties that haven't expired more than 90 days ago)
    const ninetyDaysAgo = addDays(now, -90);
    for (const asset of assets) {
      if (!asset.warrantyEnd) continue;
      const warrantyDate = parseISO(asset.warrantyEnd.toISOString());
      const warrantyEndDay = startOfDay(warrantyDate);
      // Show warranties ending within next 30 days or that ended within last 90 days
      if (
        isBefore(warrantyEndDay, thirtyDaysLater) &&
        isAfter(warrantyEndDay, ninetyDaysAgo)
      ) {
        const daysRemaining = Math.ceil(
          (warrantyEndDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const status =
          daysRemaining <= 0
            ? "EXPIRED"
            : daysRemaining <= 14
              ? "EXPIRING SOON"
              : `Expires in ${daysRemaining} days`;

        events.push({
          id: `warranty-${asset.id}`,
          title: `${asset.name} Warranty`,
          date: format(warrantyDate, "yyyy-MM-dd"),
          type: "warranty",
          description: `${asset.category} · SN: ${asset.serialNumber} · ${status}`,
          relatedId: asset.id,
          relatedType: "asset",
          color: "#f43f5e",
        });
      }
    }

    // Maintenance events
    for (const record of maintenanceRecords) {
      const perfDate = parseISO(record.performedAt.toISOString());
      // Only show maintenance from the last 6 months
      const sixMonthsAgo = addDays(now, -180);
      if (isAfter(perfDate, sixMonthsAgo)) {
        events.push({
          id: `maintenance-${record.id}`,
          title: `Maintenance: ${record.asset.name}`,
          date: format(perfDate, "yyyy-MM-dd"),
          type: "maintenance",
          description: `${record.type} · ${record.description.substring(0, 80)}${record.description.length > 80 ? "..." : ""}`,
          relatedId: record.assetId,
          relatedType: "asset",
          color: "#0ea5e9",
        });
      }
    }

    // Critical/High priority ticket review events
    for (const ticket of tickets) {
      const createdDate = ticket.reportDate && ticket.reportDate.trim()
        ? parseISO(ticket.reportDate.includes("T") ? ticket.reportDate : `${ticket.reportDate}T00:00:00`)
        : parseISO(ticket.createdAt.toISOString());
      const ticketDay = startOfDay(createdDate);
      // Only show tickets from the last 3 months
      const threeMonthsAgo = addDays(now, -90);
      if (isAfter(ticketDay, threeMonthsAgo)) {
        events.push({
          id: `review-${ticket.id}`,
          title: ticket.title,
          date: format(ticketDay, "yyyy-MM-dd"),
          type: "review",
          description: `${ticket.priority} Priority · ${ticket.category} · ${ticket.status}`,
          relatedId: ticket.id,
          relatedType: "ticket",
          color: "#f59e0b",
        });
      }
    }

    // Sort events by date descending
    events.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
