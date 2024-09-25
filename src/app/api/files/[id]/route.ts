import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const listImageMimeType = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/ico",
  "image/svg+xml"
];
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const [id, size] = params.id.split("-size-");

  // Cari file berdasarkan ID
  const fileData = await prisma.files.findUnique({
    where: {
      id: id
    }
  });

  // Jika file tidak ditemukan
  if (!fileData) {
    return new Response("File not found", { status: 404 });
  }

  // Cek apakah path file valid dan baca file dari system
  const filePath = path.join(process.cwd(), "uploads", fileData.path as string);

  try {
    const file = await fs.readFile(filePath);
    const mimeType = fileData.mime || "application/octet-stream"; // Default MIME type

    let currentSize = +size;
    if (currentSize > 2000) {
      currentSize = 2000;
    } else if (currentSize < 10) {
      currentSize = 10;
    }

    if (listImageMimeType.includes(fileData.mime as string) && size) {
      const image = sharp(file);

      image.rotate();
      const resized = image.resize({
        width: currentSize,
        position: "center",
        withoutEnlargement: true,
        fit: "cover"
      });

      return new Response(await resized.toBuffer(), {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${fileData.name}"`,
          "Cache-Control": "public, max-age=3600" // Cache file for 1 hour
        }
      });
    }

    return new Response(file, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileData.name}"`,
        "Cache-Control": "public, max-age=3600" // Cache file for 1 hour
      }
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return new Response("Error reading file", { status: 500 });
  }
}
