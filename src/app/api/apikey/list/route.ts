import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const GET = (req: Request) =>
  libServer.verifyUserToken(req, async (user) => {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: user.id,
      },
    });
    return new Response(JSON.stringify(apiKeys));
  });
// export async function GET(req: Request) {
//   const { user, message } = await libServer.verifyUserToken(req);
//   if (!user) {
//     return new Response(JSON.stringify({ error: message }), {
//       status: 401,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   const apiKeys = await prisma.apiKey.findMany({
//     where: {
//       userId: user.id,
//     },
//   });
//   return new Response(JSON.stringify(apiKeys));
// }
