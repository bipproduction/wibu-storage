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

  