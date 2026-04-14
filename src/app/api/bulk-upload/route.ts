import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  staff: {
    name: "name",
    email: "email",
    phone: "phone",
    department: "department",
    role: "role",
    status: "status",
  },
  assets: {
    name: "name",
    serialNumber: "serialNumber",
    category: "category",
    status: "status",
    condition: "condition",
    vendor: "vendor",
    location: "location",
    notes: "notes",
  },
  inventory: {
    name: "name",
    category: "category",
    sku: "sku",
    quantity: "quantity",
    minStockLevel: "minStockLevel",
    unitPrice: "unitPrice",
    supplier: "supplier",
    location: "location",
  },
  tickets: {
    title: "title",
    description: "description",
    status: "status",
    priority: "priority",
    category: "category",
    reportedByName: "reportedByName",
    assignedToName: "assignedToName",
  },
  vendors: {
    name: "name",
    contactPerson: "contactPerson",
    email: "email",
    phone: "phone",
    website: "website",
    address: "address",
    category: "category",
    status: "status",
    notes: "notes",
  },
  licenses: {
    name: "name",
    vendor: "vendor",
    licenseKey: "licenseKey",
    licenseType: "licenseType",
    totalSeats: "totalSeats",
    status: "status",
    category: "category",
    cost: "cost",
    notes: "notes",
  },
  "knowledge-base": {
    title: "title",
    content: "content",
    category: "category",
    tags: "tags",
    author: "author",
    status: "status",
  },
  backups: {
    name: "name",
    type: "type",
    status: "status",
    location: "location",
    notes: "notes",
  },
  budgets: {
    name: "name",
    department: "department",
    fiscalYear: "fiscalYear",
    totalBudget: "totalBudget",
    category: "category",
    status: "status",
    notes: "notes",
  },
  notifications: {
    title: "title",
    message: "message",
    type: "type",
    userId: "userId",
    userName: "userName",
  },
};

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });
    rows.push(row);
  }

  return { headers, rows };
}

function coerceValue(value: string, prismaType: string): unknown {
  if (!value || value === "") return null;
  if (prismaType === "Int") return parseInt(value, 10);
  if (prismaType === "Float") return parseFloat(value);
  if (prismaType === "Boolean") return value.toLowerCase() === "true";
  if (prismaType === "DateTime") return new Date(value);
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const dryRun = formData.get("dryRun") === "true";

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
    }

    const mappings = FIELD_MAPPINGS[type];
    if (!mappings) {
      return NextResponse.json({ error: `Unsupported type: ${type}` }, { status: 400 });
    }

    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data rows found" }, { status: 400 });
    }

    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const data: Record<string, unknown> = {};

        for (const [csvField, modelField] of Object.entries(mappings)) {
          if (row[csvField] !== undefined && row[csvField] !== "") {
            // Get the Prisma model type for coercion
            const model = getModelForType(type);
            if (model) {
              const fieldDef = model[modelField];
              if (fieldDef) {
                data[modelField] = coerceValue(row[csvField], fieldDef.type);
              } else {
                data[modelField] = row[csvField];
              }
            } else {
              data[modelField] = row[csvField];
            }
          }
        }

        if (!dryRun) {
          await createRecord(type, data);
        }
        results.success++;
      } catch (err: unknown) {
        results.failed++;
        const message = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Row ${i + 2}: ${message}`);
      }
    }

    return NextResponse.json({
      type,
      totalRows: rows.length,
      ...results,
      dryRun,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json({ error: "Missing type parameter" }, { status: 400 });
  }

  const mappings = FIELD_MAPPINGS[type];
  if (!mappings) {
    return NextResponse.json({ error: `Unsupported type: ${type}` }, { status: 400 });
  }

  // Generate sample CSV template
  const headers = Object.keys(mappings).join(",");
  const sampleRow = Object.values(mappings)
    .map((v) => `"${v}"`)
    .join(",");

  return new Response(`${headers}\n${sampleRow}`, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}-template.csv"`,
    },
  });
}

