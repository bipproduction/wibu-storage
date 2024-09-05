import { Prisma } from "@prisma/client";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
export async function decrypt({ token }: { token: string }) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    const user = payload.user as Prisma.UserGetPayload<{
      select: { id: true; name: true; email: true };
    }>;

    return user;
  } catch (error) {
    console.log("===> Failed to verify session", error);
    return null;
  }
}
