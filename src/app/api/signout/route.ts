import { cookies } from "next/headers";
export async function POST(req: Request) {
  cookies().delete("ws_token");
  return new Response("Signout successful", { status: 200 });
}
