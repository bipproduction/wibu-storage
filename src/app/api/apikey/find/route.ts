
import { verifyUserToken } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const GET = (req: Request) => verifyUserToken(req, async (user) => {
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      userId: user.id,
    },
  });

  return new Response(JSON.stringify(apiKey));
});

// export async function GET(req: Request) {
//   const token = await verifyUserToken(req);
//   if (!token.user) {
//     return new Response(JSON.stringify({ error: token.message }), {
//       status: 401,
//     });
//   }
//   const apiKey = await prisma.apiKey.findFirst({
//     where: {
//       userId: token.user.id,
//     },
//   });

//   return new Response(JSON.stringify(apiKey));
// }
