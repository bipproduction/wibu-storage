import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { libServer } from "./lib/lib_server";

async function verifyToken(token: string) {
  try {
    const user = await libServer.decrypt({ token });
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/api/signin",
    "/api/signup",
    "/assets/img/bg.png",
  ];

  const publicPatterns = [/^\/api\/files\/\w+/];

  if (publicPatterns.some((pattern) => pattern.test(req.nextUrl.pathname))) {
    return handleCors(req, NextResponse.next());
  }

  if (publicRoutes.includes(req.nextUrl.pathname)) {
    const token = req.cookies.get("ws_token")?.value;

    if (!token) {
      return handleCors(req, NextResponse.next());
    }

    const user = await verifyToken(token!);
    if (!user) {
      return handleCors(req, NextResponse.next());
    }

    return handleCors(req, NextResponse.redirect(new URL("/user", req.nextUrl)));
  }

  // Handle API routes separately
  if (req.nextUrl.pathname.startsWith("/api")) {
    try {
      const token = req.headers.get("Authorization")?.split(" ")[1];
      if (!token) {
        return handleCors(
          req,
          new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          })
        );
      }

      const user = await verifyToken(token);
      if (!user) {
        return handleCors(
          req,
          new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          })
        );
      }

      return handleCors(req, NextResponse.next());
    } catch (error) {
      return handleCors(
        req,
        new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      );
    }
  }

  // Default behavior for other routes
  const token = req.cookies.get("ws_token")?.value;
  if (!token) {
    return handleCors(req, NextResponse.redirect(new URL("/auth/signin", req.url)));
  }

  const user = await verifyToken(token);
  if (!user) {
    return handleCors(req, NextResponse.redirect(new URL("/auth/signin", req.url)));
  }

  if (req.nextUrl.pathname === "/auth/signin" && user) {
    return handleCors(req, NextResponse.redirect(new URL("/user", req.url)));
  }

  return handleCors(req, NextResponse.next());
}

function handleCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("origin") || "*";
  
  // Set CORS headers
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Max-Age", "86400"); // Cache for 1 day
    return res;
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"], // Ignore Next.js internals and static files
};
