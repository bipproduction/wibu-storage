
import { verifyUserToken } from "@/lib/lib_server";
import prisma from "@/lib/prisma";

export const GET = async (
  req: Request,
  { params }: { params: { id: string; q: string; page?: string } }
) =>
  verifyUserToken(req, async (user) => {
    const { id, q, page = "1" } = params;
    const limit = "10";

    // Konversi page dan limit ke number
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Hitung offset berdasarkan page dan limit
    const offset = (pageNumber - 1) * limitNumber;

    // Ambil direktori dengan pagination
    const dirs = await prisma.dir.findMany({
      where: {
        parentId: id,
        name: {
          contains: q,
        },
        active: true,
      },
      skip: offset,
      take: limitNumber,
    });

    // Ambil file dengan pagination
    const files = await prisma.files.findMany({
      where: {
        dirId: id,
        name: {
          contains: q,
        },
        active: true,
      },
      skip: offset,
      take: limitNumber,
    });

    // Ambil total count untuk paginasi
    const totalDirs = await prisma.dir.count({
      where: {
        parentId: id,
        name: {
          contains: q,
        },
        active: true,
      },
    });

    const totalFiles = await prisma.files.count({
      where: {
        dirId: id,
        name: {
          contains: q,
        },
        active: true,
      },
    });

    const result = {
      data: {
        dirs,
        files,
      },
      pagination: {
        totalDirs,
        totalFiles,
        currentPage: pageNumber,
        limit: limitNumber,
        totalPagesDirs: Math.ceil(totalDirs / limitNumber),
        totalPagesFiles: Math.ceil(totalFiles / limitNumber),
      },
    };

    return new Response(JSON.stringify(result));
  });
