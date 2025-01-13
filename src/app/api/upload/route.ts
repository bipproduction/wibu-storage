import { filePathGenerate, listMimeTypes, verifyUserToken } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import backendLogger from "@/util/backend-logger";
import fs from "fs/promises";
import path from "path";

// Batas ukuran file dalam byte (100 MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export const POST = (req: Request) =>
  verifyUserToken(req, async (user) => {
    try {
      const form = await req.formData();
      const dirId = form.get("dirId") as string;
      const file = form.get("file") as File;

      if (!dirId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "dirId is required"
          }),
          { status: 400 }
        );
      }

      if (!file) {
        return new Response("No file", { status: 400 });
      }

      // Daftar MIME types yang diizinkan
      const allowedMimeTypes = listMimeTypes;

      // Validasi MIME type
      if (!allowedMimeTypes.includes(file.type)) {
        return new Response("Unsupported file type", { status: 400 });
      }

      // Validasi ukuran file
      if (file.size > MAX_FILE_SIZE) {
        return new Response("File is too large", { status: 400 });
      }


      const pathGenerate = await filePathGenerate(user.id, file.name);

      backendLogger.info("UPLOAD : ", pathGenerate);

      // Buat entri file di database
      const uploadFile = await prisma.files.create({
        data: {
          userId: user.id,
          dirId: dirId,
          ext: pathGenerate.ext,
          mime: file.type,
          size: file.size,
          name: pathGenerate.name,
          path: pathGenerate.filePath,
          createdAt: new Date()
        }
      });

      // Buat direktori jika belum ada
      await fs.mkdir(path.dirname(pathGenerate.fullPath), { recursive: true });

      // Konversi ArrayBuffer ke Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Tulis file ke system
      await fs.writeFile(pathGenerate.fullPath, buffer);

      return new Response(
        JSON.stringify({
          data: uploadFile
        }),
        { status: 201 }
      );
    } catch (error) {
      backendLogger.error("POST /api/upload", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  });
