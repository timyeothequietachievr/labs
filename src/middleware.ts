import { NextRequest, NextResponse } from "next/server";

/** Subdomain that should open the Meeting Planner at `/`. */
const MEETING_HOSTS = new Set([
  "meetingdatetime.thequietachievr.com",
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (!MEETING_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = "/meeting-planner";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts|downloads).*)"],
};
