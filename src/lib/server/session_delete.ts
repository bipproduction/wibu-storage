import { cookies } from "next/headers";

export function sessionDelete() {
    cookies().delete("ws_token");
  }