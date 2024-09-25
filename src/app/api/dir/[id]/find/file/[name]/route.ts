import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const GET = (
  req: Request,
  { params }: { params: { id: string; name: string } }
) =>
  libServer.verifyUserToken(req, async (user) => {
    if (!params.name || !params.id || params.id === "root") {
      return new Response("Bad Request", { status: 400 });
    }

    const files = await prisma.files.findFirst({
      where: {
        dirId: params.id,
        name: params.name
      }
    });
    return new Response(
      JSON.stringify({
        data: files
      })
    );
  });
