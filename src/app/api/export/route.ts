import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatCost(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const num = Number(value);
  if (isNaN(num)) return '""';
  return num.toFixed(2);
}

function formatDate(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const date = new Date(String(value));
  if (isNaN(date.getTime())) return escapeCSV(String(value));
  return escapeCSV(date.toISOString());
}

function buildCSV(headers: string[], rows: unknown[][]): string {
  const lines: string[] = [];
  lines.push(headers.map(escapeCSV).join(","));
  for (const row of rows) {
    lines.push(row.map(escapeCSV).join(","));
  }
  return lines.join("\r\n");
}

function getFilename(type: string): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  return `${type}-export-${date}.csv`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Missing required query parameter: type" },
        { status: 400 }
      );
    }

    const validTypes = ["tickets", "assets", "inventory", "staff"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    let csv = "";
    let filename = "";

    switch (type) {
      case "tickets": {
        const tickets = await db.ticket.findMany({
          orderBy: { createdAt: "desc" },
        });
        const headers = [
          "Title",
          "Description",
          "Status",
          "Priority",
          "Category",
          "Reported By",
          "Department",
          "Assigned To",
          "Report Date",
          "Report Time",
          "Created At",
        ];
        const rows = tickets.map((t) => [
          t.title,
          t.description,
          t.status,
          t.priority,
          t.category,
          t.reportedByName || "",
          t.reportedFromDepartment,
          t.assignedToName || "",
          t.reportDate,
          t.reportTime,
          t.createdAt.toISOString(),
        ]);
        csv = buildCSV(headers, rows);
        filename = getFilename("tickets");
        break;
      }

      case "assets": {
        const assets = await db.asset.findMany({
          orderBy: { createdAt: "desc" },
        });
        const headers = [
          "Name",
          "Serial Number",
          "Category",
          "Status",
          "Condition",
          "Purchase Date",
          "Purchase Cost",
          "Warranty End",
          "Vendor",
          "Location",
          "Notes",
        ];
        const rows = assets.map((a) => [
          a.name,
          a.serialNumber,
          a.category,
          a.status,
          a.condition,
          a.purchaseDate ? a.purchaseDate.toISOString() : "",
          a.purchaseCost !== null ? formatCost(a.purchaseCost) : "",
          a.warrantyEnd ? a.warrantyEnd.toISOString() : "",
          a.vendor,
          a.location,
          a.notes,
        ]);
        csv = buildCSV(headers, rows);
        filename = getFilename("assets");
        break;
      }

      case "inventory": {
        const items = await db.inventoryItem.findMany({
          orderBy: { createdAt: "desc" },
        });
        const headers = [
          "Name",
          "SKU",
          "Category",
          "Quantity",
          "Min Stock Level",
          "Unit Price",
          "Supplier",
          "Location",
          "Notes",
          "Last Restocked",
        ];
        const rows = items.map((item) => [
          item.name,
          item.sku,
          item.category,
          item.quantity,
          item.minStockLevel,
          item.unitPrice !== null ? formatCost(item.unitPrice) : "",
          item.supplier,
          item.location,
          item.notes,
          item.lastRestocked ? item.lastRestocked.toISOString() : "",
        ]);
        csv = buildCSV(headers, rows);
        filename = getFilename("inventory");
        break;
      }

      case "staff": {
        const staffList = await db.staff.findMany({
          orderBy: { createdAt: "desc" },
        });
        const headers = [
          "Name",
          "Email",
          "Phone",
          "Department",
          "Role",
          "Status",
          "Join Date",
        ];
        const rows = staffList.map((s) => [
          s.name,
          s.email,
          s.phone,
          s.department,
          s.role,
          s.status,
          s.joinDate.toISOString(),
        ]);
        csv = buildCSV(headers, rows);
        filename = getFilename("staff");
        break;
      }
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
