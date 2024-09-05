import { Prisma } from "@prisma/client";
import { SignJWT } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
export async function encrypt({
  user,
  exp = "7 year",
}: {
  user: Prisma.UserGetPayload<{
    select: { id: true; name: true; email: true };
  }>;
  exp: string;
}) {
  return new SignJWT({ user } as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(encodedKey);
}
