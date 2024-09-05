import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import _ from "lodash";
import moment from "moment";
import path from "path";
const root = path.join(process.cwd(), "uploads");

// Batas ukuran file dalam byte (100 MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export const POST = (req: Request) =>
  libServer.verifyUserToken(req, async (user) => {
    try {
      const form = await req.formData();
      const dirId = form.get("dirId") as string;
      const file = form.get("file") as File;

      if (!file) {
        return new Response("No file", { status: 400 });
      }

      // Daftar MIME types yang diizinkan
      const allowedMimeTypes = [
        "image/png",
        "image/jpeg",
        "image/gif",
        "text/csv",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      // Validasi MIME type
      if (!allowedMimeTypes.includes(file.type)) {
        return new Response("Unsupported file type", { status: 400 });
      }

      // Validasi ukuran file
      if (file.size > MAX_FILE_SIZE) {
        return new Response("File is too large", { status: 400 });
      }

      const createdAt = moment().format("YYYY-MM-DD");
      const ext = path.extname(file.name);
      const baseFileName = _.kebabCase(path.basename(file.name, ext));
      let fileName = baseFileName + ext;
      let filePath = path.join(
        root,
        user.id,
        createdAt.replace(/-/g, "/"),
        fileName
      );

      // Periksa jika nama file sudah ada, tambahkan penanda unik
      let counter = 1;
      while (await fileExists(filePath)) {
        fileName = `${baseFileName}-${counter}${ext}`;
        filePath = path.join(
          root,
          user.id,
          createdAt.replace(/-/g, "/"),
          fileName
        );
        counter++;
      }

      // Buat entri file di database
      await prisma.files.create({
        data: {
          userId: user.id,
          dirId: dirId,
          ext: ext,
          mime: file.type,
          size: file.size,
          name: fileName,
          path: `${user.id}/${createdAt.replace(/-/g, "/")}/${fileName}`,
          createdAt: new Date(),
        },
      });

      // Buat direktori jika belum ada
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Konversi ArrayBuffer ke Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Tulis file ke sistem
      await fs.writeFile(filePath, buffer);

      return new Response(filePath, { status: 201 });
    } catch (error) {
      console.error("Error during file upload:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  });

// export async function POST(req: Request) {

//   try {
//     const form = await req.formData();
//     const dirId = form.get("dirId") as string;
//     const file = form.get("file") as File;

//     if (!file) {
//       return new Response("No file", { status: 400 });
//     }

//     // Daftar MIME types yang diizinkan
//     const allowedMimeTypes = [
//       "image/png",
//       "image/jpeg",
//       "image/gif",
//       "text/csv",
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "text/plain",
//     ];

//     // Validasi MIME type
//     if (!allowedMimeTypes.includes(file.type)) {
//       return new Response("Unsupported file type", { status: 400 });
//     }

//     // Validasi ukuran file
//     if (file.size > MAX_FILE_SIZE) {
//       return new Response("File is too large", { status: 400 });
//     }

//     const createdAt = moment().format("YYYY-MM-DD");
//     const ext = path.extname(file.name);
//     const baseFileName = _.kebabCase(path.basename(file.name, ext));
//     let fileName = baseFileName + ext;
//     let filePath = path.join(
//       root,
//       user.id,
//       createdAt.replace(/-/g, "/"),
//       fileName
//     );

//     // Periksa jika nama file sudah ada, tambahkan penanda unik
//     let counter = 1;
//     while (await fileExists(filePath)) {
//       fileName = `${baseFileName}-${counter}${ext}`;
//       filePath = path.join(
//         root,
//         user.id,
//         createdAt.replace(/-/g, "/"),
//         fileName
//       );
//       counter++;
//     }

//     // Buat entri file di database
//     await prisma.files.create({
//       data: {
//         userId: user.id,
//         dirId: dirId,
//         ext: ext,
//         mime: file.type,
//         size: file.size,
//         name: fileName,
//         path: `${user.id}/${createdAt.replace(/-/g, "/")}/${fileName}`,
//         createdAt: new Date(),
//       },
//     });

//     // Buat direktori jika belum ada
//     await fs.mkdir(path.dirname(filePath), { recursive: true });

//     // Konversi ArrayBuffer ke Buffer
//     const buffer = Buffer.from(await file.arrayBuffer());

//     // Tulis file ke sistem
//     await fs.writeFile(filePath, buffer);

//     return new Response(filePath, { status: 201 });
//   } catch (error) {
//     console.error("Error during file upload:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }

// Fungsi untuk memeriksa apakah file sudah ada
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
