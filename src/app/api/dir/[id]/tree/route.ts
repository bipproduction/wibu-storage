import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const GET = async (req: Request) =>
  libServer.verifyUserToken(req, async (user) => {
    const data = await prisma.dir.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        name: true,
        parentId: true
      }
    });

    // Create a map of directories keyed by id (without lodash)
    const directoryMap: { [key: string]: any } = {};
    data.forEach((item) => {
      directoryMap[item.id] = item;
    });

    // Initialize an empty array for the root nodes
    const directoryTree: any[] = [];

    // Step 2: Iterate over the data to create the tree structure
    data.forEach((item) => {
      if (item.parentId) {
        // If the item has a parent, add it to the parent's children array
        const parent = directoryMap[item.parentId];
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          // Ensure no duplication in children
          if (!parent.children.some((child: any) => child.id === item.id)) {
            parent.children.push(item);
          }
        }
      } else {
        // If the item has no parent, it is a root node
        directoryTree.push(item);
      }
    });

    return new Response(JSON.stringify({ data: directoryTree }));
  });
