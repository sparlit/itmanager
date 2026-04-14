import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const days = parseInt(searchParams.get("days") || "90");
    const includeExpired = searchParams.get("includeExpired") === "true";
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    const where: Record<string, unknown> = {
      warrantyEnd: {
        not: null,
        lte: futureDate,
        gte: includeExpired ? new Date("2000-01-01") : now,
      },
    };
    
    const assets = await db.asset.findMany({
      where,
      select: {
        id: true,
        name: true,
        serialNumber: true,
        category: true,
        status: true,
        warrantyEnd: true,
        purchaseCost: true,
      },
      orderBy: { warrantyEnd: "asc" },
    });
    
    const nowMs = now.getTime();
    const warranties = assets.map((a) => {
      const warrantyMs = new Date(a.warrantyEnd!).getTime();
      const daysRemaining = Math.floor((warrantyMs - nowMs) / (1000 * 60 * 60 * 24));
      
      return {
        id: a.id,
        name: a.name,
        serialNumber: a.serialNumber,
        category: a.category,
        status: a.status,
        warrantyEnd: a.warrantyEnd,
        daysRemaining,
        isExpired: daysRemaining < 0,
        isExpiringSoon: daysRemaining >= 0 && daysRemaining <= 30,
        purchaseCost: a.purchaseCost,
      };
    });
    
    const expired = warranties.filter((w) => w.isExpired);
    const expiringSoon = warranties.filter((w) => w.isExpiringSoon && !w.isExpired);
    const upcoming = warranties.filter((w) => !w.isExpired && !w.isExpiringSoon);
    
    return NextResponse.json({
      warranties,
      summary: {
        total: warranties.length,
        expired: expired.length,
        expiringSoon: expiringSoon.length,
        upcoming: upcoming.length,
        totalValue: warranties.reduce((sum, w) => sum + (w.purchaseCost || 0), 0),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch warranty data" },
      { status: 500 }
    );
  }
}
