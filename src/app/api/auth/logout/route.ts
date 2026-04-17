import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  await clearAuthCookie();
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.delete("auth-token");
  return response;
}
