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

export const GET = async (
  req: Request,
  { params }: { params: { dirId: string; name: string } }
) => {
  if (!params.name || !params.dirId) {
    return new Response("Bad Request", { status: 400 });
  }
  const [name, size] = params.name.split("-size-");

  const fileData = await prisma.files.findFirst({
    where: {
      dirId: params.dirId,
      name: name
    }
  });

  // Jika file tidak ditemukan
  if (!fileData) {
    return new Response("File not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "uploads", fileData.path as string);

  try {
    const file = await fs.readFile(filePath);
    const mimeType = fileData.mime || "application/octet-stream"; // Default MIME type

    let currentSize = parseInt(size);
    if (currentSize > 2000) {
      currentSize = 2000;
    } else if (currentSize < 10) {
      currentSize = 10;
    }

    if (listImageMimeType.includes(fileData.mime as string) && size) {
      const image = sharp(file);
      const resized = image.resize({
        width: currentSize,
        fit: "contain"
      });

      return new Response(await resized.toBuffer(), {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${fileData.name}"`
        }
      });
    }

    return new Response(file, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileData.name}"`
      }
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return new Response("Error reading file", { status: 500 });
  }
};