function getModelForType(type: string): Record<string, { type: string }> | null {
  const models: Record<string, Record<string, { type: string }>> = {
    staff: {
      name: { type: "String" },
      email: { type: "String" },
      phone: { type: "String" },
      department: { type: "String" },
      role: { type: "String" },
      status: { type: "String" },
    },
    assets: {
      name: { type: "String" },
      serialNumber: { type: "String" },
      category: { type: "String" },
      status: { type: "String" },
      condition: { type: "String" },
      vendor: { type: "String" },
      location: { type: "String" },
      notes: { type: "String" },
    },
    inventory: {
      name: { type: "String" },
      category: { type: "String" },
      sku: { type: "String" },
      quantity: { type: "Int" },
      minStockLevel: { type: "Int" },
      unitPrice: { type: "Float" },
      supplier: { type: "String" },
      location: { type: "String" },
    },
    tickets: {
      title: { type: "String" },
      description: { type: "String" },
      status: { type: "String" },
      priority: { type: "String" },
      category: { type: "String" },
      reportedByName: { type: "String" },
      assignedToName: { type: "String" },
    },
    vendors: {
      name: { type: "String" },
      contactPerson: { type: "String" },
      email: { type: "String" },
      phone: { type: "String" },
      website: { type: "String" },
      address: { type: "String" },
      category: { type: "String" },
      status: { type: "String" },
      notes: { type: "String" },
    },
    licenses: {
      name: { type: "String" },
      vendor: { type: "String" },
      licenseKey: { type: "String" },
      licenseType: { type: "String" },
      totalSeats: { type: "Int" },
      status: { type: "String" },
      category: { type: "String" },
      cost: { type: "Float" },
      notes: { type: "String" },
    },
    "knowledge-base": {
      title: { type: "String" },
      content: { type: "String" },
      category: { type: "String" },
      tags: { type: "String" },
      author: { type: "String" },
      status: { type: "String" },
    },
    backups: {
      name: { type: "String" },
      type: { type: "String" },
      status: { type: "String" },
      location: { type: "String" },
      notes: { type: "String" },
    },
    budgets: {
      name: { type: "String" },
      department: { type: "String" },
      fiscalYear: { type: "Int" },
      totalBudget: { type: "Float" },
      category: { type: "String" },
      status: { type: "String" },
      notes: { type: "String" },
    },
    notifications: {
      title: { type: "String" },
      message: { type: "String" },
      type: { type: "String" },
      userId: { type: "String" },
      userName: { type: "String" },
    },
  };
  return models[type] || null;
}

async function createRecord(type: string, data: Record<string, unknown>) {
  switch (type) {
    case "staff":
      await prisma.staff.create({ data: data as Prisma.StaffCreateInput });
      break;
    case "assets":
      await prisma.asset.create({ data: data as Prisma.AssetCreateInput });
      break;
    case "inventory":
      await prisma.inventoryItem.create({ data: data as Prisma.InventoryItemCreateInput });
      break;
    case "tickets":
      await prisma.ticket.create({ data: data as Prisma.TicketCreateInput });
      break;
    case "vendors":
      await prisma.vendor.create({ data: data as Prisma.VendorCreateInput });
      break;
    case "licenses":
      await prisma.softwareLicense.create({ data: data as Prisma.SoftwareLicenseCreateInput });
      break;
    case "knowledge-base":
      await prisma.knowledgeBaseArticle.create({ data: data as Prisma.KnowledgeBaseArticleCreateInput });
      break;
    case "backups":
      await prisma.backupRecord.create({ data: data as Prisma.BackupRecordCreateInput });
      break;
    case "budgets":
      await prisma.budget.create({ data: data as Prisma.BudgetCreateInput });
      break;
    case "notifications":
      await prisma.notification.create({ data: data as Prisma.NotificationCreateInput });
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}
