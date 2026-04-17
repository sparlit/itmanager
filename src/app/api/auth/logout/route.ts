import { NextResponse } from "next/server";
import { clearAuthCookie, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  await clearAuthCookie();
  response.cookies.set(AUTH_COOKIE_NAME, "", { expires: new Date(0) });
  return response;
}
