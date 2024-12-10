import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Types
interface User {
  id: string;
  email: string;
  name: string;
}

// Constants
const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/api/signin",
  "/api/signup",
  "/assets/img/bg.png",
  "/auth/forgot-password",
  "/api/forgot-password",
  "/api/reset-password",
  "/api/logs"
] as string[];

const PUBLIC_PATTERNS = [
  /^\/api\/files\/\w+/,
  /^\/auth\/reset-password\/\w+/
] as const;

// Configuration
const secretKey = process.env.NEXT_PUBLIC_SESSION_SECRET;
if (!secretKey) {
  throw new Error("NEXT_PUBLIC_SESSION_SECRET is not defined");
}
const encodedKey = new TextEncoder().encode(secretKey);

// JWT Functions
async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload.user as User;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function encrypt({
  user,
  exp = "7 year",
}: {
  user: User;
  exp: string;
}) {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(encodedKey);
}

// CORS Handler
function handleCors(req: NextRequest, res: NextResponse): NextResponse {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  const allowedMethods = "GET, POST, PUT, DELETE, OPTIONS";
  const allowedHeaders = "Content-Type, Authorization";

  res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set("Access-Control-Allow-Methods", allowedMethods);
  res.headers.set("Access-Control-Allow-Headers", allowedHeaders);

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": allowedMethods,
        "Access-Control-Allow-Headers": allowedHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return res;
}

// Unauthorized Response Helper
function createUnauthorizedResponse(message = "Unauthorized") {
  return new NextResponse(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

// Middleware
export async function middleware(req: NextRequest) {
  // Check public patterns
  if (PUBLIC_PATTERNS.some((pattern) => pattern.test(req.nextUrl.pathname))) {
    return handleCors(req, NextResponse.next());
  }

  // Handle public routes
  if (PUBLIC_ROUTES.includes(req.nextUrl.pathname)) {
    const token = req.cookies.get("ws_token")?.value;
    if (!token) {
      return handleCors(req, NextResponse.next());
    }

    const user = await verifyToken(token);
    if (!user) {
      return handleCors(req, NextResponse.next());
    }

    return handleCors(
      req,
      NextResponse.redirect(new URL("/user", req.nextUrl))
    );
  }

  // Handle API routes
  if (req.nextUrl.pathname.startsWith("/api")) {
    try {
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.startsWith("Bearer ") 
        ? authHeader.slice(7) 
        : null;

      if (!token) {
        return handleCors(
          req,
          createUnauthorizedResponse("Missing authorization token")
        );
      }

      const user = await verifyToken(token);
      if (!user) {
        return handleCors(
          req,
          createUnauthorizedResponse("Invalid token")
        );
      }

      // Add user to request headers for downstream use
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email);

      return handleCors(
        req,
        NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      );
    } catch (error) {
      console.error("API route error:", error);
      return handleCors(
        req,
        createUnauthorizedResponse("Authentication failed")
      );
    }
  }

  // Handle protected routes
  const token = req.cookies.get("ws_token")?.value;
  if (!token) {
    return handleCors(
      req,
      NextResponse.redirect(new URL("/auth/signin", req.url))
    );
  }

  const user = await verifyToken(token);
  if (!user) {
    return handleCors(
      req,
      NextResponse.redirect(new URL("/auth/signin", req.url))
    );
  }

  // Prevent authenticated users from accessing auth pages
  if (req.nextUrl.pathname.startsWith("/auth/") && user) {
    return handleCors(
      req,
      NextResponse.redirect(new URL("/user", req.url))
    );
  }

  return handleCors(req, NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};