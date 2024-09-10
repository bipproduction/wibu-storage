import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import _ from "lodash";

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

    const directoryMap = _.keyBy(data, "id");

    // Step 2: Iterate over the data to create the tree structure
    const directoryTree = [];

    data.forEach((item) => {
      if (item.parentId) {
        // If the item has a parent, add it to the parent's children array
        const parent: any = directoryMap[item.parentId];
        parent.children = parent.children || [];
        parent.children.push(item);
      } else {
        // If the item has no parent, it is a root node
        directoryTree.push(item);
      }
    });

    return new Response(JSON.stringify({ data }));
  });

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const data = await prisma.dir.findMany({
//     where: {
//         userId: params.id
//     },
//     select: {
//       id: true,
//       name: true
//     }
//   });

//   const data2 = _.groupBy(data, "id");

//   return new Response(JSON.stringify({ data: data2 }));
// }
