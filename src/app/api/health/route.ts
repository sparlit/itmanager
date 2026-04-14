import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const userCount = await db.user.count();
    return NextResponse.json({ 
      status: "ok", 
      db: "connected", 
      users: userCount 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "error", 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}