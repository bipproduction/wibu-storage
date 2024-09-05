import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {

  const dir = await prisma.dir.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      parentId: true,
      ParentDir: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return new Response(JSON.stringify(dir));
}
