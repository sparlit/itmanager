import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ---------- types ----------

type NotificationType = "critical" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl: string | null;
}

// ---------- helpers ----------

let idCounter = 0;
function uid(): string {
  return `notif-${Date.now()}-${++idCounter}`;
}

/**
 * Simple human-readable time-ago description.
 * Returns something like "3 days ago", "5 hours ago", etc.
 */
function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const absDiff = Math.abs(diffMs);

  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------- GET ----------

export async function GET() {
  try {
    const notifications: Notification[] = [];

    // ───────────────────────────────────────────────
    // 1. Low Stock Alerts  (type: "warning")
    //    Cross-column comparison: fetch all, filter in JS
    // ───────────────────────────────────────────────
    const allInventoryItems = await db.inventoryItem.findMany();
    const lowStockItems = allInventoryItems.filter(
      (item) => item.quantity < item.minStockLevel
    );

    for (const item of lowStockItems) {
      notifications.push({
        id: uid(),
        type: "warning",
        title: "Low Stock Alert",
        description: `${item.name} — only ${item.quantity} left (min: ${item.minStockLevel})`,
        timestamp: item.updatedAt.toISOString(),
        read: false,
        actionUrl: "inventory",
      });
    }

    // ───────────────────────────────────────────────
    // 2. Critical Tickets  (type: "critical")
    // ───────────────────────────────────────────────
    const criticalTickets = await db.ticket.findMany({
      where: {
        priority: "Critical",
        status: { notIn: ["Resolved", "Closed"] },
      },
    });

    for (const ticket of criticalTickets) {
      notifications.push({
        id: uid(),
        type: "critical",
        title: "Critical Ticket",
        description: `${ticket.title} — ${ticket.status}`,
        timestamp: ticket.createdAt.toISOString(),
        read: false,
        actionUrl: `ticket-detail?id=${ticket.id}`,
      });
    }

    // ───────────────────────────────────────────────
    // 3. Overdue Tickets  (type: "warning")
    //    Tickets "Open" or "In Progress" created >72 h ago
    // ───────────────────────────────────────────────
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

    const overdueTickets = await db.ticket.findMany({
      where: {
        status: { in: ["Open", "In Progress"] },
        createdAt: { lt: seventyTwoHoursAgo },
      },
    });

    for (const ticket of overdueTickets) {
      notifications.push({
        id: uid(),
        type: "warning",
        title: "Overdue Ticket",
        description: `${ticket.title} — created ${timeAgo(ticket.createdAt)}`,
        timestamp: ticket.createdAt.toISOString(),
        read: false,
        actionUrl: `ticket-detail?id=${ticket.id}`,
      });
    }

    // ───────────────────────────────────────────────
    // 4. Warranty Expiring Soon  (type: "info")
    //    Assets with warrantyEnd within next 30 days
    // ───────────────────────────────────────────────
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + thirtyDaysMs);

    const expiringAssets = await db.asset.findMany({
      where: {
        warrantyEnd: { not: null, gte: now, lte: thirtyDaysFromNow },
      },
    });

    for (const asset of expiringAssets) {
      // warrantyEnd is guaranteed non-null here
      const warrantyEnd = asset.warrantyEnd!;
      notifications.push({
        id: uid(),
        type: "info",
        title: "Warranty Expiring Soon",
        description: `${asset.name} — expires ${formatDate(warrantyEnd)}`,
        timestamp: now.toISOString(),
        read: false,
        actionUrl: `asset-detail?id=${asset.id}`,
      });
    }

    // ───────────────────────────────────────────────
    // 5. New Unassigned Tickets  (type: "info")
    // ───────────────────────────────────────────────
    const unassignedTickets = await db.ticket.findMany({
      where: {
        status: "Open",
        assignedTo: null,
      },
    });

    for (const ticket of unassignedTickets) {
      notifications.push({
        id: uid(),
        type: "info",
        title: "Unassigned Ticket",
        description: `${ticket.title} — needs assignment`,
        timestamp: ticket.createdAt.toISOString(),
        read: false,
        actionUrl: `ticket-detail?id=${ticket.id}`,
      });
    }

    // ───────────────────────────────────────────────
    // Sort by timestamp descending, limit to 20
    // ───────────────────────────────────────────────
    notifications.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const limited = notifications.slice(0, 20);
    const unreadCount = limited.filter((n) => !n.read).length;

    return NextResponse.json({ notifications: limited, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const notification = await db.notification.create({
      data: {
        userId: body.userId || "system",
        userName: body.userName || "System",
        title: body.title,
        message: body.message || body.description || "",
        type: body.type || "info",
        link: body.actionUrl || body.link || "",
      },
    });
    return NextResponse.json({ notification }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
