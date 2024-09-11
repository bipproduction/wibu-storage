import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
const root = path.join(process.cwd(), "uploads");

export const POST = (
  req: Request,
  { params }: { params: { from: string; to: string } }
) =>
  libServer.verifyUserToken(req, async (user) => {
    try {
      const { fileId } = await req.json();
      const { from, to } = params;

      if (!fileId || !from || !to) {
        return new Response("Bad Request: missing required fields", {
          status: 400
        });
      }

      const [file, fromDir, toDir] = await Promise.all([
        prisma.files.findUnique({ where: { id: fileId } }),
        prisma.dir.findUnique({ where: { id: from } }),
        prisma.dir.findUnique({ where: { id: to } }),
      ]);

      if (!file || !fromDir || !toDir) {
        return new Response("File or directory not found", { status: 404 });
      }

      const toNewPath = await libServer.filePathGenerate(user.id, file.name);
      await fs.copyFile(path.join(root, file.path as string), toNewPath.fullPath);

      const copy = await prisma.files.create({
        data: {
          name: file.name,
          dirId: to,
          ext: file.ext,
          mime: file.mime,
          path: toNewPath.filePath,
          size: file.size,
          userId: user.id
        }
      });

      return new Response(JSON.stringify({ data: copy }));
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  });
