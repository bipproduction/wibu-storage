import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
// import { userDec } from "@/lib/user_dec";
import "colors";

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) =>
  libServer.verifyUserToken(req, async (user) => {
    const id = params.id === "root" ? null : params.id;
    const dirs = await prisma.dir.findMany({
      where: {
        userId: user!.id,
        parentId: id,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        userId: true,
        File: true,
      },
    });

    const files = await prisma.files.findMany({
      where: {
        dirId: id,
      },
    });

    return new Response(
      JSON.stringify({
        dirs,
        files,
      })
    );
  });

// export const GET = async (
//   req: Request,
//   { params }: { params: { id: string } }
// ) => {
//   const id = params.id === "root" ? null : params.id;
//   const user = await userDec(req);

//   //   if (!user) {
//   //     return new Response(JSON.stringify({ error: "list:  Unauthorized" }), {
//   //       status: 401,
//   //     });
//   //   }

//   const dirs = await prisma.dir.findMany({
//     where: {
//       userId: user!.id,
//       parentId: id,
//     },
//     select: {
//       id: true,
//       name: true,
//       parentId: true,
//       userId: true,
//       File: true,
//     },
//   });

//   const files = await prisma.files.findMany({
//     where: {
//       dirId: id,
//     },
//     select: {
//       id: true,
//       name: true,
//       dirId: true,
//       userId: true,
//     },
//   });

//   return new Response(
//     JSON.stringify({
//       dirs,
//       files,
//     })
//   );
// };
