
import { verifyUserToken } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const PUT = (req: Request, { params }: { params: { id: string } }) =>
  verifyUserToken(req, async (user) => {
    const body = await req.json();
    const activate = await prisma.apiKey.update({
      where: {
        id: params.id,
      },
      data: {
        active: body.active,
      },
    });

    return new Response(JSON.stringify(activate));
  });
