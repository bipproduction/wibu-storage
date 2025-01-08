
import { verifyUserToken } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import "colors";

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) =>
  verifyUserToken(req, async (user) => {
    const id = params.id === "root" ? null : params.id;
    const dirs = await prisma.dir.findMany({
      where: {
        userId: user!.id,
        parentId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        userId: true,
        File: true,
      },
    });

    const files = await prisma.files.findMany({
      where: {
        dirId: id,
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    return new Response(
      JSON.stringify({
        dirs,
        files,
      })
    );
  });
