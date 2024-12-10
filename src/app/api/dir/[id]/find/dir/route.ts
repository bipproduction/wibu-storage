
import { verifyUserToken } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const GET = (req: Request, { params }: { params: { id: string } }) =>
  verifyUserToken(req, async (user) => {
    const dir = await prisma.dir.findUnique({
      where: {
        id: params.id
      },
      select: {
        id: true,
        name: true,
        parentId: true
      }
    });

    return new Response(JSON.stringify({ data: dir }));
  });
