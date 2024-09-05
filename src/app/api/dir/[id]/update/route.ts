import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body: Prisma.DirUpdateInput = await req.json();
  const dir = await prisma.dir.update({
    where: {
      id: params.id,
    },
    data: body,
  });
  return new Response(JSON.stringify(dir));
}
