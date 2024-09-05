import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const file = await prisma.files.update({
    where: {
      id: params.id,
    },
    data: body,
  });
  return new Response(JSON.stringify(file));
}
