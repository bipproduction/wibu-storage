// /api/files/delete/[dirId]/[name]
import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export const DELETE = (
  req: Request,
  { params }: { params: { dirId: string; name: string } }
) =>
  libServer.verifyUserToken(req, async (user) => {
    try {
      const { dirId, name } = params;
      if (!dirId || !name) {
        console.log("Bad Request Require id and name", { status: 400 });
        return new Response("Bad Request Require id and name", { status: 400 });
      }

      const findFile = await prisma.files.findFirst({
        where: {
          dirId,
          name
        }
      });

      if (!findFile) {
        return new Response("File or directory Not found", { status: 404 });
      }

      const file = await prisma.files.delete({
        where: {
          id: findFile.id
        }
      });

      if (!file) {
        return new Response("Error deleting file", { status: 404 });
      }

      const filePath = path.join(process.cwd(), "uploads", file.path as string);
      await fs.unlink(filePath);

      return new Response(JSON.stringify({ data: file }));
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  });
