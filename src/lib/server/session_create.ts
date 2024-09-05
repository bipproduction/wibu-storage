import { cookies } from "next/headers";
import { libServer } from "../lib_server";
import { Prisma } from "@prisma/client";

export async function sessionCreate({ token }: { token: string }) {
  const cookie: any = {
    key: "ws_token",
    value: token,
    options: {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    },
  };

  cookies().set(cookie.key, cookie.value, { ...cookie.options });
  return token;
}
