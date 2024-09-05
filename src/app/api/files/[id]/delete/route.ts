import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
const root = path.join(process.cwd(), "uploads");

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const file = await prisma.files.delete({
    where: {
      id: params.id,
    },
  });

  if (!file) {
    return new Response("Not found", { status: 404 });
  }
  const filePath = path.join(root, file.path as string);
  await fs.unlink(filePath);

  return new Response(JSON.stringify(file));
}
