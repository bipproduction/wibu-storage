
import { verifyUserToken } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const root = path.join(process.cwd(), "uploads");

export const DELETE = (req: Request, { params }: { params: { id: string } }) =>
  verifyUserToken(req, async (user) => {
    try {
      const dir = await prisma.dir.findUnique({
        where: { id: params.id },
        include: {
          File: true, // Include files in this directory
          ChildDir: true // Include child directories
        }
      });

      if (!dir) {
        return new Response("Directory not found", { status: 404 });
      }

      // Recursively delete directories and files from the database
      await deleteDirAndContents(params.id);

      // Delete all files in the file system
      await deleteFilesFromFileSystem(dir.File);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Directory deleted successfully",
          data: null
        }),
        {
          status: 200
        }
      );
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  });

// Helper function to recursively delete directory and its contents from the database
async function deleteDirAndContents(dirId: string) {
  // Delete all files in the directory
  await prisma.files.deleteMany({
    where: { dirId }
  });

  // Find all child directories
  const children = await prisma.dir.findMany({
    where: { parentId: dirId } // parentId for child directories
  });

  // Recursively delete each child directory and its contents
  for (const child of children) {
    await deleteDirAndContents(child.id);
  }

  // Delete the directory itself
  await prisma.dir.delete({
    where: { id: dirId }
  });
}

// Helper function to delete files from the file system
async function deleteFilesFromFileSystem(files: { path: string | null }[]) {
  for (const file of files) {
    if (file.path) {
      const filePath = path.join(root, file.path);
      try {
        await fs.unlink(filePath); // Delete the file from the file system
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }
  }
}
