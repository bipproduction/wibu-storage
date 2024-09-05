import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const DELETE = (req: Request, { params }: { params: { id: string } }) =>
  libServer.verifyUserToken(req, async (user) => {
    const dir = await prisma.dir.delete({
      where: {
        id: params.id,
      },
    });

    return new Response(JSON.stringify(dir));
  });
// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { user, message } = await libServer.verifyUserToken(req);
//   if (!user) {
//     return new Response(JSON.stringify({ error: message }), {
//       status: 401,
//     });
//   }
//   const dir = await prisma.dir.delete({
//     where: {
//       id: params.id,
//     },
//   });

//   return new Response(JSON.stringify(dir));
// }
