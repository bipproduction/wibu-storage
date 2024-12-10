import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/server/decrypt";
import backendLogger from '@/util/backend-logger';

export async function POST(req: Request) {
  const body = await req.json();
  const { code, password } = body;
  const user = await decrypt({ token: code });
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid code" }), {
      status: 401
    });
  }

  const reset = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      password: password
    }
  });
  if (!reset) {
    backendLogger.error("Reset password failed");
    return new Response(JSON.stringify({ error: "Invalid code" }), {
      status: 401
    });
  }
  backendLogger.info("Reset password success");
  return new Response(
    JSON.stringify({ success: true, redirect: "/auth/signin" })
  );
}
