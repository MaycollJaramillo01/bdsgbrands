import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";

// Refreshes the admin session before /admin server components render. Public pages stay static.
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  await updateSession({ requestCookies: request.cookies, responseCookies: response.cookies });
  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
