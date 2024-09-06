import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const PUT = (req: Request, { params }: { params: { id: string } }) =>
  libServer.verifyUserToken(req, async (user) => {
    const body = await req.json();
    const rename = await prisma.apiKey.update({
      where: {
        id: params.id,
      },
      data: {
        name: body.name,
      },
    });

    return new Response(JSON.stringify(rename));
  });
