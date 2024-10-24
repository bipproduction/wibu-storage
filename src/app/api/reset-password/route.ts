import bcrypt from 'bcrypt';
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/server/decrypt";

export async function POST(req: Request) {
  const body = await req.json();
  const { code, password } = body;
  const user = await decrypt({ token: code });
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid code" }), {
      status: 401
    });
  }
  const hashedPassword = await bcrypt.hash(password as string, 10);
  const reset = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      password: hashedPassword
    }
  });
  if (!reset) {
    return new Response(JSON.stringify({ error: "Invalid code" }), {
      status: 401
    });
  }
  return new Response(
    JSON.stringify({ success: true, redirect: "/auth/signin" })
  );
}
