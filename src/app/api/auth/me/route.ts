import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

import { unauthorized, serverError } from "@/lib/error";

export async function GET() {
  try {
    const tokenPayload = await getCurrentUser();
    
    if (!tokenPayload) {
      return unauthorized();
    }

    const user = await db.user.findUnique({
      where: { id: tokenPayload.userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return unauthorized();
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me API error:", error);
    return serverError();
  }
}
