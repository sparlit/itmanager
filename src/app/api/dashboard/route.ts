// GET /api/dashboard - Returns comprehensive dashboard statistics
// Aggregates data from staff, assets, inventory, and tickets modules

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const fortyEightHoursAgo = new Date(
      Date.now() - 48 * 60 * 60 * 1000
    );
    const warrantyCutoff = new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    );

    // Run all independent queries in parallel
    const [
      staffTotal,
      staffActive,
      assets,
      inventoryItems,
      tickets,
      recentTickets,
      recentComments,
      recentTransactions,
      staffWorkloadTickets,
    ] = await Promise.all([
      db.staff.count(),
      db.staff.count({ where: { status: "Active" } }),
      db.asset.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          category: true,
          warrantyEnd: true,
        },
      }),
      db.inventoryItem.findMany({
        select: {
          id: true,
          name: true,
          quantity: true,
          minStockLevel: true,
          unitPrice: true,
        },
      }),
      db.ticket.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          category: true,
          createdAt: true,
          assignedTo: true,
          resolvedAt: true,
        },
      }),
      db.ticket.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { name: true } },
          assignee: { select: { name: true } },
          _count: { select: { comments: true } },
        },
      }),
      db.ticketComment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          authorName: true,
          createdAt: true,
          ticketId: true,
        },
      }),
      db.inventoryTransaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          item: { select: { name: true, sku: true } },
        },
      }),
      db.ticket.findMany({
        where: {
          status: { in: ["Open", "In Progress"] },
          assignedTo: { not: null },
        },
        include: {
          assignee: { select: { name: true } },
        },
      }),
    ]);

    // Compute staff counts
    const staffCount = { total: staffTotal, active: staffActive };

    // Compute asset counts by status and category
    const assetStatusCounts: Record<string, number> = {};
    const assetCategoryCounts: Record<string, number> = {};
    for (const asset of assets) {
      assetStatusCounts[asset.status] =
        (assetStatusCounts[asset.status] || 0) + 1;
      assetCategoryCounts[asset.category] =
        (assetCategoryCounts[asset.category] || 0) + 1;
    }
    const assetCount = {
      total: assets.length,
      inUse: assetStatusCounts["In Use"] || 0,
      available: assetStatusCounts["Available"] || 0,
      underMaintenance: assetStatusCounts["Under Maintenance"] || 0,
      byCategory: assetCategoryCounts,
      byStatus: assetStatusCounts,
    };

    // Compute inventory counts
    const lowStockItems = inventoryItems.filter(
      (item) => item.quantity < item.minStockLevel
    );
    const inventoryCount = {
      total: inventoryItems.length,
      lowStock: lowStockItems.length,
    };

    // Compute ticket counts by status, priority, and category
    const ticketStatusCounts: Record<string, number> = {};
    const ticketPriorityCounts: Record<string, number> = {};
    const ticketCategoryCounts: Record<string, number> = {};
    for (const ticket of tickets) {
      ticketStatusCounts[ticket.status] =
        (ticketStatusCounts[ticket.status] || 0) + 1;
      ticketPriorityCounts[ticket.priority] =
        (ticketPriorityCounts[ticket.priority] || 0) + 1;
      ticketCategoryCounts[ticket.category] =
        (ticketCategoryCounts[ticket.category] || 0) + 1;
    }
    const ticketCount = {
      byStatus: ticketStatusCounts,
      byPriority: ticketPriorityCounts,
      byCategory: ticketCategoryCounts,
      total: tickets.length,
    };

    // Build recent activity from recent tickets and comments
    const recentActivity = [
      ...recentTickets.map((t) => ({
        id: t.id,
        type: "ticket" as const,
        description: `Ticket "${t.title}" created by ${t.reporter?.name ?? "Unknown"}`,
        createdAt: t.createdAt,
      })),
      ...recentComments.map((c) => ({
        id: c.id,
        type: "comment" as const,
        description: `${c.authorName} commented on a ticket`,
        createdAt: c.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    // ─────────────────────────────────────────────
    // 1. SLA Metrics
    // ─────────────────────────────────────────────
    const resolvedTickets = tickets.filter((t) => t.resolvedAt);
    let avgResolutionHours = 0;
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, t) => {
        const diffMs =
          new Date(t.resolvedAt!).getTime() -
          new Date(t.createdAt).getTime();
        return sum + Math.max(0, diffMs) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedTickets.length) * 100) / 100;
    }

    const overdueTickets = tickets.filter(
      (t) =>
        (t.status === "Open" || t.status === "In Progress") &&
        new Date(t.createdAt) < fortyEightHoursAgo
    );

    const slaMetrics = {
      avgResolutionHours,
      overdueTicketCount: overdueTickets.length,
    };

    // ─────────────────────────────────────────────
    // 2. Inventory Value
    // ─────────────────────────────────────────────
    let totalInventoryValue = 0;
    const itemValues = inventoryItems
      .filter((item) => item.unitPrice !== null)
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice!,
        totalValue: item.unitPrice! * item.quantity,
      }));

    totalInventoryValue = itemValues.reduce(
      (sum, iv) => sum + iv.totalValue,
      0
    );

    const top5ValuableItems = [...itemValues]
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    const inventoryValue = {
      totalValue: Math.round(totalInventoryValue * 100) / 100,
      top5Items: top5ValuableItems,
    };

    // ─────────────────────────────────────────────
    // 3. Ticket Aging
    // ─────────────────────────────────────────────
    const now = Date.now();
    const ticketAging = {
      "0-24h": 0,
      "24-72h": 0,
      "3-7d": 0,
      "7d+": 0,
    };

    for (const ticket of tickets) {
      // Only count non-resolved tickets for aging
      if (ticket.status === "Resolved" || ticket.status === "Closed") continue;

      const ageMs = Math.max(0, now - new Date(ticket.createdAt).getTime());
      const ageHours = ageMs / (1000 * 60 * 60);

      if (ageHours < 24) {
        ticketAging["0-24h"]++;
      } else if (ageHours < 72) {
        ticketAging["24-72h"]++;
      } else if (ageHours < 168) {
        // 7 days = 168 hours
        ticketAging["3-7d"]++;
      } else {
        ticketAging["7d+"]++;
      }
    }

    // ─────────────────────────────────────────────
    // 4. Staff Workload
    // ─────────────────────────────────────────────
    const workloadMap: Record<
      string,
      { staffId: string; staffName: string; ticketCount: number }
    > = {};

    for (const ticket of staffWorkloadTickets) {
      const sid = ticket.assignedTo!;
      if (!workloadMap[sid]) {
        workloadMap[sid] = {
          staffId: sid,
          staffName: ticket.assignee?.name || "Unknown",
          ticketCount: 0,
        };
      }
      workloadMap[sid].ticketCount++;
    }

    const staffWorkload = Object.values(workloadMap)
      .sort((a, b) => b.ticketCount - a.ticketCount)
      .slice(0, 5);

    // ─────────────────────────────────────────────
    // 5. Upcoming Warranties (within 90 days)
    // ─────────────────────────────────────────────
    const upcomingWarranties = assets
      .filter(
        (a) =>
          a.warrantyEnd !== null &&
          new Date(a.warrantyEnd) <= warrantyCutoff &&
          new Date(a.warrantyEnd) >= new Date(now)
      )
      .sort(
        (a, b) =>
          new Date(a.warrantyEnd!).getTime() -
          new Date(b.warrantyEnd!).getTime()
      )
      .map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        status: a.status,
        warrantyEnd: a.warrantyEnd,
      }));

    // ─────────────────────────────────────────────
    // 6. Recent Inventory Transactions
    // ─────────────────────────────────────────────
    const recentTransactionsData = recentTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      quantity: tx.quantity,
      performedBy: tx.performedBy,
      notes: tx.notes,
      item: {
        name: tx.item.name,
        sku: tx.item.sku,
      },
      createdAt: tx.createdAt,
    }));

    return NextResponse.json({
      staffCount,
      assetCount,
      inventoryCount,
      ticketCount,
      recentTickets,
      recentActivity,
      // New enhanced fields
      slaMetrics,
      inventoryValue,
      ticketAging,
      staffWorkload,
      upcomingWarranties,
      recentTransactions: recentTransactionsData,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
