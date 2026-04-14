import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  await clearAuthCookie();
  response.cookies.set("auth-token", "", { expires: new Date(0) });
  return response;
}
