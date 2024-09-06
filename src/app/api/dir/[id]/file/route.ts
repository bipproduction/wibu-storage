import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const GET = (req: Request, { params }: { params: { id: string } }) =>
  libServer.verifyUserToken(req, async (user) => {
    const files = await prisma.files.findMany({
      where: {
        dirId: params.id,
      },
    });
    return new Response(JSON.stringify(files));
  });
