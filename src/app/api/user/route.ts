import prisma from "@/lib/prisma";
import "colors";

export async function GET(req: Request) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  const apikey = await prisma.apiKey.findUnique({
    where: {
      api_key: token,
      active: true,
    },
    include: {
      User: true,
    },
  });
  const user = apikey?.User;
  return new Response(JSON.stringify({ user }));
}
