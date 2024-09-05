import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const files = await prisma.files.findMany({
    where: {
      dirId: params.id,
    },
  });
  return new Response(JSON.stringify(files));
}
