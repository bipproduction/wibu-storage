import { authorization } from "@/lib/autorization";
import prisma from "@/lib/prisma";
import { queryParse } from "@/lib/query";
import { userDec } from "@/lib/user_dec";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const user = await userDec(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body: Prisma.DirCreateInput = await req.json();
  // Check if a directory with the same name already exists for this user
  const existingDirs = await prisma.dir.findMany({
    where: {
      userId: user.id,
      name: {
        startsWith: body.name,
      },
    },
  });

  // If a directory with the same name exists, generate a unique name
  if (existingDirs.length > 0) {
    const baseName = body.name;
    let newName = baseName;
    let copyCount = 1;

    // Check if the new name exists; if it does, increment the copy count and try again
    while (existingDirs.some((dir) => dir.name === newName)) {
      newName = `${baseName} (copy ${copyCount})`;
      copyCount++;
    }

    body.name = newName;
  }

  // Create the new directory with the (possibly modified) name
  const create = await prisma.dir.create({
    data: { ...body, userId: user.id } as any,
  });

  return new Response(JSON.stringify({ ...create }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = async (req: Request) => {
  const user = await userDec(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const search = new URL(req.url).searchParams;
  const where = queryParse<Prisma.DirWhereInput>(search.toString());
  const dir = await prisma.dir.findMany({
    where: {
      userId: user.id,
      parentId: where.parentId === "null" ? null : where.parentId,
    },
  });

  return new Response(JSON.stringify(dir));
};

export const DELETE = async (req: Request) => {
  const where = JSON.parse(req.headers.get("x-where")!).where;
  const dir = await prisma.dir.delete({
    where: {
      id: where.id,
    },
  });
  return new Response(JSON.stringify(dir));
};

export const PUT = async (req: Request) => {
  // const user = await userDec(req);
  const body: Prisma.DirUpdateInput = await req.json();
  if (!body.id) {
    return new Response(JSON.stringify({ error: "id is required" }));
  }
  const dir = await prisma.dir.update({
    where: {
      id: body.id as string,
    },
    data: body,
  });
  return new Response(JSON.stringify(dir));
};
