import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";


const listImageMimeType = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/ico", "image/svg+xml"];
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

  // Cek apakah path file valid dan baca file dari sistem
  const filePath = path.join(process.cwd(), "uploads", fileData.path as string);

  try {
    const file = await fs.readFile(filePath);
    const mimeType = fileData.mime || "application/octet-stream"; // Default MIME type

    if(listImageMimeType.includes(fileData.mime as string) && size) {
      const image = sharp(file);
      const resized = image.resize({
        width: parseInt(size),
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
}
