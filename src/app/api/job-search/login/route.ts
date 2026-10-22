import { NextResponse } from "next/server";
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/job-search/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  if (!verifyPassword(email, password)) {
    return NextResponse.redirect(
      new URL("/job-search/login?error=invalid", request.url),
      { status: 303 },
    );
  }

  const token = await createSessionToken(email.trim().toLowerCase());
  await setSessionCookie(token);
  return NextResponse.redirect(new URL("/job-search", request.url), {
    status: 303,
  });
}
