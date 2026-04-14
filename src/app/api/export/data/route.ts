import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedModule = searchParams.get("module");
    
    const modules = selectedModule ? [selectedModule] : [
      "staff", "assets", "inventory", "tickets", "vendors", 
      "licenses", "knowledgeBase", "serviceCatalog", "users"
    ];
    
    const exportData: {
      exportedAt: string;
      version: "1.0";
      modules: Record<string, unknown>;
    } = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      modules: {},
    };
    
    for (const mod of modules) {
      switch (mod) {
        case "staff":
          exportData.modules.staff = await db.staff.findMany({ orderBy: { createdAt: "desc" } });
          break;
        case "assets":
          exportData.modules.assets = await db.asset.findMany({ orderBy: { createdAt: "desc" } });
          break;
        case "inventory":
          exportData.modules.inventoryItem = await db.inventoryItem.findMany({ orderBy: { createdAt: "desc" } });
          break;
        case "tickets":
          exportData.modules.tickets = await db.ticket.findMany({ orderBy: { createdAt: "desc" } });
          break;
        case "vendors":
          exportData.modules.vendors = await db.vendor.findMany({ orderBy: { createdAt: "desc" } });
          break;
        case "licenses":
          exportData.modules.licenses = await db.softwareLicense.findMany({ orderBy: { createdAt: "desc" } });
          break;
        case "knowledgeBase":
          exportData.modules.knowledgeBase = await db.knowledgeBaseArticle.findMany({ orderBy: { createdAt: "desc" } });
          break;
        case "serviceCatalog":
          exportData.modules.serviceCatalog = await db.serviceCatalog.findMany({ orderBy: { createdAt: "desc" } });
          break;
        case "users":
          exportData.modules.users = await db.user.findMany({ select: { id: true, username: true, email: true, name: true, role: true, isActive: true } });
          break;
      }
    }
    
    const jsonStr = JSON.stringify(exportData, null, 2);
    return new NextResponse(jsonStr, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="itmanager-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (err) {
    console.error("Backup export error:", err);
    return NextResponse.json({ error: "Failed to export backup" }, { status: 500 });
  }
}
