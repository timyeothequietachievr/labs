import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/job-search/auth";

export async function POST(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/job-search/login", request.url), {
    status: 303,
  });
}
