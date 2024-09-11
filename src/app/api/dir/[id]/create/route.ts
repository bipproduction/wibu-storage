import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import "colors";

export const POST = (req: Request, { params }: { params: { id: string } }) =>
  libServer.verifyUserToken(req, async (user) => {
    const id = params.id === "root" ? null : params.id;
    let { name } = await req.json();

    if (!name) {
      return new Response(JSON.stringify({ error: "name is required" }), {
        status: 400,
      });
    }

    // Check if a directory with the same name already exists for this user
    const existingDirs = await prisma.dir.findMany({
      where: {
        userId: user.id,
        parentId: id,
        name: {
          startsWith: name,
        },
      },
    });

    // If a directory with the same name exists, generate a unique name
    if (existingDirs.length > 0) {
      const baseName = name;
      let newName = baseName;
      let copyCount = 1;

      // Check if the new name exists; if it does, increment the copy count and try again
      while (existingDirs.some((dir) => dir.name === newName)) {
        newName = `${baseName} (copy ${copyCount})`;
        copyCount++;
      }

      name = newName;
    }

    // Create the new directory with the (possibly modified) name
    const create = await prisma.dir.create({
      data: { name, parentId: id, userId: user.id } as any,
    });

    console.log(create);

    return new Response(JSON.stringify({ data: create }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });
